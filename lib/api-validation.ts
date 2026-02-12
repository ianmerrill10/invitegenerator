/**
 * API Request Validation Utilities
 *
 * Provides common validation functions for API routes including:
 * - Content-Type validation
 * - Request body size limits
 * - JSON parsing with error handling
 */

import { NextRequest, NextResponse } from "next/server";

/** Maximum request body size in bytes (default: 1MB) */
export const DEFAULT_MAX_BODY_SIZE = 1024 * 1024;

/** Maximum body size for file uploads (10MB) */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

/** Maximum body size for JSON requests (100KB) */
export const MAX_JSON_SIZE = 100 * 1024;

/**
 * Validation error response type
 */
export interface ValidationError {
  code: string;
  message: string;
  status: number;
}

/**
 * Validation result type
 */
export type ValidationResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * Validate Content-Type header for JSON requests
 *
 * @param request - The incoming request
 * @returns Validation result
 */
export function validateContentType(request: NextRequest): ValidationResult<void> {
  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return {
      success: false,
      error: {
        code: "MISSING_CONTENT_TYPE",
        message: "Content-Type header is required",
        status: 415,
      },
    };
  }

  // Check for JSON content type (allowing charset parameter)
  if (!contentType.includes("application/json")) {
    return {
      success: false,
      error: {
        code: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be application/json",
        status: 415,
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Validate request body size
 *
 * @param request - The incoming request
 * @param maxSize - Maximum allowed size in bytes
 * @returns Validation result
 */
export function validateBodySize(
  request: NextRequest,
  maxSize: number = DEFAULT_MAX_BODY_SIZE
): ValidationResult<void> {
  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSize) {
      return {
        success: false,
        error: {
          code: "BODY_TOO_LARGE",
          message: `Request body exceeds maximum size of ${Math.round(maxSize / 1024)}KB`,
          status: 413,
        },
      };
    }
  }

  return { success: true, data: undefined };
}

/**
 * Safely parse JSON body with validation
 *
 * @param request - The incoming request
 * @param maxSize - Maximum allowed body size
 * @returns Parsed JSON data or validation error
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest,
  maxSize: number = MAX_JSON_SIZE
): Promise<ValidationResult<T>> {
  // Validate Content-Type
  const contentTypeResult = validateContentType(request);
  if (!contentTypeResult.success) {
    return contentTypeResult;
  }

  // Validate body size
  const bodySizeResult = validateBodySize(request, maxSize);
  if (!bodySizeResult.success) {
    return bodySizeResult;
  }

  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Invalid JSON in request body",
        status: 400,
      },
    };
  }
}

/**
 * Create a standardized error response
 *
 * @param error - The validation error
 * @param headers - Optional additional headers
 * @returns NextResponse with error
 */
export function createErrorResponse(
  error: ValidationError,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    {
      status: error.status,
      headers,
    }
  );
}

/**
 * Validate required fields in request body
 *
 * @param body - The request body object
 * @param requiredFields - Array of required field names
 * @returns Validation result with missing fields
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult<void> {
  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );

  if (missingFields.length > 0) {
    return {
      success: false,
      error: {
        code: "MISSING_REQUIRED_FIELDS",
        message: `Missing required fields: ${missingFields.join(", ")}`,
        status: 400,
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Validate string field length
 *
 * @param value - The string value to validate
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns Validation result
 */
export function validateStringLength(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {}
): ValidationResult<string> {
  if (typeof value !== "string") {
    return {
      success: false,
      error: {
        code: "INVALID_TYPE",
        message: `${fieldName} must be a string`,
        status: 400,
      },
    };
  }

  const { min = 0, max = 10000 } = options;

  if (value.length < min) {
    return {
      success: false,
      error: {
        code: "STRING_TOO_SHORT",
        message: `${fieldName} must be at least ${min} characters`,
        status: 400,
      },
    };
  }

  if (value.length > max) {
    return {
      success: false,
      error: {
        code: "STRING_TOO_LONG",
        message: `${fieldName} must be at most ${max} characters`,
        status: 400,
      },
    };
  }

  return { success: true, data: value };
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: unknown): ValidationResult<string> {
  if (typeof email !== "string") {
    return {
      success: false,
      error: {
        code: "INVALID_TYPE",
        message: "Email must be a string",
        status: 400,
      },
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: {
        code: "INVALID_EMAIL",
        message: "Invalid email format",
        status: 400,
      },
    };
  }

  return { success: true, data: email.toLowerCase().trim() };
}

/**
 * Validate UUID format
 *
 * @param id - UUID string to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function validateUUID(id: unknown, fieldName: string = "ID"): ValidationResult<string> {
  if (typeof id !== "string") {
    return {
      success: false,
      error: {
        code: "INVALID_TYPE",
        message: `${fieldName} must be a string`,
        status: 400,
      },
    };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return {
      success: false,
      error: {
        code: "INVALID_UUID",
        message: `Invalid ${fieldName} format`,
        status: 400,
      },
    };
  }

  return { success: true, data: id };
}

/**
 * Validate short ID format (alphanumeric, 6-12 chars)
 *
 * @param shortId - Short ID to validate
 * @returns Validation result
 */
export function validateShortId(shortId: unknown): ValidationResult<string> {
  if (typeof shortId !== "string") {
    return {
      success: false,
      error: {
        code: "INVALID_TYPE",
        message: "Short ID must be a string",
        status: 400,
      },
    };
  }

  if (!/^[a-zA-Z0-9]{6,12}$/.test(shortId)) {
    return {
      success: false,
      error: {
        code: "INVALID_SHORT_ID",
        message: "Invalid invitation ID format",
        status: 400,
      },
    };
  }

  return { success: true, data: shortId };
}
