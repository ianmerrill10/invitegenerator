/**
 * Dynamic Sitemap Generator
 *
 * Generates sitemap.xml for search engines.
 * Includes static pages, blog posts, and template categories.
 */

import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";

// Event type categories for template pages
const EVENT_TYPES = [
  "wedding",
  "birthday",
  "baby_shower",
  "bridal_shower",
  "graduation",
  "anniversary",
  "corporate",
  "holiday",
  "dinner_party",
  "engagement",
  "housewarming",
  "retirement",
  "reunion",
  "religious",
];

// Static pages
const STATIC_PAGES = [
  { path: "", priority: 1.0, changeFreq: "weekly" as const },
  { path: "/features", priority: 0.9, changeFreq: "monthly" as const },
  { path: "/pricing", priority: 0.9, changeFreq: "monthly" as const },
  { path: "/templates", priority: 0.9, changeFreq: "weekly" as const },
  { path: "/blog", priority: 0.8, changeFreq: "daily" as const },
  { path: "/about", priority: 0.6, changeFreq: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFreq: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFreq: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFreq: "yearly" as const },
  { path: "/cookies", priority: 0.3, changeFreq: "yearly" as const },
  { path: "/auth/login", priority: 0.5, changeFreq: "monthly" as const },
  { path: "/auth/register", priority: 0.5, changeFreq: "monthly" as const },
];

// Static blog posts (from the blog API)
const STATIC_BLOG_POSTS = [
  "ultimate-guide-wedding-invitation-wording",
  "50-creative-birthday-party-themes-kids",
  "baby-shower-planning-complete-checklist",
  "digital-vs-paper-invitations-pros-cons",
  "rsvp-tracking-best-practices",
  "christmas-party-invitation-ideas-2024",
  "corporate-event-invitation-templates-guide",
  "how-to-create-stunning-invitations-ai",
  "bridal-shower-etiquette-modern-guide",
  "virtual-party-planning-tips",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticUrls = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  // Template category pages
  const templateUrls = EVENT_TYPES.map((eventType) => ({
    url: `${SITE_URL}/templates/${eventType}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog post pages
  const blogUrls = STATIC_BLOG_POSTS.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // In production, you would fetch dynamic blog posts from DynamoDB:
  // const dynamicBlogPosts = await fetchBlogPostSlugs();
  // const dynamicBlogUrls = dynamicBlogPosts.map(...)

  return [...staticUrls, ...templateUrls, ...blogUrls];
}
