import { PlanFeatures, EventType, TemplateCategory } from "@/types";

// ============================================
// APPLICATION CONFIGURATION
// ============================================

export const APP_CONFIG = {
  name: "InviteGenerator",
  tagline: "Create Stunning Invitations with AI",
  description: "Design beautiful, professional invitations for any event in seconds using AI-powered generation.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://invitegenerator.com",
  supportEmail: "support@invitegenerator.com",
  socialLinks: {
    twitter: "https://twitter.com/invitegenerator",
    instagram: "https://instagram.com/invitegenerator",
    facebook: "https://facebook.com/invitegenerator",
    pinterest: "https://pinterest.com/invitegenerator",
  },
} as const;

// ============================================
// NAVIGATION
// ============================================

export const NAVIGATION = {
  main: [
    { name: "Templates", href: "/templates" },
    { name: "Pricing", href: "/pricing" },
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
  ],
  dashboard: [
    { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "My Invitations", href: "/dashboard/invitations", icon: "Mail" },
    { name: "Create New", href: "/dashboard/create", icon: "Plus" },
    { name: "Templates", href: "/dashboard/templates", icon: "Layout" },
    { name: "RSVP Tracker", href: "/dashboard/rsvp", icon: "Users" },
    { name: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ],
  footer: {
    product: [
      { name: "Features", href: "/features" },
      { name: "Templates", href: "/templates" },
      { name: "Pricing", href: "/pricing" },
      { name: "How It Works", href: "/how-it-works" },
    ],
    resources: [
      { name: "Blog", href: "/blog" },
      { name: "Create Invitation", href: "/auth/signup" },
      { name: "Browse Templates", href: "/templates" },
      { name: "Get Started", href: "/auth/signup" },
    ],
    company: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
} as const;

// ============================================
// PRICING PLANS
// ============================================

export const PRICING_PLANS: PlanFeatures[] = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    invitationsPerMonth: 3,
    aiCreditsPerMonth: 5,
    guestsPerInvitation: 50,
    customBranding: false,
    premiumTemplates: false,
    analytics: false,
    prioritySupport: false,
    apiAccess: false,
    teamMembers: 1,
    features: [
      "3 invitations per month",
      "5 AI generations",
      "50 guests per invitation",
      "Basic templates",
      "Email support",
      "Standard RSVP tracking",
      "Free event website",
    ],
  },
  {
    plan: "starter",
    name: "Starter",
    price: 9,
    priceYearly: 90,
    invitationsPerMonth: 10,
    aiCreditsPerMonth: 25,
    guestsPerInvitation: 150,
    customBranding: false,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: false,
    apiAccess: false,
    teamMembers: 1,
    features: [
      "10 invitations per month",
      "25 AI generations",
      "150 guests per invitation",
      "Premium templates",
      "Basic analytics",
      "RSVP management",
      "Custom event URL",
      "Email reminders",
      "50 digital delivery credits/mo",
      "5% off print bundles",
    ],
  },
  {
    plan: "pro",
    name: "Pro",
    price: 24,
    priceYearly: 240,
    invitationsPerMonth: -1, // Unlimited
    aiCreditsPerMonth: 100,
    guestsPerInvitation: 500,
    customBranding: true,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: true,
    apiAccess: false,
    teamMembers: 3,
    features: [
      "Unlimited invitations",
      "100 AI generations",
      "500 guests per invitation",
      "All premium templates",
      "Custom branding",
      "Advanced analytics",
      "Priority support",
      "Custom domain",
      "Guest messaging",
      "Export to PDF/PNG",
      "Premium event website included",
      "150 digital delivery credits/mo",
      "25 SMS credits/mo",
      "10% off print bundles",
      "10% off rush processing",
    ],
  },
  {
    plan: "business",
    name: "Business",
    price: 79,
    priceYearly: 790,
    invitationsPerMonth: -1, // Unlimited
    aiCreditsPerMonth: -1, // Unlimited
    guestsPerInvitation: -1, // Unlimited
    customBranding: true,
    premiumTemplates: true,
    analytics: true,
    prioritySupport: true,
    apiAccess: true,
    teamMembers: -1, // Unlimited
    features: [
      "Everything in Pro",
      "Unlimited AI generations",
      "Unlimited guests",
      "API access",
      "Unlimited team members",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security",
      "Pro event website included",
      "Unlimited digital delivery",
      "100 SMS credits/mo",
      "15% off print bundles",
      "25% off rush processing",
      "Free envelope addressing (100/mo)",
    ],
  },
];

