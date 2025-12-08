"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, User, Search, Sparkles } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  image?: string;
}

interface BlogFilters {
  categories: string[];
  tags: string[];
}

const categoryInfo: Record<string, { name: string; color: string }> = {
  wedding: { name: "Wedding", color: "bg-pink-100 text-pink-700" },
  birthday: { name: "Birthday", color: "bg-purple-100 text-purple-700" },
  baby_shower: { name: "Baby Shower", color: "bg-blue-100 text-blue-700" },
  corporate: { name: "Corporate", color: "bg-slate-100 text-slate-700" },
  seasonal: { name: "Seasonal", color: "bg-orange-100 text-orange-700" },
  how_to: { name: "How-To", color: "bg-green-100 text-green-700" },
};

export default function BlogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({ categories: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory) params.set("category", activeCategory);
        if (searchQuery) params.set("search", searchQuery);
        params.set("page", page.toString());
        params.set("pageSize", "9");

        const response = await fetch(`/api/blog?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setPosts(data.data.posts);
          setFilters(data.data.filters);
          setTotalPages(data.meta.totalPages);
          setTotalCount(data.meta.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [activeCategory, searchQuery, page]);

  const handleCategoryClick = (category: string) => {
    const newCategory = category === activeCategory ? "" : category;
    setActiveCategory(newCategory);
    setPage(1);

    const params = new URLSearchParams();
    if (newCategory) params.set("category", newCategory);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured || posts.indexOf(p) > 0);

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
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Insights
              </Badge>
              <h1 className="text-display-lg font-display font-bold text-surface-900 mb-6">
                The InviteGenerator Blog
              </h1>
              <p className="text-xl text-surface-600 mb-8">
                Expert tips, design inspiration, and comprehensive guides to help you create
                the perfect invitations for any occasion.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 h-14 text-lg rounded-xl"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 border-b border-surface-200 bg-white sticky top-20 z-30">
          <div className="container-custom">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => handleCategoryClick("")}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  !activeCategory
                    ? "bg-brand-500 text-white"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                }`}
              >
                All Articles
              </button>
              {Object.entries(categoryInfo).map(([key, { name }]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                    activeCategory === key
                      ? "bg-brand-500 text-white"
                      : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Count */}
        {(activeCategory || searchQuery) && (
          <div className="container-custom py-4">
            <p className="text-surface-600">
              {totalCount} article{totalCount !== 1 ? "s" : ""} found
              {activeCategory && ` in ${categoryInfo[activeCategory]?.name || activeCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="container-custom py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-surface-200 rounded-t-xl" />
                  <div className="p-6 bg-white rounded-b-xl">
                    <div className="h-4 bg-surface-200 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-surface-200 rounded mb-2" />
                    <div className="h-4 bg-surface-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Post */}
        {!loading && featuredPost && !activeCategory && !searchQuery && (
          <section className="py-12 bg-white">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card className="overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div
                        className="h-64 md:h-auto min-h-[300px]"
                        style={{ backgroundColor: featuredPost.image || "#D4919F" }}
                      />
                      <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="primary">Featured</Badge>
                          <Badge className={categoryInfo[featuredPost.category]?.color || "bg-surface-100"}>
                            {categoryInfo[featuredPost.category]?.name || featuredPost.category}
                          </Badge>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 mb-4 group-hover:text-brand-600 transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-surface-600 mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-surface-500">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {featuredPost.author}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {featuredPost.readTime} min read
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        {!loading && (
          <section className="py-12 md:py-16">
            <div className="container-custom">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-surface-600 mb-6">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button onClick={() => { setActiveCategory(""); setSearchQuery(""); }}>
                    View All Articles
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(activeCategory || searchQuery ? posts : regularPosts).map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Link href={`/blog/${post.slug}`}>
                          <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow">
                            {/* Image */}
                            <div
                              className="h-48 relative"
                              style={{ backgroundColor: post.image || "#94A3B8" }}
                            >
                              <div className="absolute top-4 left-4">
                                <Badge
                                  variant="secondary"
                                  className={`${categoryInfo[post.category]?.color || "bg-white/90 text-surface-700"}`}
                                >
                                  {categoryInfo[post.category]?.name || post.category}
                                </Badge>
                              </div>
                            </div>

                            <CardContent className="p-6">
                              <div className="flex items-center gap-4 text-sm text-surface-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readTime} min read
                                </span>
                              </div>

                              <h2 className="text-xl font-heading font-semibold text-surface-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
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
                                <span className="text-brand-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                  Read More
                                  <ArrowRight className="h-4 w-4" />
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4 text-surface-600">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

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
