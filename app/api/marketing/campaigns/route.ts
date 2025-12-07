/**
 * Marketing Campaigns API
 *
 * Automated marketing email campaigns based on user behavior:
 * - Welcome series for new signups
 * - Abandoned invitation reminders
 * - Event-based product recommendations
 * - Re-engagement campaigns
 * - RSVP deadline reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Campaign types
const CAMPAIGNS = {
  welcome_series: {
    id: "welcome_series",
    name: "Welcome Series",
    emails: [
      { delay: 0, subject: "Welcome to InviteGenerator! 🎉", template: "welcome_1" },
      { delay: 1, subject: "Create your first invitation in 60 seconds", template: "welcome_2" },
      { delay: 3, subject: "5 tips for stunning invitations", template: "welcome_3" },
      { delay: 7, subject: "Your free templates are waiting", template: "welcome_4" },
    ],
  },
  abandoned_invitation: {
    id: "abandoned_invitation",
    name: "Abandoned Invitation",
    emails: [
      { delay: 1, subject: "Your invitation is almost ready!", template: "abandoned_1" },
      { delay: 3, subject: "Need help finishing your invitation?", template: "abandoned_2" },
    ],
  },
  event_products: {
    id: "event_products",
    name: "Event Product Recommendations",
    emails: [
      { delay: 0, subject: "Everything you need for your {eventType}", template: "products_1" },
      { delay: 7, subject: "Don't forget these {eventType} essentials", template: "products_2" },
    ],
  },
  rsvp_reminder: {
    id: "rsvp_reminder",
    name: "RSVP Deadline Reminder",
    emails: [
      { delay: -7, subject: "RSVP deadline approaching for {eventName}", template: "rsvp_reminder_1" },
      { delay: -3, subject: "Only 3 days left to RSVP!", template: "rsvp_reminder_2" },
      { delay: -1, subject: "Last chance to RSVP!", template: "rsvp_reminder_3" },
    ],
  },
  re_engagement: {
    id: "re_engagement",
    name: "Re-engagement",
    emails: [
      { delay: 30, subject: "We miss you! Here's what's new", template: "reengage_1" },
      { delay: 45, subject: "Your next event deserves a great invitation", template: "reengage_2" },
      { delay: 60, subject: "Special offer just for you", template: "reengage_3" },
    ],
  },
  post_event: {
    id: "post_event",
    name: "Post Event",
    emails: [
      { delay: 1, subject: "How was your {eventType}?", template: "post_event_1" },
      { delay: 3, subject: "Share photos from your event", template: "post_event_2" },
    ],
  },
};

// Email templates with personalization
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome_1: {
    subject: "Welcome to InviteGenerator! 🎉",
    preheader: "Your journey to beautiful invitations starts here",
    body: `
      <h1>Welcome, {firstName}!</h1>
      <p>We're thrilled to have you join InviteGenerator. You've just unlocked the easiest way to create stunning invitations for any occasion.</p>
      <h2>What you can do:</h2>
      <ul>
        <li>✨ Use AI to generate beautiful designs in seconds</li>
        <li>🎨 Choose from 100+ professional templates</li>
        <li>📧 Track RSVPs in real-time</li>
        <li>🛍️ Get personalized product recommendations</li>
      </ul>
      <a href="{appUrl}/dashboard/create" class="button">Create Your First Invitation</a>
    `,
  },
  welcome_2: {
    subject: "Create your first invitation in 60 seconds",
    preheader: "It's easier than you think",
    body: `
      <h1>Ready to create something amazing?</h1>
      <p>Hi {firstName},</p>
      <p>Creating a beautiful invitation takes just 3 simple steps:</p>
      <ol>
        <li><strong>Choose your event type</strong> - Wedding, birthday, baby shower, and more</li>
        <li><strong>Let AI work its magic</strong> - Describe your vision and watch it come to life</li>
        <li><strong>Share with your guests</strong> - Get a unique link to share anywhere</li>
      </ol>
      <a href="{appUrl}/dashboard/create" class="button">Start Creating</a>
    `,
  },
  products_1: {
    subject: "Everything you need for your {eventType}",
    preheader: "Curated products for your special day",
    body: `
      <h1>Make your {eventType} unforgettable!</h1>
      <p>Hi {firstName},</p>
      <p>We noticed you're planning a {eventType}. Here are some essentials to make it perfect:</p>
      {productRecommendations}
      <a href="{appUrl}/dashboard/invitations/{invitationId}" class="button">View Your Invitation</a>
      <p><small>We partner with trusted brands to bring you the best products for your event.</small></p>
    `,
  },
  abandoned_1: {
    subject: "Your invitation is almost ready!",
    preheader: "Just a few more steps to go",
    body: `
      <h1>Don't leave your invitation unfinished!</h1>
      <p>Hi {firstName},</p>
      <p>We noticed you started creating a beautiful {eventType} invitation but didn't finish. Your design is saved and waiting for you.</p>
      <a href="{appUrl}/dashboard/invitations/{invitationId}/edit" class="button">Continue Editing</a>
      <p>Need help? Reply to this email and our team will assist you.</p>
    `,
  },
  rsvp_reminder_1: {
    subject: "RSVP deadline approaching for {eventName}",
    preheader: "{pendingCount} guests haven't responded yet",
    body: `
      <h1>Time to follow up on RSVPs</h1>
      <p>Hi {firstName},</p>
      <p>Your RSVP deadline for <strong>{eventName}</strong> is in 7 days, and {pendingCount} guests haven't responded yet.</p>
      <h3>Current Status:</h3>
      <ul>
        <li>✅ Attending: {attendingCount}</li>
        <li>❌ Not Attending: {declinedCount}</li>
        <li>⏳ Pending: {pendingCount}</li>
      </ul>
      <a href="{appUrl}/dashboard/rsvp/{invitationId}" class="button">Manage RSVPs</a>
    `,
  },
};

interface EmailTemplate {
  subject: string;
  preheader: string;
  body: string;
}

interface CampaignTrigger {
  userId: string;
  campaignId: string;
  triggeredAt: string;
  eventType?: string;
  invitationId?: string;
  metadata?: Record<string, any>;
}

/**
 * POST: Trigger a marketing campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body: CampaignTrigger = await request.json();
    const { userId, campaignId, eventType, invitationId, metadata } = body;

    if (!userId || !campaignId) {
      return NextResponse.json(
        { error: "userId and campaignId are required" },
        { status: 400 }
      );
    }

    const campaign = CAMPAIGNS[campaignId as keyof typeof CAMPAIGNS];
    if (!campaign) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Schedule all emails in the campaign
    const scheduledEmails = campaign.emails.map((email, index) => {
      const sendAt = new Date(now);
      sendAt.setDate(sendAt.getDate() + email.delay);

      return {
        id: `${userId}_${campaignId}_${index}_${Date.now()}`,
        campaignId,
        userId,
        emailIndex: index,
        template: email.template,
        subject: email.subject,
        scheduledFor: sendAt.toISOString(),
        status: "scheduled",
        eventType,
        invitationId,
        metadata,
        createdAt: now.toISOString(),
      };
    });

    // Store scheduled emails in DynamoDB
    for (const email of scheduledEmails) {
      await docClient.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_EMAIL_QUEUE_TABLE || "invitegen-email-queue",
          Item: email,
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        emailsScheduled: scheduledEmails.length,
        scheduledEmails: scheduledEmails.map((e) => ({
          template: e.template,
          scheduledFor: e.scheduledFor,
        })),
      },
    });
  } catch (error) {
    console.error("Campaign trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger campaign" },
      { status: 500 }
    );
  }
}

/**
 * GET: List available campaigns
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      campaigns: Object.values(CAMPAIGNS).map((c) => ({
        id: c.id,
        name: c.name,
        emailCount: c.emails.length,
      })),
    },
  });
}