// ============================================
// EVENT CATEGORIES
// ============================================

export const EVENT_CATEGORIES: TemplateCategory[] = [
  {
    id: "wedding",
    name: "Wedding",
    description: "Elegant invitations for your special day",
    icon: "Heart",
    templateCount: 0,
  },
  {
    id: "birthday",
    name: "Birthday",
    description: "Fun and festive birthday party invites",
    icon: "Cake",
    templateCount: 0,
  },
  {
    id: "baby_shower",
    name: "Baby Shower",
    description: "Sweet designs to celebrate the new arrival",
    icon: "Baby",
    templateCount: 0,
  },
  {
    id: "bridal_shower",
    name: "Bridal Shower",
    description: "Beautiful invites for the bride-to-be",
    icon: "Sparkles",
    templateCount: 0,
  },
  {
    id: "anniversary",
    name: "Anniversary",
    description: "Celebrate years of love together",
    icon: "CalendarHeart",
    templateCount: 0,
  },
  {
    id: "graduation",
    name: "Graduation",
    description: "Honor academic achievements",
    icon: "GraduationCap",
    templateCount: 0,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional business event invitations",
    icon: "Building",
    templateCount: 0,
  },
  {
    id: "holiday",
    name: "Holiday",
    description: "Seasonal celebrations and parties",
    icon: "PartyPopper",
    templateCount: 0,
  },
  {
    id: "dinner_party",
    name: "Dinner Party",
    description: "Elegant dinner and cocktail events",
    icon: "UtensilsCrossed",
    templateCount: 0,
  },
  {
    id: "other",
    name: "Other Events",
    description: "Customizable designs for any occasion",
    icon: "Calendar",
    templateCount: 0,
  },
];

// ============================================
// DESIGN PRESETS
// ============================================

export const COLOR_PALETTES = [
  {
    name: "Classic Elegance",
    colors: ["#1C1917", "#78716C", "#D4AF37", "#FAFAF9"],
  },
  {
    name: "Modern Minimal",
    colors: ["#18181B", "#71717A", "#3B82F6", "#FFFFFF"],
  },
  {
    name: "Romantic Blush",
    colors: ["#831843", "#DB2777", "#FBCFE8", "#FDF2F8"],
  },
  {
    name: "Garden Party",
    colors: ["#14532D", "#22C55E", "#BBF7D0", "#F0FDF4"],
  },
  {
    name: "Ocean Breeze",
    colors: ["#164E63", "#0891B2", "#67E8F9", "#ECFEFF"],
  },
  {
    name: "Sunset Warmth",
    colors: ["#7C2D12", "#EA580C", "#FDBA74", "#FFF7ED"],
  },
  {
    name: "Royal Purple",
    colors: ["#4C1D95", "#8B5CF6", "#DDD6FE", "#F5F3FF"],
  },
  {
    name: "Earthy Neutral",
    colors: ["#44403C", "#A8A29E", "#D6D3D1", "#FAFAF9"],
  },
];

export const FONT_PAIRS = [
  {
    name: "Classic Serif",
    heading: "Playfair Display",
    body: "Source Serif Pro",
  },
  {
    name: "Modern Sans",
    heading: "Outfit",
    body: "Inter",
  },
  {
    name: "Elegant Script",
    heading: "Cormorant Garamond",
    body: "Montserrat",
  },
  {
    name: "Bold & Clean",
    heading: "Bebas Neue",
    body: "Open Sans",
  },
  {
    name: "Playful",
    heading: "Fredoka One",
    body: "Nunito",
  },
  {
    name: "Minimalist",
    heading: "DM Sans",
    body: "DM Sans",
  },
];

// ============================================
// INVITATION SIZES
// ============================================

