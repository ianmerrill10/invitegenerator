// ============================================
// COMPETITIVE PRICING CONFIGURATION
// ============================================
// Strategy: Undercut competitors by 30-50% while maintaining healthy margins
//
// Competitor Analysis (Dec 2024):
// - Paperless Post: ~$0.18/guest for digital delivery
// - Greenvelope: $0.95/invite, $225/yr unlimited
// - Evite Premium: $12.99/event
// - Minted: $7-8/set for stationery bundles
// - Zola/The Knot: $15-20/yr for custom domains

// ============================================
// DIGITAL DELIVERY PRICING
// ============================================
// Competitor: Paperless Post $0.18/guest, Greenvelope $0.95/invite
// Our pricing: $0.08/guest (55% cheaper than Paperless Post)

export const DIGITAL_DELIVERY_PRICING = {
  // Email delivery (included in all plans)
  email: {
    costPerRecipient: 0, // Free with plan
    description: "Standard email delivery",
  },

  // Premium digital delivery (animated, tracked)
  premiumEmail: {
    costPerRecipient: 0.05, // vs Paperless Post $0.18
    description: "Animated invitation with read tracking",
    features: ["Animated envelope opening", "Read receipts", "Reminder scheduling"],
  },

  // SMS delivery
  sms: {
    costPerRecipient: 0.05, // vs industry $0.08-0.15
    description: "Text message delivery with link",
    features: ["Direct to phone", "Link preview", "Delivery confirmation"],
  },

  // WhatsApp delivery
  whatsapp: {
    costPerRecipient: 0.06, // Slightly higher due to API costs
    description: "WhatsApp message with rich preview",
    features: ["Rich media preview", "Read receipts", "Two-way messaging"],
  },

  // Credit packs for digital delivery (bulk discounts)
  creditPacks: [
    { credits: 50, price: 3.99, perCredit: 0.08, savings: "0%" },
    { credits: 100, price: 6.99, perCredit: 0.07, savings: "13%" },
    { credits: 250, price: 14.99, perCredit: 0.06, savings: "25%" },
    { credits: 500, price: 24.99, perCredit: 0.05, savings: "38%" },
    { credits: 1000, price: 39.99, perCredit: 0.04, savings: "50%" },
  ],
} as const;

// ============================================
// STATIONERY BUNDLE PRICING
// ============================================
// Competitor: Minted $7-8/set, Zola similar
// Our pricing: $4.99-5.99/set (30-40% cheaper)

export const STATIONERY_BUNDLE_PRICING = {
  // Essential Bundle: Save the Date + Invitation + Thank You
  essential: {
    id: "essential",
    name: "Essential Bundle",
    description: "Save the Date + Invitation + Thank You Cards",
    products: ["saveTheDate", "invitation", "thankYouCard"],
    pricePerSet: 4.99, // vs Minted ~$7
    savings: "30%",
    popular: false,
  },

  // Complete Bundle: Full wedding/event suite
  complete: {
    id: "complete",
    name: "Complete Suite",
    description: "Full stationery suite with all essentials",
    products: ["saveTheDate", "invitation", "rsvpCard", "thankYouCard"],
    pricePerSet: 5.99, // vs Minted ~$8
    savings: "35%",
    popular: true,
  },

  // Premium Bundle: Everything including day-of items
  premium: {
    id: "premium",
    name: "Premium Collection",
    description: "Complete suite + event day stationery",
    products: ["saveTheDate", "invitation", "rsvpCard", "program", "menuCard", "placeCard", "tableNumber", "thankYouCard"],
    pricePerSet: 8.99, // vs custom quotes $12-15
    savings: "40%",
    popular: false,
  },

  // Quantity discounts on bundles
  quantityDiscounts: [
    { minQty: 50, discount: 0.05, label: "5% off 50+" },
    { minQty: 100, discount: 0.10, label: "10% off 100+" },
    { minQty: 150, discount: 0.15, label: "15% off 150+" },
    { minQty: 200, discount: 0.20, label: "20% off 200+" },
  ],
} as const;

// ============================================
// RUSH PROCESSING FEES
// ============================================
// Competitor: Industry standard $15-25 rush fee
// Our pricing: $7.99-14.99 (40-50% cheaper)

export const RUSH_PROCESSING = {
  standard: {
    id: "standard",
    name: "Standard Processing",
    description: "Ships in 3-5 business days",
    fee: 0,
    processingDays: 5,
  },
  rush: {
    id: "rush",
    name: "Rush Processing",
    description: "Ships in 1-2 business days",
    fee: 7.99, // vs industry $15-20
    processingDays: 2,
  },
  priority: {
    id: "priority",
    name: "Priority Rush",
    description: "Ships next business day",
    fee: 14.99, // vs industry $25-35
    processingDays: 1,
  },
  sameDay: {
    id: "sameDay",
    name: "Same Day Rush",
    description: "Ships same day (order by 12pm EST)",
    fee: 24.99, // Premium but still competitive
    processingDays: 0,
    cutoffTime: "12:00",
    timezone: "America/New_York",
  },
} as const;

