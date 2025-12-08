/**
 * Blog API
 *
 * GET /api/blog - List published blog posts
 * Supports pagination, category filtering, and search
 */

import { NextRequest, NextResponse } from "next/server";

// Static blog posts for initial launch (before AI generation is running)
const STATIC_POSTS = [
  {
    id: "1",
    slug: "ultimate-guide-wedding-invitation-wording",
    title: "The Ultimate Guide to Wedding Invitation Wording",
    excerpt: "Master the art of wedding invitation wording with our comprehensive guide covering formal, casual, and modern styles.",
    category: "wedding",
    tags: ["wedding", "invitation wording", "etiquette"],
    author: "InviteGenerator Team",
    publishedAt: "2024-11-15",
    readTime: 8,
    featured: true,
    image: "/blog/wedding-invitation-wording.jpg",
  },
  {
    id: "2",
    slug: "50-creative-birthday-party-themes-kids",
    title: "50 Creative Birthday Party Themes for Kids",
    excerpt: "From unicorns to superheroes, discover the most popular and creative birthday party themes that kids absolutely love.",
    category: "birthday",
    tags: ["birthday", "kids party", "themes"],
    author: "InviteGenerator Team",
    publishedAt: "2024-11-10",
    readTime: 12,
    featured: true,
    image: "/blog/kids-birthday-themes.jpg",
  },
  {
    id: "3",
    slug: "baby-shower-planning-complete-checklist",
    title: "Baby Shower Planning: The Complete Checklist",
    excerpt: "Plan the perfect baby shower with our step-by-step checklist covering everything from invitations to party favors.",
    category: "baby_shower",
    tags: ["baby shower", "planning", "checklist"],
    author: "InviteGenerator Team",
    publishedAt: "2024-11-05",
    readTime: 10,
    featured: false,
    image: "/blog/baby-shower-planning.jpg",
  },
  {
    id: "4",
    slug: "digital-vs-paper-invitations-pros-cons",
    title: "Digital vs Paper Invitations: Pros and Cons",
    excerpt: "Trying to decide between digital and paper invitations? We break down the advantages and disadvantages of each option.",
    category: "how_to",
    tags: ["digital invitations", "comparison", "tips"],
    author: "InviteGenerator Team",
    publishedAt: "2024-11-01",
    readTime: 6,
    featured: false,
    image: "/blog/digital-vs-paper.jpg",
  },
  {
    id: "5",
    slug: "rsvp-tracking-best-practices",
    title: "RSVP Tracking Best Practices for Event Planners",
    excerpt: "Learn how to effectively track RSVPs, send reminders, and manage your guest list like a pro.",
    category: "how_to",
    tags: ["RSVP", "event planning", "guest management"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-28",
    readTime: 7,
    featured: false,
    image: "/blog/rsvp-tracking.jpg",
  },
  {
    id: "6",
    slug: "christmas-party-invitation-ideas-2024",
    title: "Christmas Party Invitation Ideas for 2024",
    excerpt: "Get inspired with the latest Christmas party invitation trends, from elegant winter wonderlands to fun ugly sweater themes.",
    category: "seasonal",
    tags: ["christmas", "holiday", "party ideas"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-25",
    readTime: 9,
    featured: true,
    image: "/blog/christmas-party-ideas.jpg",
  },
  {
    id: "7",
    slug: "corporate-event-invitation-templates-guide",
    title: "Corporate Event Invitation Templates: A Complete Guide",
    excerpt: "Create professional corporate event invitations that impress. From conferences to galas, we cover all the essentials.",
    category: "corporate",
    tags: ["corporate", "professional", "templates"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-20",
    readTime: 8,
    featured: false,
    image: "/blog/corporate-invitations.jpg",
  },
  {
    id: "8",
    slug: "how-to-create-stunning-invitations-ai",
    title: "How to Create Stunning Invitations with AI",
    excerpt: "Discover how AI-powered design tools can help you create beautiful, personalized invitations in minutes.",
    category: "how_to",
    tags: ["AI", "design", "tutorial"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-15",
    readTime: 5,
    featured: false,
    image: "/blog/ai-invitations.jpg",
  },
  {
    id: "9",
    slug: "bridal-shower-etiquette-modern-guide",
    title: "Bridal Shower Etiquette: A Modern Guide",
    excerpt: "Navigate bridal shower planning with confidence. Learn about invitations, gifts, games, and more.",
    category: "wedding",
    tags: ["bridal shower", "etiquette", "wedding"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-10",
    readTime: 7,
    featured: false,
    image: "/blog/bridal-shower-etiquette.jpg",
  },
  {
    id: "10",
    slug: "virtual-party-planning-tips",
    title: "Virtual Party Planning: Tips for Memorable Online Events",
    excerpt: "Host engaging virtual parties that bring people together. From invitations to activities, we've got you covered.",
    category: "how_to",
    tags: ["virtual", "online events", "tips"],
    author: "InviteGenerator Team",
    publishedAt: "2024-10-05",
    readTime: 6,
    featured: false,
    image: "/blog/virtual-party.jpg",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    let filteredPosts = [...STATIC_POSTS];

    // Apply filters
    if (category) {
      filteredPosts = filteredPosts.filter((p) => p.category === category);
    }

    if (tag) {
      filteredPosts = filteredPosts.filter((p) => p.tags.includes(tag));
    }

    if (featured === "true") {
      filteredPosts = filteredPosts.filter((p) => p.featured);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.excerpt.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Sort by date (newest first)
    filteredPosts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Pagination
    const totalCount = filteredPosts.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

    // Get all unique categories and tags
    const categories = [...new Set(STATIC_POSTS.map((p) => p.category))];
    const allTags = [...new Set(STATIC_POSTS.flatMap((p) => p.tags))];

    return NextResponse.json({
      success: true,
      data: {
        posts: paginatedPosts,
        filters: {
          categories,
          tags: allTags,
        },
      },
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Blog API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
