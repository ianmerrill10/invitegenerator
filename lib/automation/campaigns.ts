/**
 * Campaign Automation Utilities
 * Automated email campaign triggers and scheduling for InviteGenerator
 *
 * Uses the existing sendEmail function from @/lib/email (AWS SES).
 * Stores scheduled campaigns in DynamoDB table invitegenerator-campaigns.
 */

import { sendEmail } from "@/lib/email";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// -----------------------------------------------------------------------------
// DynamoDB Setup
// -----------------------------------------------------------------------------

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CAMPAIGNS_TABLE =
  process.env.DYNAMODB_CAMPAIGNS_TABLE || "InviteGenerator-Campaigns-production";

// -----------------------------------------------------------------------------
// Types (defined locally to avoid non-existent type imports)
// -----------------------------------------------------------------------------

export enum CampaignTrigger {
  USER_SIGNUP = "user_signup",
  INVITATION_CREATED = "invitation_created",
  QUESTIONNAIRE_COMPLETED = "questionnaire_completed",
  ABANDONED_CART = "abandoned_cart",
  EVENT_COUNTDOWN = "event_countdown",
  POST_EVENT = "post_event",
  INACTIVE_USER = "inactive_user",
}

export type CampaignStatus = "pending" | "sent" | "failed" | "cancelled";

export interface CampaignRecord {
  id: string;
  userId: string;
  email: string;
  trigger: CampaignTrigger;
  campaignKey: string;
  subject: string;
  status: CampaignStatus;
  scheduledFor: string;
  sentAt?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName?: string;
  marketingConsent?: {
    email: boolean;
    sms?: boolean;
  };
  primaryEventType?: string;
  segment?: string;
  lastActive?: string;
}

export interface CampaignConfig {
  trigger: CampaignTrigger;
  delayMinutes: number;
  subjectTemplate: string;
  getEmailContent: (profile: CustomerProfile, data?: Record<string, string>) => {
    subject: string;
    text: string;
    html: string;
  };
}

// -----------------------------------------------------------------------------
// Email Content Generators
// -----------------------------------------------------------------------------

function welcomeEmailContent(profile: CustomerProfile) {
  const name = profile.firstName || "there";
  return {
    subject: "Welcome to InviteGenerator!",
    text: `Hi ${name},\n\nWelcome to InviteGenerator! We're excited to help you create beautiful invitations for your special events.\n\nGet started by browsing our templates or creating your first invitation:\nhttps://invitegenerator.com/dashboard\n\nBest regards,\nThe InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
  .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to InviteGenerator!</h1></div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>We're excited to help you create beautiful invitations for your special events.</p>
      <p style="text-align: center;"><a href="https://invitegenerator.com/dashboard" class="button">Get Started</a></p>
      <p>Browse our templates, customize your design, and send stunning invitations in minutes.</p>
    </div>
    <div class="footer"><p>Best regards,<br>The InviteGenerator Team</p></div>
  </div>
</body>
</html>`,
  };
}

function abandonedCartEmailContent(
  profile: CustomerProfile,
  data?: Record<string, string>
) {
  const name = profile.firstName || "there";
  const cartUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/cart`;

  return {
    subject: "You left something behind!",
    text: `Hi ${name},\n\nIt looks like you were in the middle of something. Your items are still waiting for you!\n\nCome back and finish your order: ${cartUrl}\n\nBest regards,\nThe InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
  .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Don't Forget Your Items!</h1></div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>It looks like you were in the middle of creating something special. Your items are still waiting for you!</p>
      <p style="text-align: center;"><a href="${cartUrl}" class="button">Complete Your Order</a></p>
      <p>Don't miss out - finish your order and get your invitations delivered to your door.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
      <p style="font-size: 12px; color: #9ca3af;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com"}/unsubscribe?userId=${profile.userId}" style="color: #9ca3af;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function invitationCreatedEmailContent(profile: CustomerProfile) {
  const name = profile.firstName || "there";
  return {
    subject: "Your invitation is looking great!",
    text: `Hi ${name},\n\nGreat job creating your invitation! Did you know you can also order printed versions delivered right to your door?\n\nCheck out our print packages: https://invitegenerator.com/packages\n\nBest regards,\nThe InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
  .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
  .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Your Invitation Looks Amazing!</h1></div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Great job on your invitation! Did you know you can also order professionally printed versions delivered right to your door?</p>
      <p style="text-align: center;"><a href="https://invitegenerator.com/packages" class="button">Browse Print Packages</a></p>
      <p>Our packages include invitations, envelopes, and curated party supplies - everything you need for your event.</p>
    </div>
    <div class="footer"><p>Best regards,<br>The InviteGenerator Team</p></div>
  </div>
</body>
</html>`,
  };
}

// -----------------------------------------------------------------------------
// Automated Campaign Definitions
// -----------------------------------------------------------------------------

export const AUTOMATED_CAMPAIGNS: Record<string, CampaignConfig> = {
  welcomeEmail: {
    trigger: CampaignTrigger.USER_SIGNUP,
    delayMinutes: 0,
    subjectTemplate: "Welcome to InviteGenerator!",
    getEmailContent: welcomeEmailContent,
  },

  invitationFollowUp: {
    trigger: CampaignTrigger.INVITATION_CREATED,
    delayMinutes: 30,
    subjectTemplate: "Your invitation is looking great!",
    getEmailContent: invitationCreatedEmailContent,
  },

  abandonedCart: {
    trigger: CampaignTrigger.ABANDONED_CART,
    delayMinutes: 1440, // 24 hours
    subjectTemplate: "You left something behind!",
    getEmailContent: abandonedCartEmailContent,
  },
};

