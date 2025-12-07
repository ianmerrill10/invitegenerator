/**
 * Marketing Email Sender
 *
 * Processes scheduled marketing emails and sends via AWS SES.
 * Called by a cron job or CloudWatch Events.
 */

import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "hello@invitegenerator.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";

/**
 * POST: Process and send scheduled emails
 * Should be called by a cron job every hour
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Get emails scheduled for now or earlier
    const result = await docClient.send(
      new ScanCommand({
        TableName: process.env.DYNAMODB_EMAIL_QUEUE_TABLE || "invitegen-email-queue",
        FilterExpression: "#status = :scheduled AND scheduledFor <= :now",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":scheduled": "scheduled",
          ":now": now,
        },
      })
    );

    const emailsToSend = result.Items || [];
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const email of emailsToSend) {
      try {
        // Get user details for personalization
        const userResult = await docClient.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { id: email.userId },
          })
        );

        const user = userResult.Item;
        if (!user || !user.email) {
          results.skipped++;
          continue;
        }

        // Check if user has unsubscribed
        if (user.settings?.marketingEmails === false) {
          await markEmailSkipped(email.id, "unsubscribed");
          results.skipped++;
          continue;
        }

        // Get invitation details if needed
        let invitation = null;
        if (email.invitationId) {
          const invResult = await docClient.send(
            new GetCommand({
              TableName: process.env.DYNAMODB_INVITATIONS_TABLE,
              Key: { id: email.invitationId },
            })
          );
          invitation = invResult.Item;
        }

        // Personalize email content
        const personalizedContent = personalizeEmail(email, user, invitation);

        // Send via SES
        await sesClient.send(
          new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
              ToAddresses: [user.email],
            },
            Message: {
              Subject: {
                Data: personalizedContent.subject,
                Charset: "UTF-8",
              },
              Body: {
                Html: {
                  Data: wrapInTemplate(personalizedContent.body, user),
                  Charset: "UTF-8",
                },
              },
            },
            Tags: [
              { Name: "campaign", Value: email.campaignId },
              { Name: "template", Value: email.template },
            ],
          })
        );

        // Mark as sent
        await markEmailSent(email.id);
        results.sent++;
      } catch (sendError) {
        console.error(`Failed to send email ${email.id}:`, sendError);
        await markEmailFailed(email.id, String(sendError));
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: emailsToSend.length,
        ...results,
      },
    });
  } catch (error) {
    console.error("Email processing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process emails" },
      { status: 500 }
    );
  }
}

function personalizeEmail(
  email: any,
  user: any,
  invitation: any
): { subject: string; body: string } {
  let subject = email.subject;
  let body = email.body || "";

  const replacements: Record<string, string> = {
    "{firstName}": user.firstName || user.name?.split(" ")[0] || "there",
    "{name}": user.name || "Friend",
    "{email}": user.email,
    "{eventType}": formatEventType(email.eventType || invitation?.eventType || "event"),
    "{eventName}": invitation?.title || "your event",
    "{invitationId}": email.invitationId || "",
    "{appUrl}": APP_URL,
    "{attendingCount}": String(invitation?.rsvpSummary?.attending || 0),
    "{declinedCount}": String(invitation?.rsvpSummary?.notAttending || 0),
    "{pendingCount}": String(invitation?.rsvpSummary?.pending || 0),
  };

  for (const [key, value] of Object.entries(replacements)) {
    subject = subject.replace(new RegExp(key, "g"), value);
    body = body.replace(new RegExp(key, "g"), value);
  }

  return { subject, body };
}

function formatEventType(eventType: string): string {
  return eventType
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function wrapInTemplate(body: string, user: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1917; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #E5E5E5; }
    .logo { font-size: 24px; font-weight: bold; color: #FF6B47; }
    .content { padding: 30px 0; }
    .button { display: inline-block; background: #FF6B47; color: white !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #E5E5E5; font-size: 12px; color: #71717A; }
    h1 { color: #1C1917; font-size: 24px; }
    h2 { color: #1C1917; font-size: 18px; }
    ul, ol { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">InviteGenerator</div>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} InviteGenerator. All rights reserved.</p>
      <p>
        <a href="${APP_URL}/dashboard/settings">Manage Preferences</a> |
        <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(user.email)}">Unsubscribe</a>
      </p>
      <p>123 Event Street, San Francisco, CA 94102</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function markEmailSent(emailId: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_EMAIL_QUEUE_TABLE || "invitegen-email-queue",
      Key: { id: emailId },
      UpdateExpression: "SET #status = :sent, sentAt = :now",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":sent": "sent",
        ":now": new Date().toISOString(),
      },
    })
  );
}

async function markEmailFailed(emailId: string, error: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_EMAIL_QUEUE_TABLE || "invitegen-email-queue",
      Key: { id: emailId },
      UpdateExpression: "SET #status = :failed, failedAt = :now, errorMessage = :error",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":failed": "failed",
        ":now": new Date().toISOString(),
        ":error": error,
      },
    })
  );
}

async function markEmailSkipped(emailId: string, reason: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_EMAIL_QUEUE_TABLE || "invitegen-email-queue",
      Key: { id: emailId },
      UpdateExpression: "SET #status = :skipped, skippedAt = :now, skipReason = :reason",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":skipped": "skipped",
        ":now": new Date().toISOString(),
        ":reason": reason,
      },
    })
  );
}
