"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  Cake,
  Baby,
  GraduationCap,
  Building,
  PartyPopper,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Template categories
const categories = [
  { id: "all", name: "All Templates", icon: Sparkles, count: 1050 },
  { id: "wedding", name: "Wedding", icon: Heart, count: 180 },
  { id: "birthday", name: "Birthday", icon: Cake, count: 160 },
  { id: "baby_shower", name: "Baby Shower", icon: Baby, count: 80 },
  { id: "graduation", name: "Graduation", icon: GraduationCap, count: 60 },
  { id: "corporate", name: "Corporate", icon: Building, count: 100 },
  { id: "party", name: "Party", icon: PartyPopper, count: 120 },
  { id: "holiday", name: "Holiday", icon: Calendar, count: 140 },
];

// Sample templates for display
const sampleTemplates = [
  {
    id: 1,
    name: "Elegant Garden Wedding",
    category: "wedding",
    style: "elegant",
    colors: ["#D4919F", "#F5E1E5", "#FFFFFF"],
    popular: true,
  },
  {
    id: 2,
    name: "Modern Minimalist Birthday",
    category: "birthday",
    style: "minimalist",
    colors: ["#64748B", "#F8FAFC", "#FFFFFF"],
    popular: true,
  },
  {
    id: 3,
    name: "Soft Pink Baby Shower",
    category: "baby_shower",
    style: "playful",
    colors: ["#FAF0F2", "#D4919F", "#FFFFFF"],
    popular: false,
  },
  {
    id: 4,
    name: "Classic Graduation",
    category: "graduation",
    style: "classic",
    colors: ["#1E293B", "#64748B", "#F8FAFC"],
    popular: true,
  },
  {
    id: 5,
    name: "Corporate Conference",
    category: "corporate",
    style: "professional",
    colors: ["#64748B", "#E2E8F0", "#FFFFFF"],
    popular: false,
  },
  {
    id: 6,
    name: "Rustic Barn Wedding",
    category: "wedding",
    style: "rustic",
    colors: ["#A35568", "#EECCD3", "#FAF0F2"],
    popular: true,
  },
  {
    id: 7,
    name: "Tropical Birthday Bash",
    category: "birthday",
    style: "tropical",
    colors: ["#D4919F", "#64748B", "#FFFFFF"],
    popular: false,
  },
  {
    id: 8,
    name: "Winter Holiday Party",
    category: "holiday",
    style: "festive",
    colors: ["#64748B", "#CBD5E1", "#F8FAFC"],
    popular: true,
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredTemplates = sampleTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.style.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
                1,050+ Templates
              </Badge>
              <h1 className="text-display-lg font-display font-bold text-surface-900 mb-6">
                Beautiful Templates for Every Occasion
              </h1>
              <p className="text-xl text-surface-600 mb-8">
                Browse our collection of professionally designed invitation templates.
                Find the perfect design and customize it to match your event.
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
                const Icon = category.icon;
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
                    <div className="relative aspect-[4/5] bg-gradient-to-br from-surface-100 to-surface-50">
                      {/* Color Preview */}
                      <div className="absolute inset-4 rounded-xl border border-surface-200 bg-white shadow-sm overflow-hidden">
                        <div
                          className="h-1/3"
                          style={{ backgroundColor: template.colors[0] }}
                        />
                        <div className="p-4 space-y-2">
                          <div
                            className="h-3 w-3/4 rounded"
                            style={{ backgroundColor: template.colors[1] }}
                          />
                          <div
                            className="h-2 w-1/2 rounded"
                            style={{ backgroundColor: template.colors[1] }}
                          />
                          <div
                            className="h-2 w-2/3 rounded"
                            style={{ backgroundColor: template.colors[1] }}
                          />
                        </div>
                      </div>

                      {/* Popular Badge */}
                      {template.popular && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="bg-brand-500">
                            Popular
                          </Badge>
                        </div>
                      )}

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
                      <h3 className="font-heading font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-surface-500 capitalize">
                        {template.style} • {template.category.replace("_", " ")}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-surface-600 mb-4">
                Sign up to access all 1,050+ templates and create unlimited invitations
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