// ============================================
// EVENT WEBSITE PRICING
// ============================================
// Competitor: Zola $14.95/yr, Joy $20/yr, The Knot $19.99/yr
// Our pricing: Free basic, $9.99/yr premium (35-50% cheaper)

export const EVENT_WEBSITE_PRICING = {
  // Free tier - included with any plan
  free: {
    id: "free",
    name: "Basic Website",
    price: 0,
    priceYearly: 0,
    features: [
      "Custom subdomain (yourname.invitegenerator.com)",
      "Event details & RSVP",
      "Photo gallery (up to 20 photos)",
      "Mobile responsive",
      "Basic templates",
    ],
    limitations: [
      "InviteGenerator branding",
      "Limited customization",
      "No custom domain",
    ],
  },

  // Premium tier
  premium: {
    id: "premium",
    name: "Premium Website",
    price: 0.99, // Monthly
    priceYearly: 9.99, // vs Zola $14.95, Joy $20
    savings: "33% vs competitors",
    features: [
      "Custom domain included",
      "Remove branding",
      "Unlimited photos",
      "Premium templates",
      "Password protection",
      "Guest messaging",
      "Gift registry integration",
      "Accommodation info section",
      "Travel details & maps",
      "Countdown timer",
      "Background music",
      "Custom colors & fonts",
    ],
  },

  // Pro tier for planners/venues
  pro: {
    id: "pro",
    name: "Pro Website",
    price: 2.99, // Monthly
    priceYearly: 29.99,
    features: [
      "Everything in Premium",
      "Multiple events per site",
      "Embedded video",
      "Custom CSS",
      "Analytics dashboard",
      "Form builder",
      "Seating chart embed",
      "Live updates/announcements",
      "Guest list management",
      "Export guest data",
    ],
  },

  // Custom domain pricing (one-time or with premium)
  customDomain: {
    // If purchasing standalone
    standalone: {
      price: 14.99, // One-time setup
      renewalPerYear: 9.99, // Annual renewal
    },
    // Included with premium/pro plans
    includedWith: ["premium", "pro"],
  },
} as const;

// ============================================
// A LA CARTE ADD-ONS
// ============================================

export const ADDONS_PRICING = {
  // Extra AI credits (beyond plan limits)
  aiCredits: {
    packs: [
      { credits: 10, price: 2.99, perCredit: 0.30 },
      { credits: 25, price: 5.99, perCredit: 0.24 },
      { credits: 50, price: 9.99, perCredit: 0.20 },
      { credits: 100, price: 14.99, perCredit: 0.15 },
    ],
  },

  // Design services
  designServices: {
    customDesign: {
      name: "Custom Design",
      description: "Work with our designers to create a unique invitation",
      price: 49.99, // vs Minted $300+
      turnaround: "3-5 business days",
    },
    designReview: {
      name: "Design Review",
      description: "Professional review and suggestions for your design",
      price: 9.99,
      turnaround: "24 hours",
    },
    rushDesign: {
      name: "Rush Custom Design",
      description: "Custom design with 24-hour turnaround",
      price: 99.99,
      turnaround: "24 hours",
    },
  },

  // Guest address collection
  addressCollection: {
    name: "Address Collection",
    description: "Collect guest addresses via digital form",
    price: 4.99, // One-time per event
    features: [
      "Custom collection form",
      "Automatic validation",
      "Export to CSV/Excel",
      "Mail merge ready",
    ],
  },

  // Envelope addressing
  envelopeAddressing: {
    name: "Printed Envelope Addressing",
    description: "Professional printed addresses on envelopes",
    pricePerEnvelope: 0.25, // vs $0.50-1.00 industry
    minimumOrder: 25,
  },

  // Wax seals
  waxSeals: {
    name: "Custom Wax Seals",
    description: "Elegant wax seals for your invitations",
    pricePerSeal: 0.75,
    setupFee: 9.99, // For custom design
    minimumOrder: 25,
  },

  // Ribbon/Belly bands
  ribbons: {
    name: "Ribbon Belly Bands",
    description: "Decorative ribbon wraps",
    pricePerBand: 0.35,
    minimumOrder: 25,
    colors: ["Gold", "Silver", "Rose Gold", "Black", "Navy", "Blush", "Custom"],
  },

  // Photo enhancement
  photoEnhancement: {
    name: "Photo Enhancement",
    description: "AI-powered photo enhancement for your invitation",
    pricePerPhoto: 0.99,
    features: [
      "Background removal",
      "Color correction",
      "Cropping & resizing",
      "Filter application",
    ],
  },
} as const;

