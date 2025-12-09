"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  Heart,
  Cake,
  Baby,
  GraduationCap,
  Building,
  PartyPopper,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Template categories with icons
const categoryIcons: Record<string, React.ElementType> = {
  wedding: Heart,
  birthday: Cake,
  baby_shower: Baby,
  graduation: GraduationCap,
  corporate: Building,
  party: PartyPopper,
  holiday: Calendar,
  bridal_shower: Heart,
  dinner_party: PartyPopper,
  anniversary: Heart,
  engagement: Heart,
  housewarming: Building,
  retirement: PartyPopper,
  reunion: PartyPopper,
  religious: Sparkles,
  kids_party: Cake,
  sports: PartyPopper,
  seasonal: Calendar,
};

interface S3Template {
  id: string;
  category: string;
  subcategory: string;
  style: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
  createdAt: string;
}

interface TemplatesResponse {
  templates: S3Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    totalTemplates: number;
    categories: Record<string, number>;
  };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<S3Template[]>([]);
  const [categories, setCategories] = React.useState<{ id: string; name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);

  // Fetch templates from S3 API
  React.useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        params.set("limit", "100");

        const response = await fetch(`/api/templates/s3?${params}`);
        if (!response.ok) throw new Error("Failed to fetch templates");

        const data: TemplatesResponse = await response.json();
        setTemplates(data.templates);
        setTotalCount(data.meta.totalTemplates);

        // Build categories from response
        const cats = [
          { id: "all", name: "All Templates", count: data.meta.totalTemplates },
          ...Object.entries(data.meta.categories).map(([id, count]) => ({
            id,
            name: formatCategoryName(id),
            count,
          })),
        ];
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [selectedCategory]);

  // Format category name for display
  function formatCategoryName(id: string): string {
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Filter templates by search
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.category.toLowerCase().includes(query) ||
      template.subcategory.toLowerCase().includes(query) ||
      template.style.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-brand-50 to-surface-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="secondary" className="mb-4">
                AI-Generated Templates
              </Badge>
              <h1 className="text-display-lg font-display font-bold text-surface-900 mb-6">
                Beautiful Templates for Every Occasion
              </h1>
              <p className="text-xl text-surface-600 mb-8">
                Browse our collection of {totalCount > 0 ? totalCount : "100+"} AI-generated invitation templates.
                Each design is unique and ready to customize for your event.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b border-surface-200 bg-white sticky top-20 z-30">
          <div className="container-custom">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => {
                const Icon = categoryIcons[category.id] || Sparkles;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all",
                      isActive
                        ? "bg-brand-500 text-white shadow-md"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-surface-200 text-surface-500"
                      )}
                    >
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 md:py-16">
          <div className="container-custom">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="ml-3 text-surface-600">Loading templates...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-surface-600">No templates found. Try a different search or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Template Preview */}
                      <div className="relative aspect-square bg-surface-100">
                        <Image
                          src={template.thumbnailUrl}
                          alt={`${template.subcategory} ${template.category} template`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />

                        {/* Style Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90 text-surface-700 capitalize">
                            {template.style}
                          </Badge>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-surface-900/0 group-hover:bg-surface-900/60 transition-colors duration-300 flex items-center justify-center">
                          <Link href="/auth/signup">
                            <Button
                              variant="primary"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              Use Template
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-heading font-semibold text-surface-900 group-hover:text-brand-600 transition-colors capitalize">
                          {template.subcategory.replace(/-/g, " ")}
                        </h3>
                        <p className="text-sm text-surface-500 capitalize">
                          {template.style} • {template.category.replace(/_/g, " ")}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-surface-600 mb-4">
                Sign up to access all templates and create invitations
              </p>
              <Link href="/auth/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
