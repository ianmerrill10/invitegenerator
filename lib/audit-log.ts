/**
 * Audit Logging Service
 *
 * Provides security event logging for compliance and incident investigation.
 * Logs authentication events, authorization failures, and suspicious activity.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const AUDIT_LOG_TABLE = process.env.DYNAMODB_AUDIT_LOG_TABLE || "InviteGenerator-AuditLog-production";

// Audit event types
export type AuditEventType =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.logout"
  | "auth.signup"
  | "auth.password.reset.request"
  | "auth.password.reset.success"
  | "auth.password.reset.failure"
  | "auth.token.refresh"
  | "auth.token.invalid"
  | "authz.access.denied"
  | "authz.resource.unauthorized"
  | "security.rate.limit.exceeded"
  | "security.csrf.failure"
  | "security.suspicious.activity"
  | "security.input.validation.failure"
  | "data.invitation.created"
  | "data.invitation.updated"
  | "data.invitation.deleted"
  | "data.invitation.published"
  | "data.rsvp.submitted"
  | "data.user.profile.updated"
  | "data.user.settings.updated"
  | "billing.subscription.created"
  | "billing.subscription.updated"
  | "billing.subscription.cancelled"
  | "billing.payment.success"
  | "billing.payment.failure";

// Severity levels
export type AuditSeverity = "info" | "warning" | "error" | "critical";

// Audit log entry structure
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  action?: string;
  outcome: "success" | "failure";
  details?: Record<string, unknown>;
  errorMessage?: string;
  ttl?: number; // Time-to-live for automatic cleanup
}

// Event severity mapping
const eventSeverityMap: Record<AuditEventType, AuditSeverity> = {
  "auth.login.success": "info",
  "auth.login.failure": "warning",
  "auth.logout": "info",
  "auth.signup": "info",
  "auth.password.reset.request": "info",
  "auth.password.reset.success": "info",
  "auth.password.reset.failure": "warning",
  "auth.token.refresh": "info",
  "auth.token.invalid": "warning",
  "authz.access.denied": "warning",
  "authz.resource.unauthorized": "warning",
  "security.rate.limit.exceeded": "warning",
  "security.csrf.failure": "error",
  "security.suspicious.activity": "critical",
  "security.input.validation.failure": "warning",
  "data.invitation.created": "info",
  "data.invitation.updated": "info",
  "data.invitation.deleted": "info",
  "data.invitation.published": "info",
  "data.rsvp.submitted": "info",
  "data.user.profile.updated": "info",
  "data.user.settings.updated": "info",
  "billing.subscription.created": "info",
  "billing.subscription.updated": "info",
  "billing.subscription.cancelled": "info",
  "billing.payment.success": "info",
  "billing.payment.failure": "warning",
};

/**
 * Generate a unique ID for the audit log entry
 */
function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  options: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    resourceId?: string;
    action?: string;
    outcome: "success" | "failure";
    details?: Record<string, unknown>;
    errorMessage?: string;
  }
): Promise<void> {
  const entry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    eventType,
    severity: eventSeverityMap[eventType] || "info",
    ...options,
    // Set TTL for 90 days (for DynamoDB automatic cleanup)
    ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
  };

  // Log to console for immediate visibility
  const logMethod =
    entry.severity === "critical" || entry.severity === "error"
      ? console.error
      : entry.severity === "warning"
      ? console.warn
      : console.info;

  logMethod(`[AUDIT] ${entry.eventType}`, {
    severity: entry.severity,
    userId: entry.userId,
    outcome: entry.outcome,
    ip: entry.ipAddress,
    ...(entry.errorMessage && { error: entry.errorMessage }),
  });

  // Also persist to DynamoDB (fire and forget for non-blocking)
  try {
    await docClient.send(
      new PutCommand({
        TableName: AUDIT_LOG_TABLE,
        Item: entry,
      })
    );
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("[AUDIT] Failed to persist audit log:", error);
  }

  // For critical events, trigger alert (could be SNS, Slack webhook, etc.)
  if (entry.severity === "critical") {
    await triggerSecurityAlert(entry);
  }
}

/**
 * Trigger security alert for critical events
 */
