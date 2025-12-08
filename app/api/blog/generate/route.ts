/**
 * AI Blog Generator API
 *
 * Generates SEO-optimized blog content using Claude AI.
 * Topics focus on event planning, invitations, and party ideas.
 *
 * SEO STRATEGY:
 * - Long-tail keywords for event planning
 * - How-to guides and tutorials
 * - Seasonal content calendar
 * - Product-integrated content (affiliate)
 */

import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Blog topic categories for SEO
const BLOG_CATEGORIES = [
  {
    id: "wedding",
    name: "Wedding Planning",
    topics: [
      "wedding invitation wording examples",
      "save the date vs wedding invitation",
      "how to address wedding invitations",
      "wedding invitation etiquette",
      "destination wedding invitations",
      "rustic wedding invitation ideas",
      "modern minimalist wedding invites",
      "wedding RSVP wording",
    ],
  },
  {
    id: "birthday",
    name: "Birthday Party Ideas",
    topics: [
      "kids birthday party themes",
      "milestone birthday party ideas",
      "birthday invitation wording",
      "virtual birthday party ideas",
      "adult birthday party themes",
      "first birthday party planning",
      "surprise birthday party tips",
      "budget birthday party ideas",
    ],
  },
  {
    id: "baby_shower",
    name: "Baby Shower Planning",
    topics: [
      "baby shower invitation wording",
      "gender reveal party ideas",
      "virtual baby shower planning",
      "baby shower themes for girls",
      "baby shower themes for boys",
      "co-ed baby shower ideas",
      "baby shower games and activities",
      "baby shower etiquette guide",
    ],
  },
  {
    id: "seasonal",
    name: "Seasonal & Holiday",
    topics: [
      "christmas party invitation ideas",
      "halloween party themes",
      "thanksgiving dinner invitations",
      "new years eve party planning",
      "summer party ideas",
      "spring celebration themes",
      "fall harvest party ideas",
      "holiday party planning checklist",
    ],
  },
  {
    id: "corporate",
    name: "Corporate Events",
    topics: [
      "corporate event invitation templates",
      "company holiday party ideas",
      "team building event planning",
      "product launch party tips",
      "networking event invitations",
      "conference invitation best practices",
      "virtual corporate event ideas",
      "awards ceremony planning",
    ],
  },
  {
    id: "how_to",
    name: "How-To Guides",
    topics: [
      "how to create digital invitations",
      "how to track RSVPs online",
      "how to word party invitations",
      "how to plan a party on a budget",
      "how to host a virtual event",
      "how to choose party themes",
      "how to create a guest list",
      "how to set up event reminders",
    ],
  },
];

interface GenerateRequest {
  topic?: string;
  category?: string;
  keywords?: string[];
  includeProducts?: boolean;
}

/**
 * POST: Generate a blog post
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, category, keywords = [], includeProducts = true } = body;

    // Select topic if not provided
    let selectedTopic = topic;
    let selectedCategory = category;

    if (!selectedTopic) {
      // Random selection from categories
      const randomCategory = BLOG_CATEGORIES[Math.floor(Math.random() * BLOG_CATEGORIES.length)];
      selectedCategory = randomCategory.id;
      selectedTopic = randomCategory.topics[Math.floor(Math.random() * randomCategory.topics.length)];
    }

    // Generate blog content with Claude
    const prompt = buildBlogPrompt(selectedTopic, selectedCategory, keywords, includeProducts);

    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
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

    // Parse the generated content
    const blogPost = parseGeneratedContent(generatedContent, selectedTopic, selectedCategory);

    // Save to database
    const postId = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_BLOG_TABLE || "invitegen-blog",
        Item: {
          id: postId,
          slug: blogPost.slug,
          title: blogPost.title,
          excerpt: blogPost.excerpt,
          content: blogPost.content,
          category: selectedCategory,
          tags: blogPost.tags,
          seoTitle: blogPost.seoTitle,
          seoDescription: blogPost.seoDescription,
          keywords: blogPost.keywords,
          status: "draft",
          author: "InviteGenerator Team",
          createdAt: now,
          updatedAt: now,
        },
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        id: postId,
        ...blogPost,
      },
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}

/**
 * GET: List blog topic suggestions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      categories: BLOG_CATEGORIES,
      totalTopics: BLOG_CATEGORIES.reduce((sum, cat) => sum + cat.topics.length, 0),
    },
  });
}

function buildBlogPrompt(
  topic: string,
  category: string | undefined,
  keywords: string[],
  includeProducts: boolean
): string {
  return `You are an expert content writer for InviteGenerator, a platform that helps people create beautiful digital invitations. Write an SEO-optimized blog post about: "${topic}"

Requirements:
1. Title: Catchy, includes the main keyword, under 60 characters
2. Meta Description: Compelling summary, 150-160 characters
3. Content: 1500-2000 words, well-structured with H2 and H3 headings
4. Include practical tips and actionable advice
5. Use a friendly, helpful tone
6. Include internal links to InviteGenerator features where relevant
${includeProducts ? "7. Naturally mention relevant party supplies/products that readers might need" : ""}
${keywords.length > 0 ? `8. Include these keywords naturally: ${keywords.join(", ")}` : ""}

Format your response as JSON:
{
  "title": "Blog post title",
  "seoTitle": "SEO optimized title (can be same as title)",
  "seoDescription": "Meta description for search engines",
  "excerpt": "2-3 sentence excerpt for blog listing",
  "content": "Full HTML content with proper headings (h2, h3), paragraphs, lists, etc.",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2"]
}

Write engaging, helpful content that will rank well in search engines and provide genuine value to readers planning events.`;
}

function parseGeneratedContent(
  content: string,
  topic: string,
  category: string | undefined
): {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  content: string;
  tags: string[];
  keywords: string[];
} {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || topic,
        slug: generateSlug(parsed.title || topic),
        seoTitle: parsed.seoTitle || parsed.title || topic,
        seoDescription: parsed.seoDescription || parsed.excerpt || "",
        excerpt: parsed.excerpt || "",
        content: parsed.content || content,
        tags: parsed.tags || [category || "general"],
        keywords: parsed.keywords || [topic],
      };
    }
  } catch {
    // If parsing fails, use the raw content
  }

  return {
    title: topic,
    slug: generateSlug(topic),
    seoTitle: topic,
    seoDescription: `Learn about ${topic} with our comprehensive guide.`,
    excerpt: `Discover everything you need to know about ${topic}.`,
    content: content,
    tags: [category || "general"],
    keywords: [topic],
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}
