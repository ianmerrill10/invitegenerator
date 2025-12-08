"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  User,
  Tag,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorBio?: string;
  authorAvatar?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  featured: boolean;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: number;
  image?: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPost(data.data.post);
          setRelatedPosts(data.data.relatedPosts || []);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "Check out this article";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-surface-50 pt-20">
          <div className="container-custom py-16">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-surface-200 rounded w-3/4" />
                <div className="h-4 bg-surface-200 rounded w-1/4" />
                <div className="h-64 bg-surface-200 rounded" />
                <div className="space-y-4">
                  <div className="h-4 bg-surface-200 rounded" />
                  <div className="h-4 bg-surface-200 rounded" />
                  <div className="h-4 bg-surface-200 rounded w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-surface-50 pt-20">
          <div className="container-custom py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-display font-bold text-surface-900 mb-4">
                Article Not Found
              </h1>
              <p className="text-surface-600 mb-8">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryColors: Record<string, string> = {
    wedding: "bg-pink-100 text-pink-700",
    birthday: "bg-purple-100 text-purple-700",
    baby_shower: "bg-blue-100 text-blue-700",
    corporate: "bg-slate-100 text-slate-700",
    seasonal: "bg-orange-100 text-orange-700",
    how_to: "bg-green-100 text-green-700",
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50 pt-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-surface-200">
          <div className="container-custom py-4">
            <nav className="flex items-center gap-2 text-sm text-surface-500">
              <Link href="/" className="hover:text-brand-600">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="hover:text-brand-600">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-surface-900 truncate max-w-[200px]">{post.title}</span>
            </nav>
          </div>
        </div>

        <article className="py-12">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              {/* Article Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Badge className={categoryColors[post.category] || "bg-surface-100 text-surface-700"}>
                  {post.category.replace("_", " ")}
                </Badge>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-surface-900 mt-4 mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-surface-500 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <span className="font-medium text-surface-900">{post.author}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.readTime} min read
                  </span>
                </div>

                {/* Share buttons */}
                <div className="flex items-center gap-2 pb-6 border-b border-surface-200">
                  <span className="text-sm text-surface-500 mr-2">Share:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                    className="h-9 w-9 p-0"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("facebook")}
                    className="h-9 w-9 p-0"
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                    className="h-9 w-9 p-0"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("copy")}
                    className="h-9 w-9 p-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </motion.header>

              {/* Featured Image */}
              {post.image && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-10"
                >
                  <div
                    className="w-full h-64 md:h-96 rounded-2xl"
                    style={{ backgroundColor: post.image.startsWith("#") ? post.image : "#D4919F" }}
                  />
                </motion.div>
              )}

              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="prose prose-lg prose-surface max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-2 py-6 border-t border-b border-surface-200 mb-12"
                >
                  <Tag className="h-4 w-4 text-surface-400" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 rounded-full bg-surface-100 text-surface-600 text-sm hover:bg-brand-100 hover:text-brand-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </motion.div>
              )}

              {/* CTA Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-center text-white mb-12"
              >
                <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-display font-bold mb-3">
                  Ready to Create Your Invitation?
                </h3>
                <p className="text-white/80 mb-6 max-w-lg mx-auto">
                  Use AI to design stunning invitations in minutes. Create beautiful event invitations with no design skills required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="secondary" size="lg" className="bg-white text-brand-600 hover:bg-white/90">
                    <Link href="/auth/signup">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10">
                    <Link href="/templates">Browse Templates</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Author Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-surface-100 rounded-2xl p-6 mb-12"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-brand-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-surface-900 mb-1">
                      {post.author}
                    </h4>
                    <p className="text-surface-600 text-sm">
                      {post.authorBio || "The InviteGenerator team is dedicated to helping you create beautiful invitations for all of life's special moments. We share tips, inspiration, and guides to make your event planning easier."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Back to blog */}
              <div className="text-center mb-12">
                <Button asChild variant="outline">
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Articles
                  </Link>
                </Button>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="max-w-6xl mx-auto"
              >
                <h2 className="text-2xl font-display font-bold text-surface-900 mb-8 text-center">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} href={`/blog/${related.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <div
                          className="h-40 rounded-t-lg"
                          style={{ backgroundColor: related.image?.startsWith("#") ? related.image : "#94A3B8" }}
                        />
                        <CardContent className="p-5">
                          <Badge className={categoryColors[related.category] || "bg-surface-100 text-surface-700"} variant="secondary">
                            {related.category.replace("_", " ")}
                          </Badge>
                          <h3 className="font-heading font-semibold text-surface-900 mt-3 mb-2 line-clamp-2 hover:text-brand-600 transition-colors">
                            {related.title}
                          </h3>
                          <p className="text-sm text-surface-500">
                            {related.readTime} min read
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </article>

        {/* Newsletter CTA */}
        <section className="py-16 bg-brand-500">
          <div className="container-custom">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Get More Inspiration
              </h2>
              <p className="text-white/80 mb-8">
                Subscribe to our newsletter for the latest event planning tips and invitation ideas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50"
                />
                <Button variant="secondary" className="bg-white text-brand-600 hover:bg-white/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
