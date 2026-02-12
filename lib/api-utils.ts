/**
 * Centralized API utilities for standardized responses and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  createErrorResponse,
  logError,
} from "./errors";

// Standard API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Create success response
export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>["meta"],
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  );
}

// Create error response from various error types
export function errorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse<ApiErrorResponse> {
  const errorRes = createErrorResponse(error);

  // Handle Zod validation errors specially
  if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const path = err.path.join(".");
      acc[path] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          statusCode: 400,
          details,
        },
      },
      { status: 400 }
    );
  }

  // Use the default message for unknown errors in production
  if (process.env.NODE_ENV === "production" && !(error instanceof AppError)) {
    errorRes.error.message = defaultMessage;
  }

  return NextResponse.json(errorRes, { status: errorRes.error.statusCode });
}

// Quick error response helpers
export function badRequest(message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message,
        statusCode: 400,
        details,
      },
    },
    { status: 400 }
  );
}

export function unauthorized(message: string = "Authentication required") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
        statusCode: 401,
      },
    },
    { status: 401 }
  );
}

export function forbidden(message: string = "Access denied") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FORBIDDEN",
        message,
        statusCode: 403,
      },
    },
    { status: 403 }
  );
}

export function notFound(message: string = "Resource not found") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message,
        statusCode: 404,
      },
    },
    { status: 404 }
  );
}

export function conflict(message: string = "Resource conflict") {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "CONFLICT",
        message,
        statusCode: 409,
      },
    },
    { status: 409 }
  );
}

export function rateLimited(
  message: string = "Too many requests",
  retryAfter?: number
) {
  const headers: HeadersInit = {};
  if (retryAfter) {
    headers["Retry-After"] = String(retryAfter);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message,
        statusCode: 429,
        details: retryAfter ? { retryAfter } : undefined,
      },
    },
    { status: 429, headers }
  );
}

export function serverError(
  message: string = "Internal server error",
  error?: unknown
) {
  // Log the error
  if (error) {
    logError(error);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: process.env.NODE_ENV === "production" ? message : String(error),
        statusCode: 500,
      },
    },
    { status: 500 }
  );
}

// Parse and validate request body with Zod schema
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new ValidationError("Invalid JSON body");
  }
}

// Get query parameters with type safety
export function getQueryParams(request: NextRequest): URLSearchParams {
  return request.nextUrl.searchParams;
}

// Parse pagination parameters
export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export function getPaginationParams(
  request: NextRequest,
  defaultPageSize: number = 20,
  maxPageSize: number = 100
): PaginationParams {
  const params = getQueryParams(request);

  let page = parseInt(params.get("page") || "1", 10);
  if (isNaN(page) || page < 1) page = 1;

  let pageSize = parseInt(params.get("pageSize") || String(defaultPageSize), 10);
  if (isNaN(pageSize) || pageSize < 1) pageSize = defaultPageSize;
  if (pageSize > maxPageSize) pageSize = maxPageSize;

  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

// Parse sort parameters
export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function getSortParams(
  request: NextRequest,
  allowedFields: string[],
  defaultField: string = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): SortParams {
  const params = getQueryParams(request);

  let sortBy = params.get("sortBy") || defaultField;
  if (!allowedFields.includes(sortBy)) {
    sortBy = defaultField;
  }

  let sortOrder = params.get("sortOrder") as "asc" | "desc";
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    sortOrder = defaultOrder;
  }

  return { sortBy, sortOrder };
}

// API route handler wrapper with error handling
export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse<ApiResponse<T>>>;

export function withErrorHandling<T>(
  handler: ApiHandler<T>,
  defaultErrorMessage?: string
): ApiHandler<T> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Handle specific error types
      if (error instanceof ZodError) {
        return errorResponse(error) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof ValidationError) {
        return badRequest(error.message, {
          field: error.field,
          value: error.value,
        }) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof AuthenticationError) {
        return unauthorized(error.message) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof AuthorizationError) {
        return forbidden(error.message) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof NotFoundError) {
        return notFound(error.message) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof RateLimitError) {
        return rateLimited(
          error.message,
          error.retryAfter
        ) as NextResponse<ApiResponse<T>>;
      }

      if (error instanceof AppError) {
        return errorResponse(error) as NextResponse<ApiResponse<T>>;
      }

      // Log unexpected errors
      logError(error);

      return serverError(
        defaultErrorMessage,
        error
      ) as NextResponse<ApiResponse<T>>;
    }
  };
}

// CORS headers for API routes
export function corsHeaders(origin?: string): HeadersInit {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
  const requestOrigin = origin || "*";

  const isAllowed =
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(requestOrigin) ||
    process.env.NODE_ENV === "development";

  return {
    "Access-Control-Allow-Origin": isAllowed ? requestOrigin : "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Handle OPTIONS requests for CORS preflight
export function handleCorsOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin") || undefined;
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

// Add cache headers
export function withCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    private?: boolean;
    noStore?: boolean;
  } = {}
): NextResponse {
  const {
    maxAge = 0,
    sMaxAge,
    staleWhileRevalidate,
    private: isPrivate = false,
    noStore = false,
  } = options;

  if (noStore) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  }

  const parts: string[] = [];

  if (isPrivate) {
    parts.push("private");
  } else {
    parts.push("public");
  }

  parts.push(`max-age=${maxAge}`);

  if (sMaxAge !== undefined) {
    parts.push(`s-maxage=${sMaxAge}`);
  }

  if (staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  response.headers.set("Cache-Control", parts.join(", "));
  return response;
}

// Extract IP address from request for logging/rate limiting
export function getClientIp(request: NextRequest): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}

// Logging helper for API requests
export function logApiRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number
): void {
  const duration = Date.now() - startTime;
  const ip = getClientIp(request);

  console.log(
    JSON.stringify({
      type: "api_request",
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      duration,
      ip,
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    })
  );
}
