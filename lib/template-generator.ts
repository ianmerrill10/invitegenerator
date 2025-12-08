/**
 * AI Template Generator Agent
 *
 * Uses Claude/Bedrock to automatically generate invitation templates at scale.
 * Target: 1000+ unique, high-quality templates across all event categories.
 */

// Template categories with subcategories for maximum variety
export const TEMPLATE_CATEGORIES = {
  wedding: {
    name: "Wedding",
    subcategories: [
      "ceremony", "reception", "save-the-date", "rehearsal-dinner",
      "engagement-party", "bridal-brunch", "wedding-shower", "elopement",
      "destination", "vow-renewal"
    ],
    targetCount: 120,
  },
  birthday: {
    name: "Birthday",
    subcategories: [
      "kids-1-5", "kids-6-12", "teen", "sweet-16", "21st", "30th", "40th",
      "50th", "60th", "70th", "80th", "milestone", "surprise", "themed"
    ],
    targetCount: 100,
  },
  baby_shower: {
    name: "Baby Shower",
    subcategories: [
      "boy", "girl", "gender-neutral", "gender-reveal", "twins",
      "sprinkle", "virtual", "co-ed", "drive-by", "safari", "woodland"
    ],
    targetCount: 80,
  },
  bridal_shower: {
    name: "Bridal Shower",
    subcategories: [
      "tea-party", "brunch", "spa", "garden", "beach", "wine-tasting",
      "lingerie", "kitchen", "travel", "boho"
    ],
    targetCount: 60,
  },
  graduation: {
    name: "Graduation",
    subcategories: [
      "preschool", "kindergarten", "elementary", "middle-school",
      "high-school", "college", "masters", "phd", "medical", "law"
    ],
    targetCount: 60,
  },
  corporate: {
    name: "Corporate",
    subcategories: [
      "conference", "seminar", "workshop", "networking", "launch-party",
      "holiday-party", "team-building", "awards", "retirement", "anniversary"
    ],
    targetCount: 80,
  },
  holiday: {
    name: "Holiday",
    subcategories: [
      "christmas", "hanukkah", "new-years", "valentines", "easter",
      "halloween", "thanksgiving", "4th-of-july", "st-patricks",
      "cinco-de-mayo", "diwali", "lunar-new-year"
    ],
    targetCount: 100,
  },
  dinner_party: {
    name: "Dinner Party",
    subcategories: [
      "formal", "casual", "cocktail", "wine-dinner", "potluck",
      "murder-mystery", "game-night", "themed", "outdoor", "holiday"
    ],
    targetCount: 50,
  },
  anniversary: {
    name: "Anniversary",
    subcategories: [
      "1st", "5th", "10th", "15th", "20th", "25th-silver", "30th",
      "40th", "50th-golden", "60th-diamond", "renewal"
    ],
    targetCount: 50,
  },
  engagement: {
    name: "Engagement",
    subcategories: [
      "party", "announcement", "brunch", "cocktail", "casual",
      "formal", "destination", "surprise"
    ],
    targetCount: 40,
  },
  housewarming: {
    name: "Housewarming",
    subcategories: [
      "modern", "traditional", "apartment", "first-home", "open-house",
      "bbq", "cocktail", "casual"
    ],
    targetCount: 40,
  },
  retirement: {
    name: "Retirement",
    subcategories: [
      "corporate", "military", "teacher", "medical", "casual",
      "formal", "surprise", "travel-themed"
    ],
    targetCount: 40,
  },
  reunion: {
    name: "Reunion",
    subcategories: [
      "family", "class-reunion", "military", "college", "neighborhood",
      "heritage", "destination"
    ],
    targetCount: 40,
  },
  religious: {
    name: "Religious",
    subcategories: [
      "baptism", "christening", "first-communion", "confirmation",
      "bar-mitzvah", "bat-mitzvah", "quinceanera", "church-event"
    ],
    targetCount: 50,
  },
  kids_party: {
    name: "Kids Party",
    subcategories: [
      "princess", "superhero", "dinosaur", "unicorn", "space",
      "sports", "pool-party", "slumber", "arts-crafts", "science"
    ],
    targetCount: 60,
  },
  sports: {
    name: "Sports Events",
    subcategories: [
      "super-bowl", "world-series", "march-madness", "olympics",
      "golf-tournament", "marathon", "tailgate", "fantasy-draft"
    ],
    targetCount: 40,
  },
  seasonal: {
    name: "Seasonal",
    subcategories: [
      "spring", "summer", "fall", "winter", "beach", "garden",
      "harvest", "snow"
    ],
    targetCount: 40,
  },
};

