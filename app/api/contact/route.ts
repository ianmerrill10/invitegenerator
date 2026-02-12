import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIP, getRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDB client setup
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CONTACT_TABLE = process.env.DYNAMODB_CONTACTS_TABLE || "InviteGenerator-Contacts-production";

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Rate limit config: 5 submissions per hour per IP
const CONTACT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "contact",
};

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(ip, CONTACT_RATE_LIMIT);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT",
            message: "Too many submissions. Please try again later."
          }
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.errors[0]?.message || "Invalid form data",
            details: validation.error.errors,
          }
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const { name, email, company, subject, message } = validation.data;

    // Generate unique ID for the submission
    const submissionId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Store in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: CONTACT_TABLE,
        Item: {
          PK: "CONTACT_SUBMISSIONS",
          SK: submissionId,
          GSI1PK: `CONTACT#${email.toLowerCase()}`,
          GSI1SK: timestamp,
          id: submissionId,
          name,
          email: email.toLowerCase(),
          company: company || null,
          subject,
          message,
          status: "new", // new, read, responded, archived
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") || null,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        id: submissionId,
        message: "Thank you for your message. We'll get back to you within 24 hours.",
      },
    }, { headers: rateLimitHeaders });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to submit contact form. Please try again."
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/contact - Get contact submissions (admin only)
export async function GET() {
  // This would require admin authentication
  return NextResponse.json(
    { success: false, error: { code: "NOT_IMPLEMENTED", message: "Admin endpoint not implemented" } },
    { status: 501 }
  );
}
