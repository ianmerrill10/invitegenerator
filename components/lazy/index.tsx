/**
 * Lazy loaded components for code splitting
 * Use these for heavy components that aren't needed immediately
 */
import dynamic from "next/dynamic";

// Loading placeholder component
const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
  </div>
);

// Editor components - heavy, only needed on editor page
export const LazyEditorToolbar = dynamic(
  () => import("@/components/editor/editor-toolbar").then((mod) => mod.EditorToolbar),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyLayersPanel = dynamic(
  () => import("@/components/editor/layers-panel").then((mod) => mod.LayersPanel),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyPropertiesPanel = dynamic(
  () => import("@/components/editor/properties-panel").then((mod) => mod.PropertiesPanel),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyTextEffectsPanel = dynamic(
  () => import("@/components/editor/text-effects-panel").then((mod) => mod.TextEffectsPanel),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyElementLibrary = dynamic(
  () => import("@/components/editor/element-library").then((mod) => mod.ElementLibrary),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyBackgroundRemoval = dynamic(
  () => import("@/components/editor/background-removal").then((mod) => mod.BackgroundRemoval),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyColorPicker = dynamic(
  () => import("@/components/editor/color-picker").then((mod) => mod.ColorPicker),
  { loading: LoadingPlaceholder, ssr: false }
);

export const LazyFontPicker = dynamic(
  () => import("@/components/editor/font-picker").then((mod) => mod.FontPicker),
  { loading: LoadingPlaceholder, ssr: false }
);

// Template preview - heavy component with animations
export const LazyTemplatePreviewDialog = dynamic(
  () => import("@/components/templates/template-preview").then((mod) => mod.TemplatePreviewDialog),
  { loading: LoadingPlaceholder }
);

export const LazyTemplatePreviewInline = dynamic(
  () => import("@/components/templates/template-preview").then((mod) => mod.TemplatePreviewInline),
  { loading: LoadingPlaceholder }
);

// Template gallery - heavy with many images
export const LazyTemplateGallery = dynamic(
  () => import("@/components/templates/template-gallery").then((mod) => mod.TemplateGallery),
  { loading: LoadingPlaceholder }
);

// Media gallery - heavy component
export const LazyMediaGallery = dynamic(
  () => import("@/components/media/media-gallery").then((mod) => mod.MediaGallery),
  { loading: LoadingPlaceholder, ssr: false }
);

// QR Code component
export const LazyQRCode = dynamic(
  () => import("@/components/invitation/qr-code").then((mod) => mod.QRCode),
  { loading: LoadingPlaceholder, ssr: false }
);

// Share dialog - loaded when needed
export const LazyShareDialog = dynamic(
  () => import("@/components/share/share-dialog").then((mod) => mod.ShareDialog),
  { loading: LoadingPlaceholder, ssr: false }
);

// Guest management components
export const LazyGuestTable = dynamic(
  () => import("@/components/guests/guest-table").then((mod) => mod.GuestTable),
  { loading: LoadingPlaceholder }
);

export const LazyGuestImport = dynamic(
  () => import("@/components/guests/guest-import").then((mod) => mod.GuestImport),
  { loading: LoadingPlaceholder, ssr: false }
);

// Analytics overview - dashboard component
export const LazyAnalyticsOverview = dynamic(
  () => import("@/components/dashboard/analytics-overview").then((mod) => mod.AnalyticsOverview),
  { loading: LoadingPlaceholder }
);

// Billing components
export const LazyPricingCard = dynamic(
  () => import("@/components/billing/pricing-card").then((mod) => mod.PricingCard),
  { loading: LoadingPlaceholder }
);

export const LazySubscriptionStatus = dynamic(
  () => import("@/components/billing/subscription-status").then((mod) => mod.SubscriptionStatus),
  { loading: LoadingPlaceholder }
);
