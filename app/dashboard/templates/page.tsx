"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  Lock,
  Heart,
  Gift,
  Briefcase,
  PartyPopper,
  Church,
  Baby,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types";

// Template categories
const categories: { id: EventType | "all"; name: string; icon: React.ReactNode }[] = [
  { id: "all", name: "All Templates", icon: <Sparkles className="h-4 w-4" /> },
  { id: "wedding", name: "Wedding", icon: <Heart className="h-4 w-4" /> },
  { id: "birthday", name: "Birthday", icon: <PartyPopper className="h-4 w-4" /> },
  { id: "baby_shower", name: "Baby Shower", icon: <Baby className="h-4 w-4" /> },
  { id: "corporate", name: "Corporate", icon: <Briefcase className="h-4 w-4" /> },
  { id: "holiday", name: "Holiday", icon: <Gift className="h-4 w-4" /> },
  { id: "graduation", name: "Graduation", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "religious", name: "Religious", icon: <Church className="h-4 w-4" /> },
];

// Mock templates data
// Template data - ratings/uses removed as we don't have real data yet
const mockTemplates = [
  {
    id: "1",
    name: "Elegant Floral",
    category: "wedding",
    isPremium: false,
    thumbnail: "#FF6B47",
  },
  {
    id: "2",
    name: "Modern Minimalist",
    category: "wedding",
    isPremium: true,
    thumbnail: "#14B8A6",
  },
  {
    id: "3",
    name: "Fun Confetti",
    category: "birthday",
    isPremium: false,
    thumbnail: "#FCD34D",
  },
  {
    id: "4",
    name: "Golden Celebration",
    category: "birthday",
    isPremium: true,
    thumbnail: "#F59E0B",
  },
  {
    id: "5",
    name: "Sweet Arrival",
    category: "baby_shower",
    isPremium: false,
    thumbnail: "#EC4899",
  },
  {
    id: "6",
    name: "Professional Blue",
    category: "corporate",
    isPremium: true,
    thumbnail: "#3B82F6",
  },
  {
    id: "7",
    name: "Festive Joy",
    category: "holiday",
    isPremium: false,
    thumbnail: "#EF4444",
  },
  {
    id: "8",
    name: "Cap & Gown",
    category: "graduation",
    isPremium: false,
    thumbnail: "#8B5CF6",
  },
  {
    id: "9",
    name: "Rustic Romance",
    category: "wedding",
    isPremium: true,
    thumbnail: "#78716C",
  },
  {
    id: "10",
    name: "Neon Party",
    category: "birthday",
    isPremium: false,
    thumbnail: "#6366F1",
  },
  {
    id: "11",
    name: "Woodland Baby",
    category: "baby_shower",
    isPremium: true,
    thumbnail: "#10B981",
  },
  {
    id: "12",
    name: "Executive Summit",
    category: "corporate",
    isPremium: true,
    thumbnail: "#1C1917",
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<EventType | "all">("all");
  const [showPremiumOnly, setShowPremiumOnly] = React.useState(false);

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    return mockTemplates.filter((template) => {
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== "all" && template.category !== selectedCategory) {
        return false;
      }
      if (showPremiumOnly && !template.isPremium) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, showPremiumOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-900">Templates</h1>
        <p className="text-surface-600 mt-1">
          Choose from our professionally designed templates
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showPremiumOnly ? "primary" : "outline"}
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Premium Only
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            leftIcon={category.icon}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-surface-500">
        Showing {filteredTemplates.length} templates
      </p>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Sparkles className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-surface-900 mb-2">
            No templates found
          </h3>
          <p className="text-surface-500">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card padding="none" variant="hover" className="overflow-hidden group">
                {/* Preview */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: template.thumbnail }}
                >
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/dashboard/create?template=${template.id}`}>
                      <Button variant="primary">Use Template</Button>
                    </Link>
                  </div>

                  {/* Preview Content */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center text-white/80">
                      <p className="text-lg font-display">{template.name}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-surface-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-surface-500 capitalize">
                    {template.category.replace("_", " ")}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-brand-500 to-accent-500 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              Unlock All Premium Templates
            </h3>
            <p className="text-white/80">
              Get access to 100+ premium templates with a Pro subscription
            </p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="secondary" className="bg-white text-brand-600 hover:bg-white/90">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
