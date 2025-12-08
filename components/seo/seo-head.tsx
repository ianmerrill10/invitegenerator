/**
 * SEO Head Component
 *
 * Reusable component for page-level SEO meta tags.
 * Uses Next.js 14 Metadata API patterns.
 */

import { Metadata } from "next";

const SITE_NAME = "InviteGenerator";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com";
const DEFAULT_DESCRIPTION =
  "Create beautiful, personalized invitations for any occasion. Free AI-powered design, RSVP tracking, and easy sharing.";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Generate metadata object for Next.js pages
 */
export function generateSEOMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  canonical,
  ogImage,
  ogType = "website",
  article,
  noIndex = false,
  noFollow = false,
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical || SITE_URL;
  const image = ogImage || `${SITE_URL}/og-default.png`;

  const robots: Metadata["robots"] = {};
  if (noIndex) robots.index = false;
  if (noFollow) robots.follow = false;

  return {
    title: fullTitle,
    description,
    keywords: [
      "invitations",
      "digital invitations",
      "party planning",
      "event invitations",
      "RSVP",
      ...keywords,
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: Object.keys(robots).length > 0 ? robots : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: ogType,
      ...(article && ogType === "article"
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.author ? [article.author] : undefined,
            section: article.section,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@invitegenerator",
    },
  };
}

/**
 * Default metadata for the entire site
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Create Beautiful Digital Invitations`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "invitations",
    "digital invitations",
    "party invitations",
    "wedding invitations",
    "birthday invitations",
    "baby shower invitations",
    "RSVP tracking",
    "event planning",
    "free invitations",
    "AI invitation maker",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Create Beautiful Digital Invitations`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Create Beautiful Digital Invitations`,
    description: DEFAULT_DESCRIPTION,
    creator: "@invitegenerator",
    images: [`${SITE_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

// Event type specific SEO data
export const EVENT_TYPE_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  wedding: {
    title: "Wedding Invitation Templates",
    description:
      "Create stunning wedding invitations with our free AI-powered design tools. Beautiful templates, easy customization, and RSVP tracking included.",
    keywords: [
      "wedding invitations",
      "wedding invite",
      "save the date",
      "wedding RSVP",
      "digital wedding invitation",
    ],
  },
  birthday: {
    title: "Birthday Invitation Templates",
    description:
      "Design fun and creative birthday party invitations for any age. Kids parties, milestone birthdays, and more with free templates.",
    keywords: [
      "birthday invitations",
      "party invites",
      "kids birthday",
      "birthday party",
      "milestone birthday",
    ],
  },
  baby_shower: {
    title: "Baby Shower Invitation Templates",
    description:
      "Beautiful baby shower invitations for boys, girls, or gender-neutral celebrations. Easy RSVP tracking and guest management.",
    keywords: [
      "baby shower invitations",
      "baby shower invite",
      "gender reveal",
      "baby party",
      "shower invitations",
    ],
  },
  bridal_shower: {
    title: "Bridal Shower Invitation Templates",
    description:
      "Elegant bridal shower invitations to celebrate the bride-to-be. Modern designs with easy customization and sharing.",
    keywords: [
      "bridal shower invitations",
      "bachelorette party",
      "bridal party",
      "wedding shower",
      "hen party",
    ],
  },
  graduation: {
    title: "Graduation Party Invitation Templates",
    description:
      "Celebrate academic achievements with custom graduation party invitations. High school, college, and more.",
    keywords: [
      "graduation invitations",
      "grad party",
      "graduation announcement",
      "commencement",
      "class of",
    ],
  },
  corporate: {
    title: "Corporate Event Invitation Templates",
    description:
      "Professional corporate event invitations for conferences, galas, team building, and business celebrations.",
    keywords: [
      "corporate invitations",
      "business event",
      "conference invite",
      "company party",
      "professional event",
    ],
  },
  holiday: {
    title: "Holiday Party Invitation Templates",
    description:
      "Festive holiday party invitations for Christmas, Halloween, Thanksgiving, New Year, and more seasonal celebrations.",
    keywords: [
      "holiday invitations",
      "Christmas party",
      "Halloween invite",
      "New Year party",
      "holiday celebration",
    ],
  },
};
