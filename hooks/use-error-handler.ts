"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  AppError,
  AuthenticationError,
  formatErrorForDisplay,
  getErrorMessage,
  logError,
} from "@/lib/errors";

interface UseErrorHandlerOptions {
  /**
   * Whether to show toast notifications for errors
   * @default true
   */
  showToast?: boolean;

  /**
   * Whether to log errors to the console/tracking service
   * @default true
   */
  logErrors?: boolean;

  /**
   * Custom error handler callback
   */
  onError?: (error: unknown) => void;

  /**
   * Handler for authentication errors (e.g., redirect to login)
   */
  onAuthError?: () => void;

  /**
   * Context information to include in error logs
   */
  context?: Record<string, unknown>;
}

interface UseErrorHandlerReturn {
  /**
   * Current error state
   */
  error: Error | null;

  /**
   * Whether there is currently an error
   */
  hasError: boolean;

  /**
   * Whether the error can be retried
   */
  canRetry: boolean;

  /**
   * Formatted error message for display
   */
  errorMessage: string | null;

  /**
   * Formatted error title for display
   */
  errorTitle: string | null;

  /**
   * Handle an error
   */
  handleError: (error: unknown) => void;

  /**
   * Clear the current error
   */
  clearError: () => void;

  /**
   * Wrap an async function with error handling
   */
  withErrorHandler: <T>(
    fn: () => Promise<T>,
    options?: { successMessage?: string }
  ) => Promise<T | undefined>;
}

export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const {
    showToast = true,
    logErrors = true,
    onError,
    onAuthError,
    context,
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const handleError = useCallback(
    (err: unknown) => {
      // Convert to Error object if needed
      const errorObj = err instanceof Error ? err : new Error(getErrorMessage(err));
      setError(errorObj);

      // Get formatted error info
      const { title, message, canRetry: retry } = formatErrorForDisplay(err);
      setCanRetry(retry);

      // Log error
      if (logErrors) {
        logError(err, context);
      }

      // Handle authentication errors specially
      if (err instanceof AuthenticationError && onAuthError) {
        onAuthError();
        return;
      }

      // Show toast notification
      if (showToast) {
        toast.error(title, {
          description: message,
        });
      }

      // Call custom error handler
      if (onError) {
        onError(err);
      }
    },
    [showToast, logErrors, onError, onAuthError, context]
  );

  const clearError = useCallback(() => {
    setError(null);
    setCanRetry(false);
  }, []);

  const withErrorHandler = useCallback(
    async <T>(
      fn: () => Promise<T>,
      fnOptions?: { successMessage?: string }
    ): Promise<T | undefined> => {
      try {
        clearError();
        const result = await fn();

        if (fnOptions?.successMessage && showToast) {
          toast.success(fnOptions.successMessage);
        }

        return result;
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError, clearError, showToast]
  );

  // Get formatted error for display
  const errorInfo = error ? formatErrorForDisplay(error) : null;

  return {
    error,
    hasError: error !== null,
    canRetry,
    errorMessage: errorInfo?.message ?? null,
    errorTitle: errorInfo?.title ?? null,
    handleError,
    clearError,
    withErrorHandler,
  };
}

// Hook for async operations with loading and error states
interface UseAsyncOptions<T> {
  /**
   * Whether to execute immediately on mount
   * @default false
   */
  immediate?: boolean;

  /**
   * Initial data value
   */
  initialData?: T;

  /**
   * Error handler options
   */
  errorOptions?: UseErrorHandlerOptions;
}

interface UseAsyncReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  hasError: boolean;
  execute: () => Promise<T | undefined>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const { initialData, errorOptions } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const { error, hasError, handleError, clearError } = useErrorHandler(errorOptions);

  const execute = useCallback(async (): Promise<T | undefined> => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      handleError(err);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, handleError, clearError]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    clearError();
  }, [initialData, clearError]);

  return {
    data,
    loading,
    error,
    hasError,
    execute,
    reset,
  };
}

// Hook for mutation operations (POST, PUT, DELETE)
interface UseMutationOptions<T, V> {
  /**
   * Callback on successful mutation
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback on error
   */
  onError?: (error: unknown) => void;

  /**
   * Error handler options
   */
  errorOptions?: UseErrorHandlerOptions;

  /**
   * Success toast message
   */
  successMessage?: string;
}

interface UseMutationReturn<T, V> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  hasError: boolean;
  mutate: (variables: V) => Promise<T | undefined>;
  reset: () => void;
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> {
  const { onSuccess, onError, errorOptions, successMessage } = options;

  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(false);
  const { error, hasError, handleError, clearError, withErrorHandler } =
    useErrorHandler({
      ...errorOptions,
      onError,
    });

  const mutate = useCallback(
    async (variables: V): Promise<T | undefined> => {
      setLoading(true);
      clearError();

      const result = await withErrorHandler(
        async () => {
          const response = await mutationFn(variables);
          setData(response);
          onSuccess?.(response);
          return response;
        },
        { successMessage }
      );

      setLoading(false);
      return result;
    },
    [mutationFn, onSuccess, successMessage, withErrorHandler, clearError]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setLoading(false);
    clearError();
  }, [clearError]);

  return {
    data,
    loading,
    error,
    hasError,
    mutate,
    reset,
  };
}