// -----------------------------------------------------------------------------
// Core Functions
// -----------------------------------------------------------------------------

/**
 * Send an automated email, checking marketing consent first.
 * Returns success/failure with optional messageId.
 */
export async function sendAutomatedEmail(
  profile: CustomerProfile,
  config: CampaignConfig,
  additionalData?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check marketing consent
    if (!profile.marketingConsent?.email) {
      console.info("User does not have email consent", {
        userId: profile.userId,
        email: profile.email,
      });
      return { success: false, error: "No email consent" };
    }

    // Generate email content
    const emailContent = config.getEmailContent(profile, additionalData);

    // Send via the existing PROD email utility
    const sent = await sendEmail({
      to: profile.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (sent) {
      console.info("Automated email sent", {
        userId: profile.userId,
        email: profile.email,
        trigger: config.trigger,
      });
      return { success: true };
    }

    return { success: false, error: "Email send failed" };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send automated email", {
      userId: profile.userId,
      trigger: config.trigger,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Schedule an automated campaign.
 * If delay is 0, sends immediately.
 * Otherwise, stores a pending record in DynamoDB for later processing.
 */
export async function scheduleAutomatedCampaign(
  campaignKey: string,
  profile: CustomerProfile,
  additionalData?: Record<string, string>
): Promise<{ success: boolean; scheduledFor?: string; error?: string }> {
  const config = AUTOMATED_CAMPAIGNS[campaignKey];

  if (!config) {
    return { success: false, error: `Unknown campaign: ${campaignKey}` };
  }

  const delayMs = config.delayMinutes * 60 * 1000;
  const scheduledFor = new Date(Date.now() + delayMs).toISOString();
  const now = new Date().toISOString();

  // If no delay, send immediately
  if (config.delayMinutes === 0) {
    const result = await sendAutomatedEmail(profile, config, additionalData);

    // Log the campaign record
    const record: CampaignRecord = {
      id: uuidv4(),
      userId: profile.userId,
      email: profile.email,
      trigger: config.trigger,
      campaignKey,
      subject: config.subjectTemplate,
      status: result.success ? "sent" : "failed",
      scheduledFor: now,
      sentAt: result.success ? now : undefined,
      error: result.error,
      createdAt: now,
      updatedAt: now,
    };

    await saveCampaignRecord(record);

    return {
      success: result.success,
      scheduledFor: now,
      error: result.error,
    };
  }

  // Store as pending for later processing
  const record: CampaignRecord = {
    id: uuidv4(),
    userId: profile.userId,
    email: profile.email,
    trigger: config.trigger,
    campaignKey,
    subject: config.subjectTemplate,
    status: "pending",
    scheduledFor,
    metadata: additionalData
      ? Object.fromEntries(
          Object.entries(additionalData).map(([k, v]) => [k, v])
        )
      : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await saveCampaignRecord(record);

  console.info("Campaign scheduled", {
    campaignKey,
    userId: profile.userId,
    scheduledFor,
    delayMinutes: config.delayMinutes,
  });

  return { success: true, scheduledFor };
}

/**
 * Save a campaign record to DynamoDB
 */
async function saveCampaignRecord(record: CampaignRecord): Promise<void> {
  try {
    const putCommand = new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: record,
    });
    await docClient.send(putCommand);
  } catch (error) {
    console.error("Failed to save campaign record:", error);
  }
}

/**
 * Get all campaigns for a user
 */
export async function getUserCampaigns(
  userId: string
): Promise<CampaignRecord[]> {
  try {
    const command = new ScanCommand({
      TableName: CAMPAIGNS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });

    const result = await docClient.send(command);
    return (result.Items as CampaignRecord[]) || [];
  } catch (error) {
    console.error("Failed to fetch user campaigns:", error);
    return [];
  }
}

/**
 * Get all pending campaigns that are ready to be sent
 */
export async function getPendingCampaigns(): Promise<CampaignRecord[]> {
  try {
    const now = new Date().toISOString();

    const command = new ScanCommand({
      TableName: CAMPAIGNS_TABLE,
      FilterExpression:
        "#status = :pending AND scheduledFor <= :now",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":pending": "pending",
        ":now": now,
      },
    });

    const result = await docClient.send(command);
    return (result.Items as CampaignRecord[]) || [];
  } catch (error) {
    console.error("Failed to fetch pending campaigns:", error);
    return [];
  }
}

/**
 * List all available campaign configurations
 */
export function listAvailableCampaigns(): Array<{
  key: string;
  trigger: CampaignTrigger;
  delayMinutes: number;
  subject: string;
}> {
  return Object.entries(AUTOMATED_CAMPAIGNS).map(([key, config]) => ({
    key,
    trigger: config.trigger,
    delayMinutes: config.delayMinutes,
    subject: config.subjectTemplate,
  }));
}

// -----------------------------------------------------------------------------
// Convenience Trigger Functions
// -----------------------------------------------------------------------------

/**
 * Trigger welcome email on user signup
 */
export async function triggerWelcomeEmail(
  profile: CustomerProfile
): Promise<void> {
  await scheduleAutomatedCampaign("welcomeEmail", profile);
}

/**
 * Trigger follow-up email after invitation creation
 */
export async function triggerInvitationFollowUp(
  profile: CustomerProfile
): Promise<void> {
  await scheduleAutomatedCampaign("invitationFollowUp", profile);
}

/**
 * Trigger abandoned cart email
 */
export async function triggerAbandonedCartEmail(
  profile: CustomerProfile,
  cartData?: Record<string, string>
): Promise<void> {
  await scheduleAutomatedCampaign("abandonedCart", profile, cartData);
}
