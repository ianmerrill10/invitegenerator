/**
 * Template Seed Script
 *
 * Seeds the database with sample templates for development/testing
 *
 * Run: npx tsx scripts/seed-templates.ts
 */

import { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TEMPLATES_TABLE = process.env.DYNAMODB_TEMPLATES_TABLE || "InviteGenerator-Templates-production";

interface TemplateData {
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  tags: string[];
  tier: "free" | "pro" | "premium";
  thumbnail: string;
  previewImages: string[];
  colors: string[];
  fonts: string[];
}

const sampleTemplates: TemplateData[] = [
  // Wedding Templates
  {
    name: "Elegant Garden Wedding",
    category: "wedding",
    subcategory: "garden",
    description: "A beautiful floral design perfect for outdoor garden weddings",
    tags: ["floral", "elegant", "garden", "spring", "romantic"],
    tier: "free",
    thumbnail: "/templates/wedding/garden-thumb.jpg",
    previewImages: ["/templates/wedding/garden-1.jpg", "/templates/wedding/garden-2.jpg"],
    colors: ["#2D5016", "#F5E6D3", "#8B4513", "#FFFFFF"],
    fonts: ["Playfair Display", "Lora"],
  },
  {
    name: "Modern Minimalist Wedding",
    category: "wedding",
    subcategory: "modern",
    description: "Clean, sophisticated design for modern couples",
    tags: ["minimalist", "modern", "clean", "sophisticated"],
    tier: "free",
    thumbnail: "/templates/wedding/modern-thumb.jpg",
    previewImages: ["/templates/wedding/modern-1.jpg"],
    colors: ["#000000", "#FFFFFF", "#D4AF37"],
    fonts: ["Montserrat", "Cormorant Garamond"],
  },
  {
    name: "Rustic Barn Wedding",
    category: "wedding",
    subcategory: "rustic",
    description: "Charming rustic design with wooden textures",
    tags: ["rustic", "barn", "country", "vintage"],
    tier: "pro",
    thumbnail: "/templates/wedding/rustic-thumb.jpg",
    previewImages: ["/templates/wedding/rustic-1.jpg", "/templates/wedding/rustic-2.jpg"],
    colors: ["#8B4513", "#DEB887", "#228B22", "#FFFFFF"],
    fonts: ["Amatic SC", "Josefin Sans"],
  },
  {
    name: "Luxury Gold Wedding",
    category: "wedding",
    subcategory: "luxury",
    description: "Opulent gold and marble design for luxury weddings",
    tags: ["luxury", "gold", "marble", "elegant", "premium"],
    tier: "premium",
    thumbnail: "/templates/wedding/luxury-thumb.jpg",
    previewImages: ["/templates/wedding/luxury-1.jpg", "/templates/wedding/luxury-2.jpg"],
    colors: ["#D4AF37", "#000000", "#FFFFFF", "#C0C0C0"],
    fonts: ["Cinzel", "Raleway"],
  },

  // Birthday Templates
  {
    name: "Fun Kids Birthday",
    category: "birthday",
    subcategory: "kids",
    description: "Colorful and playful design for children's parties",
    tags: ["kids", "colorful", "fun", "balloons", "party"],
    tier: "free",
    thumbnail: "/templates/birthday/kids-thumb.jpg",
    previewImages: ["/templates/birthday/kids-1.jpg"],
    colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3"],
    fonts: ["Fredoka One", "Nunito"],
  },
  {
    name: "Elegant 50th Birthday",
    category: "birthday",
    subcategory: "milestone",
    description: "Sophisticated design for milestone birthday celebrations",
    tags: ["milestone", "elegant", "50th", "gold", "celebration"],
    tier: "pro",
    thumbnail: "/templates/birthday/50th-thumb.jpg",
    previewImages: ["/templates/birthday/50th-1.jpg"],
    colors: ["#D4AF37", "#1A1A1A", "#FFFFFF"],
    fonts: ["Great Vibes", "Lato"],
  },
  {
    name: "Neon Party",
    category: "birthday",
    subcategory: "party",
    description: "Vibrant neon design for exciting party invitations",
    tags: ["neon", "party", "vibrant", "disco", "fun"],
    tier: "free",
    thumbnail: "/templates/birthday/neon-thumb.jpg",
    previewImages: ["/templates/birthday/neon-1.jpg"],
    colors: ["#FF00FF", "#00FFFF", "#FFFF00", "#000000"],
    fonts: ["Orbitron", "Exo 2"],
  },

  // Corporate Templates
  {
    name: "Professional Conference",
    category: "corporate",
    subcategory: "conference",
    description: "Clean professional design for business events",
    tags: ["professional", "conference", "business", "corporate"],
    tier: "pro",
    thumbnail: "/templates/corporate/conference-thumb.jpg",
    previewImages: ["/templates/corporate/conference-1.jpg"],
    colors: ["#2C3E50", "#3498DB", "#FFFFFF", "#ECF0F1"],
    fonts: ["Roboto", "Open Sans"],
  },
  {
    name: "Gala Dinner",
    category: "corporate",
    subcategory: "gala",
    description: "Elegant design for corporate galas and formal dinners",
    tags: ["gala", "dinner", "formal", "elegant", "corporate"],
    tier: "premium",
    thumbnail: "/templates/corporate/gala-thumb.jpg",
    previewImages: ["/templates/corporate/gala-1.jpg"],
    colors: ["#1A1A1A", "#D4AF37", "#FFFFFF"],
    fonts: ["Playfair Display", "Source Sans Pro"],
  },

  // Baby Shower Templates
  {
    name: "Sweet Baby Boy",
    category: "baby-shower",
    subcategory: "boy",
    description: "Adorable blue theme for baby boy showers",
    tags: ["baby", "boy", "blue", "cute", "shower"],
    tier: "free",
    thumbnail: "/templates/baby/boy-thumb.jpg",
    previewImages: ["/templates/baby/boy-1.jpg"],
    colors: ["#87CEEB", "#FFFFFF", "#4169E1", "#F0F8FF"],
    fonts: ["Quicksand", "Poppins"],
  },
  {
    name: "Sweet Baby Girl",
    category: "baby-shower",
    subcategory: "girl",
    description: "Lovely pink theme for baby girl showers",
    tags: ["baby", "girl", "pink", "cute", "shower"],
    tier: "free",
    thumbnail: "/templates/baby/girl-thumb.jpg",
    previewImages: ["/templates/baby/girl-1.jpg"],
    colors: ["#FFB6C1", "#FFFFFF", "#FF69B4", "#FFF0F5"],
    fonts: ["Quicksand", "Poppins"],
  },
  {
    name: "Gender Neutral Woodland",
    category: "baby-shower",
    subcategory: "neutral",
    description: "Charming woodland theme suitable for any gender",
    tags: ["baby", "neutral", "woodland", "animals", "nature"],
    tier: "pro",
    thumbnail: "/templates/baby/woodland-thumb.jpg",
    previewImages: ["/templates/baby/woodland-1.jpg"],
    colors: ["#8FBC8F", "#DEB887", "#FFFFFF", "#F5DEB3"],
    fonts: ["Caveat", "Nunito"],
  },

  // Holiday Templates
  {
    name: "Christmas Celebration",
    category: "holiday",
    subcategory: "christmas",
    description: "Festive Christmas party invitation",
    tags: ["christmas", "holiday", "festive", "winter", "party"],
    tier: "free",
    thumbnail: "/templates/holiday/christmas-thumb.jpg",
    previewImages: ["/templates/holiday/christmas-1.jpg"],
    colors: ["#C41E3A", "#228B22", "#FFD700", "#FFFFFF"],
    fonts: ["Mountains of Christmas", "Nunito"],
  },
  {
    name: "New Year's Eve",
    category: "holiday",
    subcategory: "new-year",
    description: "Glamorous New Year's Eve party invitation",
    tags: ["new-year", "party", "celebration", "glamorous", "midnight"],
    tier: "pro",
    thumbnail: "/templates/holiday/newyear-thumb.jpg",
    previewImages: ["/templates/holiday/newyear-1.jpg"],
    colors: ["#000000", "#FFD700", "#C0C0C0", "#FFFFFF"],
    fonts: ["Cinzel", "Raleway"],
  },
];

async function seedTemplates() {
  console.log("Template Seed Script");
  console.log("====================\n");

  const templates = sampleTemplates.map((template) => ({
    id: uuidv4(),
    ...template,
    status: "active",
    featured: Math.random() > 0.7, // 30% chance of being featured
    popularity: Math.floor(Math.random() * 1000),
    usageCount: Math.floor(Math.random() * 500),
    rating: (3.5 + Math.random() * 1.5).toFixed(1), // 3.5 to 5.0
    ratingCount: Math.floor(Math.random() * 100),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  console.log(`Seeding ${templates.length} templates...\n`);

  // Batch write (DynamoDB supports max 25 items per batch)
  const batches: (typeof templates)[] = [];
  for (let i = 0; i < templates.length; i += 25) {
    batches.push(templates.slice(i, i + 25));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const writeRequests = batch.map((template) => ({
      PutRequest: {
        Item: marshall(template, { removeUndefinedValues: true }),
      },
    }));

    try {
      await dynamodb.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [TEMPLATES_TABLE]: writeRequests,
          },
        })
      );
      console.log(`Batch ${batchIndex + 1}/${batches.length} completed`);
    } catch (error) {
      console.error(`Batch ${batchIndex + 1} failed:`, error);

      // Fall back to individual puts
      console.log("Falling back to individual writes...");
      for (const template of batch) {
        try {
          await dynamodb.send(
            new PutItemCommand({
              TableName: TEMPLATES_TABLE,
              Item: marshall(template, { removeUndefinedValues: true }),
            })
          );
          console.log(`  Added: ${template.name}`);
        } catch (putError) {
          console.error(`  Failed: ${template.name}`, putError);
        }
      }
    }
  }

  console.log("\n====================");
  console.log("Seeding Complete!");
  console.log(`\nTemplates by category:`);

  const categories = [...new Set(templates.map((t) => t.category))];
  categories.forEach((cat) => {
    const count = templates.filter((t) => t.category === cat).length;
    console.log(`  ${cat}: ${count}`);
  });

  console.log(`\nTemplates by tier:`);
  const tiers = ["free", "pro", "premium"];
  tiers.forEach((tier) => {
    const count = templates.filter((t) => t.tier === tier).length;
    console.log(`  ${tier}: ${count}`);
  });
}

seedTemplates().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
