/**
 * Centralized error handling utilities
 */

// Base application error class
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "UNKNOWN_ERROR",
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown
  ) {
    super(message, "VALIDATION_ERROR", 400, true, { field, value });
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401, true);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message, "AUTHORIZATION_ERROR", 403, true);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = "Resource not found",
    resourceType?: string,
    resourceId?: string
  ) {
    super(message, "NOT_FOUND", 404, true, { resourceType, resourceId });
    this.name = "NotFoundError";
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, "CONFLICT", 409, true);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Too many requests. Please try again later.",
    retryAfter?: number
  ) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, true, { retryAfter });
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network error. Please check your connection.") {
    super(message, "NETWORK_ERROR", 0, true);
    this.name = "NetworkError";
  }
}

export class ExternalServiceError extends AppError {
  public readonly service?: string;

  constructor(
    message: string = "External service error",
    service?: string
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR", 502, true, { service });
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = "Request timed out") {
    super(message, "TIMEOUT", 408, true);
    this.name = "TimeoutError";
  }
}

// Error response type for API responses
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

// Create a standardized error response
export function createErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.context,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
        statusCode: 500,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  };
}

// Type guard to check if error is an AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Extract error message safely
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

// Extract HTTP status code from error
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  if (error instanceof Error && "statusCode" in error) {
    return (error as { statusCode: number }).statusCode;
  }
  return 500;
}

// Log error with context
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      errorContext: error.context,
    }),
  };

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.error("Error logged:", errorInfo);
  }

  // In production, you would send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
}

// Wrap async functions with error handling
export function withErrorHandling<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error);
      if (errorHandler) {
        errorHandler(error);
      }
      throw error;
    }
  }) as T;
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Handle API fetch errors
export async function handleFetchError(response: Response): Promise<never> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  let errorCode = "HTTP_ERROR";

  try {
    const body = await response.json();
    if (body.error?.message) {
      errorMessage = body.error.message;
    }
    if (body.error?.code) {
      errorCode = body.error.code;
    }
  } catch {
    // Response body wasn't JSON, use default message
  }

  switch (response.status) {
    case 400:
      throw new ValidationError(errorMessage);
    case 401:
      throw new AuthenticationError(errorMessage);
    case 403:
      throw new AuthorizationError(errorMessage);
    case 404:
      throw new NotFoundError(errorMessage);
    case 409:
      throw new ConflictError(errorMessage);
    case 429:
      const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
      throw new RateLimitError(errorMessage, retryAfter);
    case 502:
    case 503:
    case 504:
      throw new ExternalServiceError(errorMessage);
    default:
      throw new AppError(errorMessage, errorCode, response.status);
  }
}

// Safe fetch wrapper with error handling
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      await handleFetchError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError();
    }

    throw error;
  }
}

// Format error for display to users
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  if (error instanceof ValidationError) {
    return {
      title: "Invalid Input",
      message: error.message,
      canRetry: false,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      title: "Authentication Required",
      message: "Please log in to continue.",
      canRetry: false,
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      title: "Access Denied",
      message: error.message,
      canRetry: false,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      title: "Not Found",
      message: error.message,
      canRetry: false,
    };
  }

  if (error instanceof RateLimitError) {
    return {
      title: "Too Many Requests",
      message: error.retryAfter
        ? `Please wait ${error.retryAfter} seconds before trying again.`
        : error.message,
      canRetry: true,
    };
  }

  if (error instanceof NetworkError) {
    return {
      title: "Network Error",
      message: "Please check your internet connection and try again.",
      canRetry: true,
    };
  }

  if (error instanceof TimeoutError) {
    return {
      title: "Request Timeout",
      message: "The request took too long. Please try again.",
      canRetry: true,
    };
  }

  if (error instanceof ExternalServiceError) {
    return {
      title: "Service Unavailable",
      message: "An external service is currently unavailable. Please try again later.",
      canRetry: true,
    };
  }

  return {
    title: "Something Went Wrong",
    message: process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again."
      : getErrorMessage(error),
    canRetry: true,
  };
}