async function triggerSecurityAlert(entry: AuditLogEntry): Promise<void> {
  // In production, integrate with:
  // - AWS SNS for email/SMS alerts
  // - Slack/Discord webhooks
  // - PagerDuty for on-call notifications
  // - SIEM systems for security monitoring

  const alertMessage = `
🚨 SECURITY ALERT: ${entry.eventType}
Severity: ${entry.severity.toUpperCase()}
Time: ${entry.timestamp}
User: ${entry.userId || "N/A"}
IP: ${entry.ipAddress || "N/A"}
${entry.errorMessage ? `Error: ${entry.errorMessage}` : ""}
${entry.details ? `Details: ${JSON.stringify(entry.details)}` : ""}
  `.trim();

  console.error("[SECURITY ALERT]", alertMessage);

  // Example: Send to Slack webhook if configured
  if (process.env.SLACK_SECURITY_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_SECURITY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: alertMessage,
          attachments: [
            {
              color: "danger",
              title: `Security Alert: ${entry.eventType}`,
              fields: [
                { title: "Severity", value: entry.severity, short: true },
                { title: "Time", value: entry.timestamp, short: true },
                { title: "User ID", value: entry.userId || "N/A", short: true },
                { title: "IP Address", value: entry.ipAddress || "N/A", short: true },
              ],
            },
          ],
        }),
      });
    } catch (webhookError) {
      console.error("[AUDIT] Failed to send Slack alert:", webhookError);
    }
  }
}

/**
 * Query audit logs for a user
 */
export async function getAuditLogsForUser(
  userId: string,
  options: {
    limit?: number;
    startTime?: string;
    endTime?: string;
    eventTypes?: AuditEventType[];
  } = {}
): Promise<AuditLogEntry[]> {
  const { limit = 100, startTime, endTime, eventTypes } = options;

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: AUDIT_LOG_TABLE,
        IndexName: "userId-timestamp-index",
        KeyConditionExpression: startTime
          ? "userId = :userId AND #ts BETWEEN :startTime AND :endTime"
          : "userId = :userId",
        ExpressionAttributeNames: startTime ? { "#ts": "timestamp" } : undefined,
        ExpressionAttributeValues: {
          ":userId": userId,
          ...(startTime && { ":startTime": startTime }),
          ...(endTime && { ":endTime": endTime || new Date().toISOString() }),
        },
        Limit: limit,
        ScanIndexForward: false, // Most recent first
      })
    );

    let logs = (result.Items || []) as AuditLogEntry[];

    // Filter by event types if specified
    if (eventTypes && eventTypes.length > 0) {
      logs = logs.filter((log) => eventTypes.includes(log.eventType));
    }

    return logs;
  } catch (error) {
    console.error("[AUDIT] Failed to query audit logs:", error);
    return [];
  }
}

/**
 * Helper: Log authentication attempt
 */
export async function logAuthAttempt(
  request: Request,
  options: {
    email: string;
    success: boolean;
    userId?: string;
    reason?: string;
  }
): Promise<void> {
  await logAuditEvent(options.success ? "auth.login.success" : "auth.login.failure", {
    userId: options.userId,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
    outcome: options.success ? "success" : "failure",
    details: {
      email: options.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Partially mask email
    },
    errorMessage: options.reason,
  });
}

/**
 * Helper: Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  request: Request,
  endpoint: string
): Promise<void> {
  await logAuditEvent("security.rate.limit.exceeded", {
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
    resource: endpoint,
    outcome: "failure",
    details: {
      endpoint,
      method: request.method,
    },
  });
}

/**
 * Helper: Log CSRF failure
 */
export async function logCSRFFailure(
  request: Request,
  endpoint: string
): Promise<void> {
  await logAuditEvent("security.csrf.failure", {
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
    resource: endpoint,
    outcome: "failure",
    details: {
      endpoint,
      method: request.method,
    },
  });
}

/**
 * Helper: Log suspicious activity
 */
export async function logSuspiciousActivity(
  request: Request,
  description: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent("security.suspicious.activity", {
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
    outcome: "failure",
    errorMessage: description,
    details,
  });
}