// ============================================
// SUBSCRIPTION TIER ENHANCEMENTS
// ============================================
// What's included at each tier

export const TIER_INCLUSIONS = {
  free: {
    digitalDeliveryCredits: 0,
    smsCredits: 0,
    eventWebsite: "free",
    bundleDiscount: 0,
    rushProcessingDiscount: 0,
    freeEnvelopeAddressing: false,
  },
  starter: {
    digitalDeliveryCredits: 50, // Per month
    smsCredits: 0,
    eventWebsite: "free",
    bundleDiscount: 0.05, // 5% off bundles
    rushProcessingDiscount: 0,
    freeEnvelopeAddressing: false,
  },
  pro: {
    digitalDeliveryCredits: 150, // Per month
    smsCredits: 25,
    eventWebsite: "premium", // Included
    bundleDiscount: 0.10, // 10% off bundles
    rushProcessingDiscount: 0.10, // 10% off rush
    freeEnvelopeAddressing: false,
  },
  business: {
    digitalDeliveryCredits: -1, // Unlimited
    smsCredits: 100,
    eventWebsite: "pro", // Included
    bundleDiscount: 0.15, // 15% off bundles
    rushProcessingDiscount: 0.25, // 25% off rush
    freeEnvelopeAddressing: true, // First 100 free
    freeEnvelopeAddressingLimit: 100,
  },
} as const;

// ============================================
// COMPETITOR COMPARISON (for marketing)
// ============================================

export const COMPETITOR_COMPARISON = {
  digitalDelivery: {
    feature: "Digital Delivery",
    us: "$0.05-0.08/guest",
    paperlessPost: "$0.18/guest",
    greenvelope: "$0.95/invite",
    evite: "$12.99/event",
    savings: "Up to 75%",
  },
  stationeryBundles: {
    feature: "Print Bundle (100 sets)",
    us: "$499",
    minted: "$700-800",
    zola: "$650-750",
    savings: "Up to 40%",
  },
  eventWebsite: {
    feature: "Event Website + Domain",
    us: "$9.99/year",
    zola: "$14.95/year",
    joy: "$20/year",
    theKnot: "$19.99/year",
    savings: "Up to 50%",
  },
  rushProcessing: {
    feature: "Rush Processing",
    us: "$7.99",
    industry: "$15-25",
    savings: "Up to 60%",
  },
  customDomain: {
    feature: "Custom Domain",
    us: "$9.99/year",
    zola: "$14.95/year",
    minted: "$20/year",
    savings: "Up to 50%",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function calculateBundlePrice(
  bundleId: keyof typeof STATIONERY_BUNDLE_PRICING,
  quantity: number
): { subtotal: number; discount: number; total: number; perSet: number } {
  const bundle = STATIONERY_BUNDLE_PRICING[bundleId];
  if (!bundle || !("pricePerSet" in bundle)) {
    throw new Error("Invalid bundle ID");
  }

  const basePrice = bundle.pricePerSet * quantity;

  // Find applicable quantity discount
  let discountRate = 0;
  const discounts = STATIONERY_BUNDLE_PRICING.quantityDiscounts;
  for (const tier of discounts) {
    if (quantity >= tier.minQty) {
      discountRate = tier.discount;
    }
  }

  const discount = basePrice * discountRate;
  const total = basePrice - discount;
  const perSet = total / quantity;

  return { subtotal: basePrice, discount, total, perSet };
}

export function calculateDeliveryCreditsNeeded(
  guestCount: number,
  deliveryMethods: Array<"email" | "premiumEmail" | "sms" | "whatsapp">
): { totalCredits: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let totalCredits = 0;

  for (const method of deliveryMethods) {
    if (method === "email") {
      breakdown[method] = 0; // Free
    } else {
      breakdown[method] = guestCount;
      totalCredits += guestCount;
    }
  }

  return { totalCredits, breakdown };
}

export function getRushProcessingFee(
  rushType: keyof typeof RUSH_PROCESSING,
  userPlan: "free" | "starter" | "pro" | "business"
): number {
  const baseFee = RUSH_PROCESSING[rushType].fee;
  const discount = TIER_INCLUSIONS[userPlan].rushProcessingDiscount;
  return baseFee * (1 - discount);
}

export function getEventWebsiteTier(
  userPlan: "free" | "starter" | "pro" | "business"
): "free" | "premium" | "pro" {
  return TIER_INCLUSIONS[userPlan].eventWebsite as "free" | "premium" | "pro";
}

// Type exports
export type BundleId = keyof typeof STATIONERY_BUNDLE_PRICING;
export type RushType = keyof typeof RUSH_PROCESSING;
export type WebsiteTier = keyof typeof EVENT_WEBSITE_PRICING;
export type DeliveryMethod = keyof typeof DIGITAL_DELIVERY_PRICING;