export const INVITATION_SIZES = [
  { name: "Standard", width: 800, height: 1120, aspectRatio: "5:7" },
  { name: "Square", width: 800, height: 800, aspectRatio: "1:1" },
  { name: "Wide", width: 1200, height: 800, aspectRatio: "3:2" },
  { name: "Instagram", width: 1080, height: 1080, aspectRatio: "1:1" },
  { name: "Story", width: 1080, height: 1920, aspectRatio: "9:16" },
  { name: "A5", width: 827, height: 1169, aspectRatio: "1:1.41" },
] as const;

// ============================================
// AI GENERATION OPTIONS
// ============================================

export const AI_STYLES = {
  aesthetic: [
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "playful", label: "Playful" },
    { value: "elegant", label: "Elegant" },
    { value: "minimalist", label: "Minimalist" },
    { value: "bold", label: "Bold" },
    { value: "rustic", label: "Rustic" },
    { value: "whimsical", label: "Whimsical" },
  ],
  formality: [
    { value: "casual", label: "Casual" },
    { value: "semi-formal", label: "Semi-Formal" },
    { value: "formal", label: "Formal" },
  ],
  colorScheme: [
    { value: "warm", label: "Warm" },
    { value: "cool", label: "Cool" },
    { value: "neutral", label: "Neutral" },
    { value: "vibrant", label: "Vibrant" },
    { value: "pastel", label: "Pastel" },
    { value: "monochrome", label: "Monochrome" },
  ],
} as const;

// ============================================
// RSVP OPTIONS
// ============================================

export const DEFAULT_MEAL_OPTIONS = [
  "Chicken",
  "Beef",
  "Fish",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
];

export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Shellfish Allergy",
  "Kosher",
  "Halal",
  "Other",
];

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    verifyEmail: "/api/auth/verify-email",
  },
  invitations: {
    list: "/api/invitations",
    create: "/api/invitations",
    get: (id: string) => `/api/invitations/${id}`,
    update: (id: string) => `/api/invitations/${id}`,
    delete: (id: string) => `/api/invitations/${id}`,
    publish: (id: string) => `/api/invitations/${id}/publish`,
    duplicate: (id: string) => `/api/invitations/${id}/duplicate`,
  },
  ai: {
    generate: "/api/ai/generate",
    suggestions: "/api/ai/suggestions",
    enhance: "/api/ai/enhance",
  },
  rsvp: {
    list: (invitationId: string) => `/api/rsvp/${invitationId}`,
    submit: (invitationId: string) => `/api/rsvp/${invitationId}`,
    update: (invitationId: string, rsvpId: string) => `/api/rsvp/${invitationId}/${rsvpId}`,
    export: (invitationId: string) => `/api/rsvp/${invitationId}/export`,
  },
  templates: {
    list: "/api/templates",
    get: (id: string) => `/api/templates/${id}`,
    categories: "/api/templates/categories",
  },
  user: {
    profile: "/api/user/profile",
    settings: "/api/user/settings",
    subscription: "/api/user/subscription",
    usage: "/api/user/usage",
  },
  webhooks: {
    stripe: "/api/webhooks/stripe",
  },
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: "Invalid email or password",
    emailExists: "An account with this email already exists",
    weakPassword: "Password does not meet security requirements",
    sessionExpired: "Your session has expired. Please log in again.",
    unauthorized: "You must be logged in to access this resource",
  },
  invitation: {
    notFound: "Invitation not found",
    limitReached: "You've reached your monthly invitation limit",
    publishFailed: "Failed to publish invitation",
  },
  rsvp: {
    deadlinePassed: "The RSVP deadline has passed",
    alreadyResponded: "You have already submitted your RSVP",
    invalidResponse: "Invalid RSVP response",
  },
  ai: {
    generationFailed: "AI generation failed. Please try again.",
    noCredits: "You've used all your AI credits for this month",
    rateLimited: "Too many requests. Please wait a moment.",
  },
  generic: {
    serverError: "Something went wrong. Please try again later.",
    networkError: "Network error. Please check your connection.",
    validationError: "Please check your input and try again.",
  },
} as const;

// ============================================
// ANIMATION VARIANTS (Framer Motion)
// ============================================

export const MOTION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;
