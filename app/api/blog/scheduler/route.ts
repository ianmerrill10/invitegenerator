/**
 * Blog Scheduler API
 *
 * Automated blog content generation and publishing system.
 * Designed to be called by a cron job (e.g., Vercel Cron, AWS EventBridge)
 *
 * Schedule: Generates 1 new article daily at 9 AM UTC
 *
 * POST /api/blog/scheduler - Generate and schedule a new blog post
 * GET /api/blog/scheduler - Get scheduler status and upcoming posts
 */

import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const BLOG_TABLE = process.env.DYNAMODB_BLOG_TABLE || "BlogPosts-production";

// Content calendar - topics organized by category with SEO focus
const CONTENT_CALENDAR = {
  monday: {
    category: "wedding",
    topics: [
      "wedding invitation wording for every style",
      "how to address wedding invitations properly",
      "destination wedding invitation tips",
      "save the date vs wedding invitation guide",
      "wedding RSVP etiquette explained",
      "rustic wedding invitation ideas",
      "modern minimalist wedding stationery",
      "wedding invitation timeline checklist",
    ],
  },
  tuesday: {
    category: "birthday",
    topics: [
      "creative birthday party themes for kids",
      "milestone birthday celebration ideas",
      "adult birthday party planning guide",
      "virtual birthday party ideas that work",
      "birthday invitation wording examples",
      "surprise birthday party planning tips",
      "budget-friendly birthday party ideas",
      "first birthday party planning checklist",
    ],
  },
  wednesday: {
    category: "baby_shower",
    topics: [
      "baby shower planning complete guide",
      "gender reveal party ideas 2025",
      "co-ed baby shower planning tips",
      "baby shower invitation wording examples",
      "virtual baby shower ideas",
      "baby shower games everyone loves",
      "baby shower themes for any style",
      "baby shower etiquette guide",
    ],
  },
  thursday: {
    category: "how_to",
    topics: [
      "how to create digital invitations",
      "RSVP tracking best practices",
      "how to word party invitations",
      "party planning on a budget guide",
      "how to host a virtual event",
      "choosing the perfect party theme",
      "guest list management tips",
      "event reminder strategies that work",
    ],
  },
  friday: {
    category: "corporate",
    topics: [
      "corporate event invitation templates guide",
      "company holiday party planning",
      "team building event ideas",
      "product launch party tips",
      "networking event invitation best practices",
      "conference invitation design",
      "virtual corporate event planning",
      "professional awards ceremony guide",
    ],
  },
  saturday: {
    category: "seasonal",
    topics: [
      "christmas party invitation ideas",
      "halloween party themes and invitations",
      "thanksgiving dinner invitation guide",
      "new years eve party planning",
      "summer party invitation trends",
      "spring celebration party ideas",
      "fall harvest party themes",
      "holiday party planning checklist",
    ],
  },
  sunday: {
    category: "how_to",
    topics: [
      "AI invitation design tutorial",
      "print vs digital invitations comparison",
      "eco-friendly invitation options",
      "invitation design trends for the year",
      "personalization tips for invitations",
      "color theory for event invitations",
      "typography guide for invitations",
      "photo invitation design tips",
    ],
  },
};

interface SchedulerRequest {
  action?: "generate" | "publish" | "status";
  category?: string;
  topic?: string;
  publishImmediately?: boolean;
}

/**
 * POST: Generate new content or publish scheduled posts
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or admin API key
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const adminKey = process.env.ADMIN_API_KEY;

    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      request.headers.get("x-api-key") === adminKey;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: SchedulerRequest = await request.json().catch(() => ({}));
    const action = body.action || "generate";

    if (action === "publish") {
      // Publish any scheduled posts that are due
      return await publishScheduledPosts();
    }

    // Generate new content
    const dayOfWeek = getDayName();
    const dayConfig = CONTENT_CALENDAR[dayOfWeek as keyof typeof CONTENT_CALENDAR];

    const category = body.category || dayConfig.category;
    const topics = body.topic
      ? [body.topic]
      : dayConfig.topics;

    // Pick a random topic from today's topics
    const topic = topics[Math.floor(Math.random() * topics.length)];

    // Check if we already generated a post for this topic recently
    const existingPost = await checkExistingPost(topic);
    if (existingPost) {
      return NextResponse.json({
        success: true,
        message: "Post already exists for this topic",
        data: { existingPostId: existingPost.id },
      });
    }

    // Generate the blog post using AI
    const generatedPost = await generateBlogPost(topic, category);

    // Calculate publish date (immediate or scheduled)
    const publishDate = body.publishImmediately
      ? new Date().toISOString()
      : getNextPublishDate();

    // Save to database
    const postId = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: BLOG_TABLE,
        Item: {
          id: postId,
          slug: generatedPost.slug,
          title: generatedPost.title,
          excerpt: generatedPost.excerpt,
          content: generatedPost.content,
          category: category,
          tags: generatedPost.tags,
          author: "InviteGenerator Team",
          readTime: calculateReadTime(generatedPost.content),
          featured: false,
          image: getCategoryColor(category),
          seoTitle: generatedPost.seoTitle,
          seoDescription: generatedPost.seoDescription,
          keywords: generatedPost.keywords,
          status: body.publishImmediately ? "published" : "scheduled",
          scheduledFor: publishDate,
          publishedAt: body.publishImmediately ? now : null,
          createdAt: now,
          updatedAt: now,
          generatedBy: "ai-scheduler",
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: body.publishImmediately
        ? "Blog post generated and published"
        : "Blog post generated and scheduled",
      data: {
        id: postId,
        slug: generatedPost.slug,
        title: generatedPost.title,
        category: category,
        status: body.publishImmediately ? "published" : "scheduled",
        scheduledFor: publishDate,
      },
    });
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json(
      { success: false, error: "Scheduler operation failed" },
      { status: 500 }
    );
  }
}

/**
 * GET: Get scheduler status
 */