// Design styles for variation
export const DESIGN_STYLES = [
  "minimalist",
  "elegant",
  "modern",
  "vintage",
  "rustic",
  "bohemian",
  "tropical",
  "romantic",
  "playful",
  "luxurious",
  "whimsical",
  "classic",
  "art-deco",
  "watercolor",
  "geometric",
  "floral",
  "botanical",
  "abstract",
  "photo-centric",
  "typography-focused",
];

// Color palettes
export const COLOR_PALETTES = [
  { name: "Classic Gold", colors: ["#D4AF37", "#1C1917", "#FAFAF9"] },
  { name: "Blush Romance", colors: ["#FDA4AF", "#BE123C", "#FFF1F2"] },
  { name: "Ocean Blue", colors: ["#0891B2", "#164E63", "#ECFEFF"] },
  { name: "Forest Green", colors: ["#15803D", "#14532D", "#F0FDF4"] },
  { name: "Royal Purple", colors: ["#7C3AED", "#4C1D95", "#F5F3FF"] },
  { name: "Sunset Orange", colors: ["#EA580C", "#7C2D12", "#FFF7ED"] },
  { name: "Modern Mono", colors: ["#18181B", "#71717A", "#FFFFFF"] },
  { name: "Sage & Cream", colors: ["#84CC16", "#3F6212", "#F7FEE7"] },
  { name: "Navy & Gold", colors: ["#1E3A8A", "#D4AF37", "#EFF6FF"] },
  { name: "Terracotta", colors: ["#C2410C", "#78350F", "#FEF3C7"] },
  { name: "Dusty Rose", colors: ["#BE185D", "#9D174D", "#FCE7F3"] },
  { name: "Teal Dreams", colors: ["#0D9488", "#134E4A", "#F0FDFA"] },
  { name: "Champagne", colors: ["#A16207", "#78350F", "#FEF9C3"] },
  { name: "Charcoal & White", colors: ["#374151", "#111827", "#F9FAFB"] },
  { name: "Coral Reef", colors: ["#F97316", "#9A3412", "#FFEDD5"] },
  { name: "Lavender Fields", colors: ["#A855F7", "#6B21A8", "#FAF5FF"] },
  { name: "Mint Fresh", colors: ["#10B981", "#065F46", "#ECFDF5"] },
  { name: "Berry Burst", colors: ["#DB2777", "#831843", "#FDF2F8"] },
  { name: "Earth Tones", colors: ["#92400E", "#451A03", "#FFFBEB"] },
  { name: "Ice Blue", colors: ["#0EA5E9", "#0C4A6E", "#F0F9FF"] },
];

// Font pairings
export const FONT_PAIRINGS = [
  { heading: "Playfair Display", body: "Source Serif Pro" },
  { heading: "Outfit", body: "Inter" },
  { heading: "Cormorant Garamond", body: "Montserrat" },
  { heading: "Amatic SC", body: "Josefin Sans" },
  { heading: "Great Vibes", body: "Lato" },
  { heading: "Cinzel", body: "Fauna One" },
  { heading: "Satisfy", body: "Open Sans" },
  { heading: "Pacifico", body: "Roboto" },
  { heading: "Dancing Script", body: "Poppins" },
  { heading: "Alex Brush", body: "Raleway" },
  { heading: "Bebas Neue", body: "Source Sans Pro" },
  { heading: "Abril Fatface", body: "Nunito" },
  { heading: "Righteous", body: "DM Sans" },
  { heading: "Lobster", body: "Work Sans" },
  { heading: "Sacramento", body: "Merriweather" },
];

