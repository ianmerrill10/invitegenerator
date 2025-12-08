"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Blog posts data
const blogPosts = [
  {
    id: "1",
    slug: "wedding-invitation-trends-2025",
    title: "Top Wedding Invitation Trends for 2025",
    excerpt: "Discover the latest design trends that are shaping wedding invitations this year, from minimalist elegance to bold typography.",
    category: "Wedding",
    author: "Sarah Mitchell",
    date: "2025-12-05",
    readTime: "5 min read",
    image: "#D4919F",
  },
  {
    id: "2",
    slug: "digital-vs-paper-invitations",
    title: "Digital vs. Paper Invitations: Which Is Right for You?",
    excerpt: "Weighing the pros and cons of digital and traditional paper invitations to help you make the best choice for your event.",
    category: "Tips",
    author: "Michael Chen",
    date: "2025-12-03",
    readTime: "4 min read",
    image: "#64748B",
  },
  {
    id: "3",
    slug: "how-to-write-perfect-rsvp",
    title: "How to Write the Perfect RSVP Request",
    excerpt: "Learn how to craft RSVP requests that get responses. Tips on wording, deadlines, and making it easy for guests.",
    category: "Guide",
    author: "Emily Parker",
    date: "2025-12-01",
    readTime: "6 min read",
    image: "#E4AEBB",
  },
  {
    id: "4",
    slug: "baby-shower-invitation-ideas",
    title: "Creative Baby Shower Invitation Ideas",
    excerpt: "From whimsical themes to modern designs, explore creative ideas to make your baby shower invitations memorable.",
    category: "Baby Shower",
    author: "Jessica Wong",
    date: "2025-11-28",
    readTime: "5 min read",
    image: "#94A3B8",
  },
  {
    id: "5",
    slug: "ai-invitation-design-guide",
    title: "Using AI to Design Your Perfect Invitation",
    excerpt: "A step-by-step guide to leveraging AI tools for creating stunning, personalized invitations in minutes.",
    category: "Tutorial",
    author: "David Kim",
    date: "2025-11-25",
    readTime: "7 min read",
    image: "#C07183",
  },
  {
    id: "6",
    slug: "corporate-event-invitation-etiquette",
    title: "Corporate Event Invitation Etiquette",
    excerpt: "Master the art of professional event invitations with our guide to corporate invitation best practices.",
    category: "Corporate",
    author: "Amanda Foster",
    date: "2025-11-22",
    readTime: "4 min read",
    image: "#475569",
  },
];

const categories = ["All", "Wedding", "Baby Shower", "Corporate", "Tips", "Guide", "Tutorial"];

export default function BlogPage() {
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
                Inspiration & Tips
              </Badge>
              <h1 className="text-display-lg font-display font-bold text-surface-900 mb-6">
                The InviteGenerator Blog
              </h1>
              <p className="text-xl text-surface-600">
                Expert tips, design inspiration, and guides to help you create
                the perfect invitations for any occasion.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 border-b border-surface-200 bg-white sticky top-20 z-30">
          <div className="container-custom">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all bg-surface-100 text-surface-600 hover:bg-surface-200"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 md:py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow">
                    {/* Image placeholder */}
                    <div
                      className="h-48 relative"
                      style={{ backgroundColor: post.image }}
                    >
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90">
                          {post.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-surface-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl font-heading font-semibold text-surface-900 mb-3 group-hover:text-brand-600 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-surface-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-brand-600" />
                          </div>
                          <span className="text-sm text-surface-600">
                            {post.author}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-brand-500">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Get Inspiration in Your Inbox
              </h2>
              <p className="text-white/80 mb-8">
                Subscribe to our newsletter for the latest design tips, trends,
                and exclusive templates delivered weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50"
                />
                <Button
                  variant="secondary"
                  className="bg-white text-brand-600 hover:bg-white/90"
                >
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
