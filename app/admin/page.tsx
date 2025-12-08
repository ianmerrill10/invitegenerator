"use client";

import * as React from "react";
import Link from "next/link";
import {
  Video,
  Wand2,
  Play,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  LayoutDashboard,
  FileVideo,
  Sparkles,
  Copy,
  ExternalLink,
  BookOpen,
  Calendar,
  RefreshCw,
  Trash2,
  Eye,
  Edit,
  PlusCircle,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Demo video sections for the "How It Works" flow
type VideoStatus = "pending" | "in_progress" | "completed";

const demoSections: Array<{
  id: string;
  title: string;
  duration: string;
  description: string;
  status: VideoStatus;
  prompt: string;
}> = [
  {
    id: "intro",
    title: "Welcome & Overview",
    duration: "15 sec",
    description: "Opening shot showing the InviteGenerator homepage with animated invitation previews",
    status: "pending",
    prompt: `Create a 15-second promotional video showing:
- A sleek website landing page for "InviteGenerator"
- Animated invitation cards floating and transforming
- Color palette: dusty rose (#D4919F), slate blue (#64748B), white
- Text overlay: "Create Beautiful Invitations in Minutes"
- Modern, elegant feel with smooth transitions
- End with the InviteGenerator logo`,
  },
  {
    id: "step1",
    title: "Step 1: Choose Template",
    duration: "20 sec",
    description: "User browsing through template gallery, selecting a wedding invitation",
    status: "pending",
    prompt: `Create a 20-second screen recording style video showing:
- A grid of beautiful invitation templates
- Mouse cursor hovering over templates (wedding, birthday, baby shower)
- Zoom animation when clicking on "Elegant Garden Wedding" template
- Template opens in full view with details
- Smooth UI animations and transitions
- Color scheme: dusty rose and slate blue accents
- Professional, clean interface design`,
  },
  {
    id: "step2",
    title: "Step 2: Customize with AI",
    duration: "25 sec",
    description: "AI generating personalized text and design suggestions",
    status: "pending",
    prompt: `Create a 25-second video showing AI-powered customization:
- User typing event details (names, date, venue)
- AI sparkle effect appears
- Text auto-generates: "Sarah & Michael request the pleasure of your company..."
- Color palette suggestions appear
- AI recommends font pairings
- Magic wand cursor effect
- "AI Generated" badge appears
- Smooth, futuristic feel with particle effects`,
  },
  {
    id: "step3",
    title: "Step 3: Preview & Edit",
    duration: "20 sec",
    description: "Live preview of the invitation with drag-and-drop editing",
    status: "pending",
    prompt: `Create a 20-second video showing invitation editing:
- Beautiful wedding invitation displayed
- User drags text elements to reposition
- Color picker appears, user changes accent color
- Font dropdown selection
- Real-time preview updates
- Mobile preview toggle (shows phone mockup)
- Satisfying snap-to-grid animations
- Professional editing interface`,
  },
  {
    id: "step4",
    title: "Step 4: Share & Track RSVPs",
    duration: "20 sec",
    description: "Publishing invitation and watching RSVPs come in",
    status: "pending",
    prompt: `Create a 20-second video showing sharing and RSVP tracking:
- "Publish" button click with confetti animation
- Share modal appears with link, QR code, social buttons
- Cut to: RSVP dashboard
- Animated counter: "12 Attending, 3 Pending, 1 Declined"
- Guest names appearing in list with animations
- Notification popup: "New RSVP from John Smith - Attending!"
- Success celebration feel`,
  },
  {
    id: "outro",
    title: "Call to Action",
    duration: "10 sec",
    description: "Final CTA with logo and signup prompt",
    status: "pending",
    prompt: `Create a 10-second closing video:
- InviteGenerator logo animation (elegant reveal)
- Text: "Start Creating for Free"
- Animated button: "Get Started"
- Background: soft gradient (dusty rose to white)
- Floating invitation cards in background
- Professional, inviting feel
- End card with website URL`,
  },
];

// AI Video Generation Services
const videoServices = [
  {
    name: "Runway Gen-3 Alpha",
    description: "Best for realistic, cinematic video generation",
    quality: "Highest",
    speed: "Medium",
    cost: "$0.05/sec",
    recommended: true,
    url: "https://runwayml.com",
  },
  {
    name: "Pika Labs",
    description: "Great for stylized, animated content",
    quality: "High",
    speed: "Fast",
    cost: "Free tier available",
    recommended: false,
    url: "https://pika.art",
  },
  {
    name: "Luma Dream Machine",
    description: "Good for creative, artistic videos",
    quality: "High",
    speed: "Fast",
    cost: "Free tier available",
    recommended: false,
    url: "https://lumalabs.ai/dream-machine",
  },
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  scheduledFor?: string;
  publishedAt?: string;
}

interface SchedulerStatus {
  status: string;
  today: {
    day: string;
    category: string;
    availableTopics: number;
  };
  scheduled: {
    count: number;
    posts: BlogPost[];
  };
  published: {
    total: number;
  };
  nextPublishTime: string;
  contentCalendar: Array<{
    day: string;
    category: string;
    topicCount: number;
  }>;
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = React.useState<"media" | "blog">("blog");
  const [activeTab, setActiveTab] = React.useState<"media" | "prompts" | "services">("media");
  const [blogTab, setBlogTab] = React.useState<"dashboard" | "generate" | "posts" | "calendar">("dashboard");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const [schedulerStatus, setSchedulerStatus] = React.useState<SchedulerStatus | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch scheduler status
  React.useEffect(() => {
    if (activeSection === "blog") {
      fetchSchedulerStatus();
    }
  }, [activeSection]);

  const fetchSchedulerStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blog/scheduler");
      const data = await response.json();
      if (data.success) {
        setSchedulerStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch scheduler status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPost = async (publishImmediately = false) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/blog/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify({
          action: "generate",
          publishImmediately,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          publishImmediately
            ? "Blog post generated and published!"
            : "Blog post generated and scheduled!"
        );
        fetchSchedulerStatus();
      } else {
        toast.error(data.error || "Failed to generate post");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate blog post");
    } finally {
      setIsGenerating(false);
    }
  };

  const publishScheduledPosts = async () => {
    try {
      const response = await fetch("/api/blog/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify({ action: "publish" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Published ${data.data.publishedIds.length} posts`);
        fetchSchedulerStatus();
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish posts");
    }
  };

  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const totalDuration = demoSections.reduce((acc, section) => {
    const seconds = parseInt(section.duration);
    return acc + seconds;
  }, 0);

  const categoryColors: Record<string, string> = {
    wedding: "bg-pink-100 text-pink-700",
    birthday: "bg-purple-100 text-purple-700",
    baby_shower: "bg-blue-100 text-blue-700",
    corporate: "bg-slate-100 text-slate-700",
    seasonal: "bg-orange-100 text-orange-700",
    how_to: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <span className="font-heading font-bold text-lg">Admin Panel</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {/* Section Switcher */}
              <div className="flex bg-surface-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection("blog")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    activeSection === "blog"
                      ? "bg-white shadow text-surface-900"
                      : "text-surface-600 hover:text-surface-900"
                  )}
                >
                  <BookOpen className="h-4 w-4 inline mr-1.5" />
                  Blog AI
                </button>
                <button
                  onClick={() => setActiveSection("media")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    activeSection === "media"
                      ? "bg-white shadow text-surface-900"
                      : "text-surface-600 hover:text-surface-900"
                  )}
                >
                  <Video className="h-4 w-4 inline mr-1.5" />
                  Media
                </button>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BLOG SECTION */}
        {activeSection === "blog" && (
          <>
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-surface-900 mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-brand-500" />
                AI Blog Content Engine
              </h1>
              <p className="text-surface-600">
                Automatically generate and publish SEO-optimized blog content using AI
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">
                        {schedulerStatus?.published.total || 0}
                      </p>
                      <p className="text-sm text-surface-500">Published Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">
                        {schedulerStatus?.scheduled.count || 0}
                      </p>
                      <p className="text-sm text-surface-500">Scheduled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900 capitalize">
                        {schedulerStatus?.today.day || "---"}
                      </p>
                      <p className="text-sm text-surface-500">Today's Focus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900 capitalize">
                        {schedulerStatus?.today.category?.replace("_", " ") || "---"}
                      </p>
                      <p className="text-sm text-surface-500">Category Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blog Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "generate", label: "Generate Content", icon: Zap },
                { id: "posts", label: "All Posts", icon: BookOpen },
                { id: "calendar", label: "Content Calendar", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBlogTab(tab.id as typeof blogTab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                    blogTab === tab.id
                      ? "bg-brand-500 text-white"
                      : "bg-white text-surface-600 hover:bg-surface-100"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dashboard Tab */}
            {blogTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-brand-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl">
                      <h4 className="font-semibold text-surface-900 mb-2">Generate New Post</h4>
                      <p className="text-sm text-surface-600 mb-4">
                        AI will generate a new blog post based on today's content calendar ({schedulerStatus?.today.category?.replace("_", " ")} category)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => generateNewPost(false)}
                          loading={isGenerating}
                          leftIcon={<Sparkles className="h-4 w-4" />}
                        >
                          Generate & Schedule
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => generateNewPost(true)}
                          loading={isGenerating}
                        >
                          Publish Now
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-surface-200 rounded-xl">
                      <h4 className="font-semibold text-surface-900 mb-2">Publish Scheduled Posts</h4>
                      <p className="text-sm text-surface-600 mb-4">
                        Manually trigger publishing of posts that are past their scheduled time
                      </p>
                      <Button
                        variant="outline"
                        onClick={publishScheduledPosts}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Run Publisher
                      </Button>
                    </div>

                    <div className="p-4 border border-surface-200 rounded-xl">
                      <h4 className="font-semibold text-surface-900 mb-2">View Blog</h4>
                      <p className="text-sm text-surface-600 mb-4">
                        Preview the public blog to see published content
                      </p>
                      <Link href="/blog">
                        <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />}>
                          Open Blog
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Scheduled Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent-500" />
                      Scheduled Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedulerStatus?.scheduled.posts.length === 0 ? (
                      <div className="text-center py-8 text-surface-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No scheduled posts</p>
                        <p className="text-sm">Generate a new post to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {schedulerStatus?.scheduled.posts.map((post) => (
                          <div
                            key={post.id}
                            className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-surface-900 truncate">
                                {post.title}
                              </p>
                              <p className="text-sm text-surface-500">
                                Scheduled for: {new Date(post.scheduledFor!).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-surface-500" />
                      Scheduler Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-500 mb-1">Status</p>
                        <Badge variant="success">
                          {schedulerStatus?.status || "Active"}
                        </Badge>
                      </div>
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-500 mb-1">Next Publish</p>
                        <p className="font-medium text-surface-900">
                          {schedulerStatus?.nextPublishTime
                            ? new Date(schedulerStatus.nextPublishTime).toLocaleString()
                            : "9:00 AM UTC"}
                        </p>
                      </div>
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-500 mb-1">Today's Topics</p>
                        <p className="font-medium text-surface-900">
                          {schedulerStatus?.today.availableTopics || 8} available
                        </p>
                      </div>
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <p className="text-sm text-surface-500 mb-1">Schedule</p>
                        <p className="font-medium text-surface-900">Daily at 9 AM UTC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Generate Tab */}
            {blogTab === "generate" && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-6 text-center">
                    <Sparkles className="h-16 w-16 mx-auto text-brand-500 mb-4" />
                    <h3 className="text-xl font-display font-bold text-surface-900 mb-2">
                      AI-Powered Content Generation
                    </h3>
                    <p className="text-surface-600 mb-6 max-w-lg mx-auto">
                      Our AI will automatically generate SEO-optimized blog posts about event planning,
                      invitations, and party ideas based on the daily content calendar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        size="lg"
                        onClick={() => generateNewPost(false)}
                        loading={isGenerating}
                        leftIcon={<Sparkles className="h-5 w-5" />}
                      >
                        Generate & Schedule
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => generateNewPost(true)}
                        loading={isGenerating}
                        leftIcon={<Zap className="h-5 w-5" />}
                      >
                        Generate & Publish Now
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-surface-200 pt-6">
                    <h4 className="font-semibold text-surface-900 mb-4">How It Works</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                          <span className="font-bold text-brand-600">1</span>
                        </div>
                        <h5 className="font-medium text-surface-900 mb-1">Select Topic</h5>
                        <p className="text-sm text-surface-600">
                          AI selects from the daily content calendar based on SEO strategy
                        </p>
                      </div>
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                          <span className="font-bold text-brand-600">2</span>
                        </div>
                        <h5 className="font-medium text-surface-900 mb-1">Generate Content</h5>
                        <p className="text-sm text-surface-600">
                          Claude AI writes a comprehensive 2000+ word SEO article
                        </p>
                      </div>
                      <div className="p-4 bg-surface-50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center mb-3">
                          <span className="font-bold text-brand-600">3</span>
                        </div>
                        <h5 className="font-medium text-surface-900 mb-1">Publish</h5>
                        <p className="text-sm text-surface-600">
                          Post is scheduled or published immediately based on your choice
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Tab */}
            {blogTab === "posts" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Blog Posts</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => generateNewPost(true)}
                    leftIcon={<PlusCircle className="h-4 w-4" />}
                  >
                    Generate New
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-surface-600 mb-6">
                    View and manage all published and scheduled blog posts.
                  </p>
                  <div className="text-center py-12 text-surface-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Posts are loaded from DynamoDB</p>
                    <p className="text-sm mt-2">Connect to AWS to see your posts here</p>
                    <Link href="/blog" className="mt-4 inline-block">
                      <Button variant="outline">View Public Blog</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calendar Tab */}
            {blogTab === "calendar" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-500" />
                    Weekly Content Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-surface-600 mb-6">
                    The AI blog scheduler follows this weekly content calendar for optimal SEO coverage.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                    {schedulerStatus?.contentCalendar?.map((day) => (
                      <div
                        key={day.day}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-colors",
                          day.day === schedulerStatus.today.day
                            ? "border-brand-500 bg-brand-50"
                            : "border-surface-200 bg-white"
                        )}
                      >
                        <p className="font-semibold capitalize text-surface-900 mb-2">
                          {day.day}
                        </p>
                        <Badge className={categoryColors[day.category] || "bg-surface-100"}>
                          {day.category.replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-surface-500 mt-2">
                          {day.topicCount} topics
                        </p>
                        {day.day === schedulerStatus.today.day && (
                          <Badge variant="primary" className="mt-2">Today</Badge>
                        )}
                      </div>
                    )) || (
                      <>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                          <div
                            key={day}
                            className="p-4 rounded-xl border border-surface-200 bg-white"
                          >
                            <p className="font-semibold text-surface-900 mb-2">{day}</p>
                            <div className="h-6 bg-surface-100 rounded animate-pulse" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-surface-50 rounded-xl">
                    <h4 className="font-semibold text-surface-900 mb-3">SEO Strategy</h4>
                    <ul className="space-y-2 text-sm text-surface-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        Long-tail keywords for each category
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        Comprehensive guides (1800-2200 words)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        Internal CTAs to drive conversions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        Daily publishing at 9 AM UTC
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* MEDIA SECTION */}
        {activeSection === "media" && (
          <>
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
                Media Generation Studio
              </h1>
              <p className="text-surface-600">
                Generate AI-powered demo videos and marketing content for InviteGenerator
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                      <FileVideo className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">{demoSections.length}</p>
                      <p className="text-sm text-surface-500">Video Sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">{totalDuration}s</p>
                      <p className="text-sm text-surface-500">Total Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">0</p>
                      <p className="text-sm text-surface-500">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-surface-900">{demoSections.length}</p>
                      <p className="text-sm text-surface-500">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { id: "media", label: "Demo Videos", icon: Video },
                { id: "prompts", label: "AI Prompts", icon: Wand2 },
                { id: "services", label: "AI Services", icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-brand-500 text-white"
                      : "bg-white text-surface-600 hover:bg-surface-100"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "media" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-brand-500" />
                      Demo Video Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-surface-600 mb-6">
                      These are the video sections for the "How It Works" demo. Generate each section
                      using the AI prompts, then upload them here.
                    </p>

                    <div className="space-y-4">
                      {demoSections.map((section, index) => (
                        <div
                          key={section.id}
                          className="flex items-start gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200"
                        >
                          <div className="h-12 w-12 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-brand-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading font-semibold text-surface-900">
                                {section.title}
                              </h3>
                              <Badge variant="secondary">{section.duration}</Badge>
                              <Badge
                                variant={section.status === "completed" ? "success" : "default"}
                              >
                                {section.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-surface-600">{section.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyPrompt(section.id, section.prompt)}
                            >
                              {copiedPrompt === section.id ? (
                                <CheckCircle className="h-4 w-4 text-success-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "prompts" && (
              <div className="space-y-4">
                {demoSections.map((section, index) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          {section.title}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(section.id, section.prompt)}
                          leftIcon={
                            copiedPrompt === section.id ? (
                              <CheckCircle className="h-4 w-4 text-success-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )
                          }
                        >
                          {copiedPrompt === section.id ? "Copied!" : "Copy Prompt"}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-surface-900 text-surface-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                        {section.prompt}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended AI Video Generation Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-surface-600 mb-6">
                      Use these AI services to generate the demo videos. Copy the prompts from the
                      "AI Prompts" tab and paste them into these services.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoServices.map((service) => (
                        <div
                          key={service.name}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-colors",
                            service.recommended
                              ? "border-brand-500 bg-brand-50"
                              : "border-surface-200 bg-white"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-heading font-semibold text-surface-900 flex items-center gap-2">
                                {service.name}
                                {service.recommended && (
                                  <Badge variant="primary">Recommended</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-surface-600 mt-1">{service.description}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary">Quality: {service.quality}</Badge>
                            <Badge variant="secondary">Speed: {service.speed}</Badge>
                            <Badge variant="secondary">{service.cost}</Badge>
                          </div>

                          <a href={service.url} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant={service.recommended ? "primary" : "outline"}
                              size="sm"
                              className="w-full"
                              rightIcon={<ExternalLink className="h-4 w-4" />}
                            >
                              Open {service.name}
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
