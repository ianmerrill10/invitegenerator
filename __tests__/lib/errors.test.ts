import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  ExternalServiceError,
  createErrorResponse,
  isAppError,
  getErrorMessage,
  getErrorStatusCode,
  formatErrorForDisplay,
  retryWithBackoff,
} from "@/lib/errors";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an error with default values", () => {
      const error = new AppError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("UNKNOWN_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("AppError");
    });

    it("should create an error with custom values", () => {
      const error = new AppError(
        "Custom error",
        "CUSTOM_CODE",
        404,
        false,
        { key: "value" }
      );
      expect(error.message).toBe("Custom error");
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(false);
      expect(error.context).toEqual({ key: "value" });
    });
  });

  describe("ValidationError", () => {
    it("should create a validation error", () => {
      const error = new ValidationError("Invalid email", "email", "bad@");
      expect(error.message).toBe("Invalid email");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe("email");
      expect(error.value).toBe("bad@");
    });
  });

  describe("AuthenticationError", () => {
    it("should create an auth error with default message", () => {
      const error = new AuthenticationError();
      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("AuthorizationError", () => {
    it("should create an authorization error", () => {
      const error = new AuthorizationError();
      expect(error.message).toBe("You don't have permission to perform this action");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("NotFoundError", () => {
    it("should create a not found error with resource info", () => {
      const error = new NotFoundError("User not found", "User", "123");
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.resourceType).toBe("User");
      expect(error.resourceId).toBe("123");
    });
  });

  describe("RateLimitError", () => {
    it("should create a rate limit error with retry after", () => {
      const error = new RateLimitError("Too many requests", 60);
      expect(error.message).toBe("Too many requests");
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });
  });

  describe("NetworkError", () => {
    it("should create a network error", () => {
      const error = new NetworkError();
      expect(error.message).toBe("Network error. Please check your connection.");
      expect(error.statusCode).toBe(0);
    });
  });

  describe("TimeoutError", () => {
    it("should create a timeout error", () => {
      const error = new TimeoutError();
      expect(error.message).toBe("Request timed out");
      expect(error.statusCode).toBe(408);
    });
  });

  describe("ExternalServiceError", () => {
    it("should create an external service error", () => {
      const error = new ExternalServiceError("Stripe API failed", "Stripe");
      expect(error.message).toBe("Stripe API failed");
      expect(error.statusCode).toBe(502);
      expect(error.service).toBe("Stripe");
    });
  });
});

describe("Error Utilities", () => {
  describe("createErrorResponse", () => {
    it("should create response from AppError", () => {
      const error = new ValidationError("Bad input");
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe("VALIDATION_ERROR");
      expect(response.error.message).toBe("Bad input");
      expect(response.error.statusCode).toBe(400);
    });

    it("should create response from standard Error", () => {
      const error = new Error("Something broke");
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe("UNKNOWN_ERROR");
      expect(response.error.statusCode).toBe(500);
    });

    it("should handle non-error values", () => {
      const response = createErrorResponse("string error");

      expect(response.success).toBe(false);
      expect(response.error.code).toBe("UNKNOWN_ERROR");
    });
  });

  describe("isAppError", () => {
    it("should return true for AppError", () => {
      expect(isAppError(new AppError("test"))).toBe(true);
      expect(isAppError(new ValidationError("test"))).toBe(true);
    });

    it("should return false for non-AppError", () => {
      expect(isAppError(new Error("test"))).toBe(false);
      expect(isAppError("string")).toBe(false);
      expect(isAppError(null)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error", () => {
      expect(getErrorMessage(new Error("test message"))).toBe("test message");
    });

    it("should return string directly", () => {
      expect(getErrorMessage("string error")).toBe("string error");
    });

    it("should return default for unknown types", () => {
      expect(getErrorMessage(123)).toBe("An unexpected error occurred");
      expect(getErrorMessage(null)).toBe("An unexpected error occurred");
    });
  });

  describe("getErrorStatusCode", () => {
    it("should extract status code from AppError", () => {
      expect(getErrorStatusCode(new NotFoundError())).toBe(404);
      expect(getErrorStatusCode(new AuthenticationError())).toBe(401);
    });

    it("should return 500 for unknown errors", () => {
      expect(getErrorStatusCode(new Error("test"))).toBe(500);
      expect(getErrorStatusCode("string")).toBe(500);
    });
  });

  describe("formatErrorForDisplay", () => {
    it("should format ValidationError", () => {
      const result = formatErrorForDisplay(new ValidationError("Bad input"));
      expect(result.title).toBe("Invalid Input");
      expect(result.message).toBe("Bad input");
      expect(result.canRetry).toBe(false);
    });

    it("should format AuthenticationError", () => {
      const result = formatErrorForDisplay(new AuthenticationError());
      expect(result.title).toBe("Authentication Required");
      expect(result.canRetry).toBe(false);
    });

    it("should format RateLimitError with retry time", () => {
      const result = formatErrorForDisplay(new RateLimitError("Too fast", 30));
      expect(result.title).toBe("Too Many Requests");
      expect(result.message).toContain("30 seconds");
      expect(result.canRetry).toBe(true);
    });

    it("should format NetworkError", () => {
      const result = formatErrorForDisplay(new NetworkError());
      expect(result.title).toBe("Network Error");
      expect(result.canRetry).toBe(true);
    });

    it("should format unknown errors", () => {
      const result = formatErrorForDisplay(new Error("Unknown"));
      expect(result.title).toBe("Something Went Wrong");
      expect(result.canRetry).toBe(true);
    });
  });

  describe("retryWithBackoff", () => {
    it("should return result on success", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retryWithBackoff(fn, 3);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should respect shouldRetry predicate", async () => {
      const fn = jest.fn().mockRejectedValue(new AuthenticationError());

      const shouldRetry = (error: unknown) => !(error instanceof AuthenticationError);

      await expect(retryWithBackoff(fn, 3, 10, shouldRetry)).rejects.toThrow(AuthenticationError);
      expect(fn).toHaveBeenCalledTimes(1); // No retries for auth errors
    });

    it("should retry on failure with small delay", async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValue("success");

      const result = await retryWithBackoff(fn, 2, 10);
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    }, 10000);

    it("should throw after max retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("always fails"));

      await expect(retryWithBackoff(fn, 1, 10)).rejects.toThrow("always fails");
      expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    }, 10000);
  });
});