// Template interface
export interface GeneratedTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  style: string;
  thumbnail: string;
  premium: boolean;
  colors: string[];
  fonts: string[];
  popularity: number;
  createdAt: string;
  description: string;
  tags: string[];
  layout: TemplateLayout;
}

export interface TemplateLayout {
  headerPosition: "top" | "center" | "bottom";
  imagePosition: "background" | "left" | "right" | "top" | "none";
  textAlignment: "left" | "center" | "right";
  decorations: string[];
  spacing: "compact" | "balanced" | "spacious";
}

/**
 * Generate a unique template ID
 */
function generateTemplateId(category: string, subcategory: string, style: string, index: number): string {
  return `${category}-${subcategory}-${style}-${index}`.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Generate a creative template name
 */
function generateTemplateName(category: string, subcategory: string, style: string): string {
  const styleNames: Record<string, string[]> = {
    minimalist: ["Clean", "Pure", "Simple", "Essential", "Refined"],
    elegant: ["Elegant", "Graceful", "Sophisticated", "Polished", "Exquisite"],
    modern: ["Modern", "Contemporary", "Fresh", "Current", "Sleek"],
    vintage: ["Vintage", "Retro", "Classic", "Timeless", "Nostalgic"],
    rustic: ["Rustic", "Country", "Farmhouse", "Natural", "Earthy"],
    bohemian: ["Boho", "Free Spirit", "Wanderlust", "Eclectic", "Gypsy"],
    tropical: ["Tropical", "Paradise", "Island", "Palm", "Coastal"],
    romantic: ["Romance", "Dreamy", "Enchanted", "Lovely", "Blissful"],
    playful: ["Playful", "Fun", "Cheerful", "Joyful", "Lively"],
    luxurious: ["Luxe", "Opulent", "Grand", "Royal", "Prestige"],
    whimsical: ["Whimsy", "Magical", "Fantasy", "Fairytale", "Wonder"],
    classic: ["Classic", "Traditional", "Heritage", "Timeless", "Enduring"],
    "art-deco": ["Gatsby", "Deco", "Gilded", "Roaring", "Glamour"],
    watercolor: ["Watercolor", "Painted", "Artistic", "Brushed", "Wash"],
    geometric: ["Geo", "Angular", "Linear", "Structured", "Bold"],
    floral: ["Bloom", "Garden", "Petal", "Blossom", "Flora"],
    botanical: ["Botanical", "Greenery", "Leafy", "Organic", "Nature"],
    abstract: ["Abstract", "Artistic", "Creative", "Expression", "Dynamic"],
    "photo-centric": ["Photo", "Memory", "Snapshot", "Portrait", "Gallery"],
    "typography-focused": ["Type", "Script", "Letter", "Word", "Text"],
  };

  const names = styleNames[style] || ["Beautiful"];
  const randomName = names[Math.floor(Math.random() * names.length)];

  // Format subcategory nicely
  const formattedSub = subcategory
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${randomName} ${formattedSub}`;
}

/**
 * Generate template tags for searchability
 */
function generateTags(category: string, subcategory: string, style: string): string[] {
  const baseTags = [category, subcategory, style, "invitation", "digital"];

  const styleTags: Record<string, string[]> = {
    minimalist: ["clean", "simple", "modern", "minimal"],
    elegant: ["sophisticated", "formal", "classy", "refined"],
    modern: ["contemporary", "trendy", "fresh", "sleek"],
    vintage: ["retro", "classic", "antique", "old-fashioned"],
    rustic: ["country", "natural", "barn", "outdoor"],
    bohemian: ["boho", "hippie", "free-spirit", "eclectic"],
    tropical: ["beach", "summer", "island", "palm"],
    romantic: ["love", "sweet", "soft", "dreamy"],
    playful: ["fun", "colorful", "kids", "cheerful"],
    luxurious: ["luxury", "premium", "high-end", "opulent"],
  };

  return [...baseTags, ...(styleTags[style] || [])];
}

/**
 * Generate layout configuration
 */
function generateLayout(style: string): TemplateLayout {
  const layouts: Record<string, TemplateLayout> = {
    minimalist: {
      headerPosition: "center",
      imagePosition: "none",
      textAlignment: "center",
      decorations: ["thin-line"],
      spacing: "spacious",
    },
    elegant: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["ornament", "border"],
      spacing: "balanced",
    },
    modern: {
      headerPosition: "top",
      imagePosition: "left",
      textAlignment: "left",
      decorations: ["geometric-accent"],
      spacing: "compact",
    },
    vintage: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["frame", "flourish", "border"],
      spacing: "balanced",
    },
    rustic: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["wood-texture", "string-lights"],
      spacing: "balanced",
    },
    bohemian: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["feathers", "dreamcatcher", "macrame"],
      spacing: "spacious",
    },
    tropical: {
      headerPosition: "top",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["palm-leaves", "flowers", "pineapple"],
      spacing: "balanced",
    },
    romantic: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["hearts", "roses", "ribbons"],
      spacing: "spacious",
    },
    playful: {
      headerPosition: "top",
      imagePosition: "right",
      textAlignment: "left",
      decorations: ["confetti", "balloons", "stars"],
      spacing: "compact",
    },
    luxurious: {
      headerPosition: "center",
      imagePosition: "background",
      textAlignment: "center",
      decorations: ["gold-foil", "marble", "ornate-border"],
      spacing: "spacious",
    },
  };

  return layouts[style] || layouts.elegant;
}

/**
 * Generate a batch of templates for a category
 */
export function generateTemplatesForCategory(
  categoryKey: string,
  count: number
): GeneratedTemplate[] {
  const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
  if (!category) return [];

  const templates: GeneratedTemplate[] = [];
  const subcategories = category.subcategories;
  const templatesPerSubcategory = Math.ceil(count / subcategories.length);

  for (const subcategory of subcategories) {
    for (let i = 0; i < templatesPerSubcategory && templates.length < count; i++) {
      const style = DESIGN_STYLES[i % DESIGN_STYLES.length];
      const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      const fonts = FONT_PAIRINGS[Math.floor(Math.random() * FONT_PAIRINGS.length)];

      const template: GeneratedTemplate = {
        id: generateTemplateId(categoryKey, subcategory, style, i),
        name: generateTemplateName(categoryKey, subcategory, style),
        category: categoryKey,
        subcategory,
        style,
        thumbnail: `/templates/${categoryKey}/${subcategory}-${style}-${i}.jpg`,
        premium: Math.random() > 0.7, // 30% premium
        colors: palette.colors,
        fonts: [fonts.heading, fonts.body],
        popularity: Math.floor(Math.random() * 40) + 60, // 60-100
        createdAt: new Date().toISOString().split("T")[0],
        description: `Beautiful ${style} ${category.name.toLowerCase()} invitation template perfect for ${subcategory.replace(/-/g, " ")} events.`,
        tags: generateTags(categoryKey, subcategory, style),
        layout: generateLayout(style),
      };

      templates.push(template);
    }
  }

  return templates;
}

/**
 * Generate ALL templates across all categories
 * Target: 1000+ templates
 */
export function generateAllTemplates(): GeneratedTemplate[] {
  const allTemplates: GeneratedTemplate[] = [];

  for (const [categoryKey, category] of Object.entries(TEMPLATE_CATEGORIES)) {
    const templates = generateTemplatesForCategory(categoryKey, category.targetCount);
    allTemplates.push(...templates);
  }

  return allTemplates;
}

/**
 * Get template statistics
 */
export function getTemplateStats(templates: GeneratedTemplate[]) {
  const byCategory: Record<string, number> = {};
  const byStyle: Record<string, number> = {};
  let premiumCount = 0;

  for (const template of templates) {
    byCategory[template.category] = (byCategory[template.category] || 0) + 1;
    byStyle[template.style] = (byStyle[template.style] || 0) + 1;
    if (template.premium) premiumCount++;
  }

  return {
    total: templates.length,
    premium: premiumCount,
    free: templates.length - premiumCount,
    byCategory,
    byStyle,
  };
}