export async function GET(request: NextRequest) {
  try {
    // Get scheduled posts
    const result = await docClient.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: "#status = :scheduled",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":scheduled": "scheduled",
        },
      })
    );

    const scheduledPosts = result.Items || [];

    // Get today's content calendar
    const dayOfWeek = getDayName();
    const todayConfig = CONTENT_CALENDAR[dayOfWeek as keyof typeof CONTENT_CALENDAR];

    // Get recent published posts count
    const recentResult = await docClient.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: "#status = :published",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":published": "published",
        },
      })
    );

    const publishedPosts = recentResult.Items || [];

    return NextResponse.json({
      success: true,
      data: {
        status: "active",
        today: {
          day: dayOfWeek,
          category: todayConfig.category,
          availableTopics: todayConfig.topics.length,
        },
        scheduled: {
          count: scheduledPosts.length,
          posts: scheduledPosts.map((p) => ({
            id: p.id,
            title: p.title,
            scheduledFor: p.scheduledFor,
          })),
        },
        published: {
          total: publishedPosts.length,
        },
        nextPublishTime: getNextPublishDate(),
        contentCalendar: Object.entries(CONTENT_CALENDAR).map(([day, config]) => ({
          day,
          category: config.category,
          topicCount: config.topics.length,
        })),
      },
    });
  } catch (error) {
    console.error("Scheduler status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get scheduler status" },
      { status: 500 }
    );
  }
}

// Helper functions

function getDayName(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date().getDay()];
}

function getNextPublishDate(): string {
  const now = new Date();
  const publishTime = new Date(now);
  publishTime.setUTCHours(9, 0, 0, 0); // 9 AM UTC

  if (now >= publishTime) {
    publishTime.setDate(publishTime.getDate() + 1);
  }

  return publishTime.toISOString();
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    wedding: "#D4919F",
    birthday: "#9333EA",
    baby_shower: "#3B82F6",
    corporate: "#475569",
    seasonal: "#DC2626",
    how_to: "#10B981",
  };
  return colors[category] || "#64748B";
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

async function checkExistingPost(topic: string): Promise<{ id: string } | null> {
  try {
    const slug = generateSlug(topic);
    const result = await docClient.send(
      new QueryCommand({
        TableName: BLOG_TABLE,
        IndexName: "slug-index",
        KeyConditionExpression: "slug = :slug",
        ExpressionAttributeValues: {
          ":slug": slug,
        },
      })
    );

    if (result.Items && result.Items.length > 0) {
      return { id: result.Items[0].id as string };
    }
    return null;
  } catch {
    return null;
  }
}

async function publishScheduledPosts(): Promise<NextResponse> {
  try {
    const now = new Date().toISOString();

    // Find posts scheduled for publication
    const result = await docClient.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
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

    const postsToPublish = result.Items || [];
    const publishedIds: string[] = [];

    for (const post of postsToPublish) {
      await docClient.send(
        new UpdateCommand({
          TableName: BLOG_TABLE,
          Key: { id: post.id },
          UpdateExpression: "SET #status = :published, publishedAt = :now, updatedAt = :now",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":published": "published",
            ":now": now,
          },
        })
      );
      publishedIds.push(post.id as string);
    }

    return NextResponse.json({
      success: true,
      message: `Published ${publishedIds.length} scheduled posts`,
      data: { publishedIds },
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish scheduled posts" },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

async function generateBlogPost(
  topic: string,
  category: string
): Promise<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}> {
  const prompt = `You are an expert content writer for InviteGenerator, a platform that helps people create beautiful digital invitations. Write an SEO-optimized, comprehensive blog post about: "${topic}"

IMPORTANT REQUIREMENTS:
1. Title: Catchy, includes the main keyword, under 60 characters
2. Meta Description: Compelling summary, 150-160 characters
3. Content: 1800-2200 words, well-structured with H2 and H3 headings
4. Include practical tips, examples, and actionable advice
5. Use a friendly, authoritative, helpful tone
6. Include bullet points and numbered lists for readability
7. Add internal CTAs to InviteGenerator features (templates, signup)
8. Make it genuinely helpful - this should rank on Google

FORMAT YOUR RESPONSE AS VALID JSON:
{
  "title": "Catchy Title Under 60 Characters",
  "seoTitle": "SEO Title | InviteGenerator",
  "seoDescription": "150-160 character meta description that compels clicks",
  "excerpt": "2-3 sentence summary for blog listings",
  "content": "<Full HTML content with h2, h3, p, ul, ol, li, blockquote, strong, em tags>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["primary keyword", "secondary keyword", "tertiary keyword"]
}

Write engaging, genuinely helpful content that provides real value to readers planning events. Include specific examples, templates, and practical tips they can use immediately.`;

  try {
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 8000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const generatedContent = responseBody.content[0].text;

    // Parse JSON from response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || topic,
        slug: generateSlug(parsed.title || topic),
        excerpt: parsed.excerpt || `Learn everything about ${topic}`,
        content: parsed.content || generatedContent,
        tags: parsed.tags || [category],
        seoTitle: parsed.seoTitle || parsed.title,
        seoDescription: parsed.seoDescription || parsed.excerpt,
        keywords: parsed.keywords || [topic],
      };
    }

    // Fallback if JSON parsing fails
    return {
      title: topic,
      slug: generateSlug(topic),
      excerpt: `Comprehensive guide to ${topic}`,
      content: generatedContent,
      tags: [category],
      seoTitle: topic,
      seoDescription: `Learn about ${topic} with our comprehensive guide.`,
      keywords: [topic],
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate blog content");
  }
}
