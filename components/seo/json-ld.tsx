import Script from "next/script";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

export function OrganizationSchema({
  name = "InviteGenerator",
  url = "https://invitegenerator.com",
  logo = "https://invitegenerator.com/icon.svg",
  description = "AI-powered invitation generator for creating stunning digital invitations for any event.",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs: [
      "https://twitter.com/invitegenerator",
      "https://facebook.com/invitegenerator",
      "https://instagram.com/invitegenerator",
      "https://linkedin.com/company/invitegenerator",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@invitegenerator.com",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebsiteSchema({
  name = "InviteGenerator",
  url = "https://invitegenerator.com",
  description = "Create stunning AI-powered invitations for any event in seconds.",
}: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/dashboard/templates?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name?: string;
  description?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export function SoftwareApplicationSchema({
  name = "InviteGenerator",
  description = "AI-powered invitation generator for creating stunning digital invitations.",
  applicationCategory = "DesignApplication",
  operatingSystem = "Web",
  offers = { price: "0", priceCurrency: "USD" },
}: SoftwareApplicationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  price: string;
  priceCurrency?: string;
  availability?: string;
}

export function ProductSchema({
  name,
  description,
  image = "https://invitegenerator.com/og-image.png",
  price,
  priceCurrency = "USD",
  availability = "https://schema.org/InStock",
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability,
      seller: {
        "@type": "Organization",
        name: "InviteGenerator",
      },
    },
  };

  return (
    <Script
      id={`product-schema-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  email?: string;
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = "InviteGenerator",
  description = "AI-powered invitation generator for creating stunning digital invitations.",
  url = "https://invitegenerator.com",
  email = "support@invitegenerator.com",
  priceRange = "$",
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    email,
    priceRange,
    image: "https://invitegenerator.com/og-image.png",
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface EventSchemaProps {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  organizer?: {
    name: string;
    email?: string;
  };
  image?: string;
  url?: string;
  eventAttendanceMode?: "offline" | "online" | "mixed";
  eventStatus?: "scheduled" | "cancelled" | "postponed";
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  image,
  url,
  eventAttendanceMode = "offline",
  eventStatus = "scheduled",
}: EventSchemaProps) {
  const attendanceModeMap = {
    offline: "https://schema.org/OfflineEventAttendanceMode",
    online: "https://schema.org/OnlineEventAttendanceMode",
    mixed: "https://schema.org/MixedEventAttendanceMode",
  };

  const statusMap = {
    scheduled: "https://schema.org/EventScheduled",
    cancelled: "https://schema.org/EventCancelled",
    postponed: "https://schema.org/EventPostponed",
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    startDate,
    eventAttendanceMode: attendanceModeMap[eventAttendanceMode],
    eventStatus: statusMap[eventStatus],
  };

  if (description) schema.description = description;
  if (endDate) schema.endDate = endDate;
  if (image) schema.image = image;
  if (url) schema.url = url;

  if (location) {
    schema.location = {
      "@type": "Place",
      name: location.name,
      ...(location.address && {
        address: {
          "@type": "PostalAddress",
          streetAddress: location.address,
        },
      }),
    };
  }

  if (organizer) {
    schema.organizer = {
      "@type": "Person",
      name: organizer.name,
      ...(organizer.email && { email: organizer.email }),
    };
  }

  return (
    <Script
      id={`event-schema-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  totalTime?: string;
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime = "PT10M",
}: HowToSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ReviewSchemaProps {
  itemReviewed: {
    name: string;
    type?: string;
  };
  author: string;
  reviewRating: number;
  reviewBody: string;
  datePublished?: string;
}

export function ReviewSchema({
  itemReviewed,
  author,
  reviewRating,
  reviewBody,
  datePublished = new Date().toISOString(),
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": itemReviewed.type || "SoftwareApplication",
      name: itemReviewed.name,
    },
    author: {
      "@type": "Person",
      name: author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody,
    datePublished,
  };

  return (
    <Script
      id={`review-schema-${author.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
}: VideoSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
  };

  if (contentUrl) schema.contentUrl = contentUrl;
  if (embedUrl) schema.embedUrl = embedUrl;
  if (duration) schema.duration = duration;

  return (
    <Script
      id={`video-schema-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Export all schemas
export {
  OrganizationSchema as Organization,
  WebsiteSchema as Website,
  SoftwareApplicationSchema as SoftwareApplication,
  FAQSchema as FAQ,
  ProductSchema as Product,
  BreadcrumbSchema as Breadcrumb,
  LocalBusinessSchema as LocalBusiness,
  EventSchema as Event,
  HowToSchema as HowTo,
  ReviewSchema as Review,
  VideoSchema as Video,
};
