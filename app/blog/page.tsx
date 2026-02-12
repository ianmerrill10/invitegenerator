import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User, Tag } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Blog | InviteGenerator",
  description: "Tips, inspiration, and guides for creating beautiful invitations for weddings, birthdays, and all your special events.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | InviteGenerator",
    description: "Tips, inspiration, and guides for creating beautiful invitations.",
  },
};

// Placeholder blog posts - these would come from a CMS in production
const featuredPost = {
  slug: "ultimate-guide-wedding-invitations-2024",
  title: "The Ultimate Guide to Wedding Invitations in 2024",
  excerpt: "Everything you need to know about creating stunning wedding invitations that perfectly capture your special day.",
  image: "/images/blog/wedding-guide.jpg",
  category: "Wedding",
  author: "Emma Wilson",
  date: "2024-01-15",
  readTime: "8 min read",
};

const blogPosts = [
  {
    slug: "10-birthday-invitation-ideas",
    title: "10 Creative Birthday Invitation Ideas That Will Wow Your Guests",
    excerpt: "From elegant adult celebrations to fun kids' parties, discover invitation ideas that set the perfect tone.",
    image: "/images/blog/birthday-ideas.jpg",
    category: "Birthday",
    author: "Sarah Chen",
    date: "2024-01-12",
    readTime: "5 min read",
  },
  {
    slug: "rsvp-management-tips",
    title: "RSVP Management Made Easy: Tips for Stress-Free Event Planning",
    excerpt: "Learn how to track RSVPs efficiently and ensure your event planning goes smoothly.",
    image: "/images/blog/rsvp-tips.jpg",
    category: "Planning",
    author: "Michael Torres",
    date: "2024-01-10",
    readTime: "6 min read",
  },
  {
    slug: "digital-vs-paper-invitations",
    title: "Digital vs. Paper Invitations: Which Is Right for Your Event?",
    excerpt: "Weighing the pros and cons of digital and traditional invitations for modern events.",
    image: "/images/blog/digital-paper.jpg",
    category: "Guide",
    author: "Emma Wilson",
    date: "2024-01-08",
    readTime: "4 min read",
  },
  {
    slug: "baby-shower-invitation-trends",
    title: "2024 Baby Shower Invitation Trends You Need to Know",
    excerpt: "The latest design trends for celebrating the upcoming arrival of your little one.",
    image: "/images/blog/baby-shower.jpg",
    category: "Baby Shower",
    author: "Jessica Lee",
    date: "2024-01-05",
    readTime: "5 min read",
  },
  {
    slug: "corporate-event-invitations",
    title: "How to Create Professional Corporate Event Invitations",
    excerpt: "Make the right impression with polished invitations for your business events.",
    image: "/images/blog/corporate.jpg",
    category: "Corporate",
    author: "David Park",
    date: "2024-01-03",
    readTime: "7 min read",
  },
  {
    slug: "color-psychology-invitations",
    title: "Color Psychology: Choosing the Perfect Palette for Your Invitations",
    excerpt: "How colors affect mood and perception, and how to use this knowledge in your designs.",
    image: "/images/blog/colors.jpg",
    category: "Design",
    author: "Sarah Chen",
    date: "2024-01-01",
    readTime: "6 min read",
  },
];

const categories = [
  { name: "All", count: 42 },
  { name: "Wedding", count: 12 },
  { name: "Birthday", count: 8 },
  { name: "Baby Shower", count: 6 },
  { name: "Corporate", count: 5 },
  { name: "Design", count: 7 },
  { name: "Planning", count: 4 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50 to-surface-50 pt-32 pb-16">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-surface-900 mb-6">
              Invitation Inspiration & Tips
            </h1>
            <p className="text-lg text-surface-600 mb-8">
              Discover guides, trends, and expert advice to create unforgettable invitations for every occasion.
            </p>
            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category.name === "All"
                      ? "bg-brand-500 text-white"
                      : "bg-white text-surface-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container-custom">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-[4/3] md:aspect-auto bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <span className="text-brand-400 text-lg">Featured Image</span>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-sm">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-surface-900 mb-4 group-hover:text-brand-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-surface-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-surface-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="font-heading text-2xl font-bold text-surface-900 mb-8">
            Latest Articles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="aspect-[16/9] bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center">
                    <span className="text-surface-400 text-sm">Article Image</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-xs text-brand-600 font-medium">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-surface-600 text-sm mb-4 flex-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-surface-500">
                      <span>{post.author}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-2xl mx-auto">
          <NewsletterSignup variant="hero" />
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="py-12 bg-brand-50">
        <div className="container-custom text-center">
          <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
            More Content Coming Soon!
          </h2>
          <p className="text-surface-600 max-w-2xl mx-auto">
            We&apos;re working on creating more helpful guides, tutorials, and inspiration
            for all your invitation needs. Check back soon for new content!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
