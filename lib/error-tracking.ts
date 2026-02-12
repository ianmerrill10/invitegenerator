// ============================================
// ERROR TRACKING SERVICE
// Centralized error logging and monitoring
// ============================================

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface ErrorContext {
  userId?: string;
  route?: string;
  method?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

export interface LoggedError {
  message: string;
  severity: ErrorSeverity;
  timestamp: string;
  stack?: string;
  context: ErrorContext;
}

// In-memory storage for recent errors (last 1000)
// In production, this would go to CloudWatch, Datadog, or Sentry
const errorLog: LoggedError[] = [];
const MAX_LOG_SIZE = 1000;

/**
 * Log an error with context
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = "error",
  context: ErrorContext = {}
): void {
  const logEntry: LoggedError = {
    message: typeof error === "string" ? error : error.message,
    severity,
    timestamp: new Date().toISOString(),
    stack: typeof error === "object" ? error.stack : undefined,
    context,
  };

  // Add to in-memory log
  errorLog.unshift(logEntry);
  if (errorLog.length > MAX_LOG_SIZE) {
    errorLog.pop();
  }

  // Console logging with appropriate level
  const logMethod = {
    info: console.info,
    warning: console.warn,
    error: console.error,
    critical: console.error,
  }[severity];

  logMethod(
    `[${severity.toUpperCase()}] ${logEntry.timestamp}`,
    logEntry.message,
    context
  );

  // In production, send critical errors to an external service
  if (severity === "critical" && process.env.NODE_ENV === "production") {
    // Could send to Slack, email, or monitoring service
    sendCriticalAlert(logEntry);
  }
}

/**
 * Log an API error
 */
export function logAPIError(
  error: Error | string,
  request: Request,
  additionalContext?: Record<string, unknown>
): void {
  const context: ErrorContext = {
    route: new URL(request.url).pathname,
    method: request.method,
    userAgent: request.headers.get("user-agent") || undefined,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        undefined,
    requestId: request.headers.get("x-request-id") || crypto.randomUUID(),
    ...additionalContext,
  };

  logError(error, "error", context);
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: ErrorContext): void {
  logError(message, "warning", context || {});
}

/**
 * Log info
 */
export function logInfo(message: string, context?: ErrorContext): void {
  logError(message, "info", context || {});
}

/**
 * Log a critical error
 */
export function logCritical(
  error: Error | string,
  context?: ErrorContext
): void {
  logError(error, "critical", context || {});
}

/**
 * Get recent errors (for debugging/admin panel)
 */
export function getRecentErrors(
  limit: number = 100,
  severity?: ErrorSeverity
): LoggedError[] {
  let errors = errorLog.slice(0, limit);
  if (severity) {
    errors = errors.filter((e) => e.severity === severity);
  }
  return errors;
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  last24Hours: number;
} {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const stats = {
    total: errorLog.length,
    bySeverity: {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    },
    last24Hours: 0,
  };

  for (const error of errorLog) {
    stats.bySeverity[error.severity]++;
    if (new Date(error.timestamp).getTime() > dayAgo) {
      stats.last24Hours++;
    }
  }

  return stats;
}

/**
 * Clear error log (for testing)
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}

/**
 * Send critical alert (placeholder for real implementation)
 */
async function sendCriticalAlert(error: LoggedError): Promise<void> {
  // In production, implement one of:
  // - Send to Slack webhook
  // - Send to email via SES
  // - Send to PagerDuty
  // - Send to CloudWatch Alarms

  console.error("[CRITICAL ALERT]", error);

  // Example: Slack webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *CRITICAL ERROR* in InviteGenerator`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Error:* ${error.message}\n*Time:* ${error.timestamp}\n*Route:* ${error.context.route || "N/A"}`,
              },
            },
          ],
        }),
      });
    } catch (e) {
      console.error("Failed to send Slack alert:", e);
    }
  }
}

/**
 * Create error boundary wrapper for async functions
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error instanceof Error ? error : String(error), "error", context);
      throw error;
    }
  }) as T;
}
