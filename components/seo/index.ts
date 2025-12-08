/**
 * SEO Components Index
 *
 * Export all SEO-related components for easy importing.
 */

// Metadata generation
export { generateSEOMetadata, defaultMetadata, EVENT_TYPE_SEO } from "./seo-head";

// Structured data (JSON-LD)
export {
  OrganizationSchema,
  WebSiteSchema,
  ArticleSchema,
  ProductSchema,
  FAQSchema,
  BreadcrumbSchema,
  HowToSchema,
  SoftwareApplicationSchema,
  LocalBusinessSchema,
} from "./structured-data";
