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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  {
    name: "Kling AI",
    description: "Long-form video generation (up to 2 min)",
    quality: "High",
    speed: "Slow",
    cost: "Free tier available",
    recommended: false,
    url: "https://klingai.com",
  },
  {
    name: "Google Veo 2",
    description: "Google's latest video model (limited access)",
    quality: "Highest",
    speed: "Medium",
    cost: "Waitlist",
    recommended: false,
    url: "https://deepmind.google/technologies/veo/",
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<"media" | "prompts" | "services">("media");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);

  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const totalDuration = demoSections.reduce((acc, section) => {
    const seconds = parseInt(section.duration);
    return acc + seconds;
  }, 0);

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
            <Link href="/dashboard">
              <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {/* Master Prompt for Gemini */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-500" />
                  Master Prompt for Google Gemini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-surface-600 mb-4">
                  Use this prompt with Gemini to get video generation guidance and refined prompts:
                </p>
                <div className="bg-surface-900 text-surface-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap mb-4">
{`I'm creating a demo video for InviteGenerator, a SaaS platform for creating digital invitations.

Brand Colors:
- Primary: Dusty Rose (#D4919F)
- Secondary: Slate Blue (#64748B)
- Background: White/Light Gray

Video Requirements:
- Total duration: ~2 minutes (6 sections)
- Style: Professional, modern, elegant
- Target audience: People planning weddings, birthdays, baby showers
- Tone: Friendly, inviting, sophisticated

I need you to help me:
1. Refine the video prompts for AI video generators (Runway, Pika, Luma)
2. Suggest visual transitions between sections
3. Recommend music style and pacing
4. Provide tips for making the videos cohesive

Here are my 6 video sections:
${demoSections.map((s, i) => `${i + 1}. ${s.title} (${s.duration}): ${s.description}`).join('\n')}

Please provide:
1. Enhanced prompts optimized for Runway Gen-3
2. Suggested b-roll or stock footage to supplement
3. Text overlay suggestions for each section
4. Recommended background music genre/mood`}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(document.querySelector('.bg-surface-900')?.textContent || '');
                    setCopiedPrompt('master');
                    setTimeout(() => setCopiedPrompt(null), 2000);
                  }}
                  leftIcon={copiedPrompt === 'master' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                >
                  {copiedPrompt === 'master' ? "Copied!" : "Copy Master Prompt"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
