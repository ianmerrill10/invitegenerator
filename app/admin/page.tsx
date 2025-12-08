"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Video,
  Image,
  Wand2,
  Play,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  LayoutDashboard,
  FileVideo,
  Sparkles,
  Copy,
  ExternalLink,
  Link2,
  Unlink,
  Upload,
  FolderOpen,
  Palette,
  DollarSign,
  TrendingUp,
  Gift,
  Users,
  Award,
  Target,
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

// Canva connection state interface
interface CanvaStatus {
  connected: boolean;
  expired?: boolean;
  user?: {
    id: string;
    displayName: string;
  } | null;
  team?: {
    id: string;
    displayName: string;
  } | null;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState<"media" | "prompts" | "services" | "canva">("media");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const [canvaStatus, setCanvaStatus] = React.useState<CanvaStatus>({ connected: false });
  const [canvaLoading, setCanvaLoading] = React.useState(true);

  // Check Canva connection status on mount
  React.useEffect(() => {
    async function checkCanvaStatus() {
      try {
        const response = await fetch("/api/canva/status");
        const result = await response.json();
        if (result.data) {
          setCanvaStatus(result.data);
        }
      } catch (error) {
        console.error("Failed to check Canva status:", error);
      } finally {
        setCanvaLoading(false);
      }
    }
    checkCanvaStatus();
  }, []);

  const handleCanvaDisconnect = async () => {
    try {
      await fetch("/api/canva/status", { method: "DELETE" });
      setCanvaStatus({ connected: false });
    } catch (error) {
      console.error("Failed to disconnect Canva:", error);
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
            { id: "canva", label: "Canva Integration", icon: Palette },
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
                    const prompt = `I'm creating a demo video for InviteGenerator...`; // Full prompt
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

        {activeTab === "canva" && (
          <div className="space-y-6">
            {/* Canva Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-brand-500" />
                  Canva Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {canvaLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-surface-600">Checking connection...</span>
                  </div>
                ) : canvaStatus.connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-success-50 rounded-xl border border-success-200">
                      <CheckCircle className="h-6 w-6 text-success-600" />
                      <div>
                        <p className="font-semibold text-success-800">Connected to Canva</p>
                        {canvaStatus.user && (
                          <p className="text-sm text-success-700">
                            Logged in as: {canvaStatus.user.displayName}
                          </p>
                        )}
                        {canvaStatus.team && (
                          <p className="text-sm text-success-700">
                            Team: {canvaStatus.team.displayName}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCanvaDisconnect}
                      leftIcon={<Unlink className="h-4 w-4" />}
                    >
                      Disconnect from Canva
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-surface-100 rounded-xl border border-surface-200">
                      <AlertCircle className="h-6 w-6 text-surface-500" />
                      <div>
                        <p className="font-semibold text-surface-800">Not Connected</p>
                        <p className="text-sm text-surface-600">
                          Connect to Canva to export invitations and sync designs
                        </p>
                      </div>
                    </div>
                    <Link href="/api/canva/auth">
                      <Button
                        variant="primary"
                        leftIcon={<Link2 className="h-4 w-4" />}
                      >
                        Connect to Canva
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Canva Integration Features */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-surface-900">Export to Canva</h3>
                        <p className="text-sm text-surface-600">Send invitations to Canva for editing</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!canvaStatus.connected}
                    >
                      Export Invitation
                    </Button>
                  </div>

                  <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-accent-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-surface-900">Browse Designs</h3>
                        <p className="text-sm text-surface-600">View your Canva designs</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={!canvaStatus.connected}
                    >
                      View Designs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-surface-600">
                  To enable Canva integration, you need to create a Canva Connect API application:
                </p>

                <ol className="list-decimal list-inside space-y-3 text-surface-700">
                  <li>Go to the <a href="https://www.canva.com/developers/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Canva Developer Portal</a></li>
                  <li>Create a new Connect API application</li>
                  <li>Add the following redirect URI: <code className="px-2 py-1 bg-surface-100 rounded text-sm font-mono">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/canva/callback</code></li>
                  <li>Request the following scopes:
                    <ul className="list-disc list-inside ml-4 mt-2 text-sm text-surface-600">
                      <li>design:content:read</li>
                      <li>design:content:write</li>
                      <li>design:meta:read</li>
                      <li>asset:read</li>
                      <li>asset:write</li>
                    </ul>
                  </li>
                  <li>Copy your Client ID and Client Secret</li>
                  <li>Add them to your environment variables:
                    <div className="mt-2 p-3 bg-surface-900 text-surface-100 rounded-lg font-mono text-sm">
                      CANVA_CLIENT_ID=your_client_id<br />
                      CANVA_CLIENT_SECRET=your_client_secret
                    </div>
                  </li>
                </ol>

                <div className="mt-6 p-4 bg-success-50 rounded-xl border border-success-200">
                  <h4 className="font-semibold text-success-800 flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Canva Licensing Compliance
                  </h4>
                  <p className="text-sm text-success-700 mb-3">
                    InviteGenerator is compliant with Canva's Content License Agreement. Section 5 explicitly permits
                    using Canva content for "invitations, advertising and promotional projects."
                  </p>
                  <ul className="text-sm text-success-700 space-y-1 mb-3">
                    <li>✓ <strong>Invitations are explicitly allowed</strong> - Listed as a permitted use</li>
                    <li>✓ <strong>We export TO Canva</strong> - Not extracting or redistributing Canva content</li>
                    <li>✓ <strong>Original designs</strong> - Users create composite works with multiple elements</li>
                    <li>✓ <strong>No standalone content sales</strong> - We don't sell Canva content</li>
                  </ul>
                  <div className="p-3 bg-white rounded-lg border border-success-200 text-xs text-surface-600">
                    <strong>Users should note:</strong> Pro Content licenses apply per design. Free Content has fewer
                    restrictions. "Editorial Use Only" content cannot be used commercially. Disney and Branded Content
                    have additional restrictions.
                  </div>
                  <a
                    href="https://www.canva.com/policies/content-license-agreement/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-success-800 hover:underline mt-3"
                  >
                    View full Content License Agreement <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Canva API Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="https://www.canva.dev/docs/connect/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-brand-300 transition-colors group"
                  >
                    <h3 className="font-heading font-semibold text-surface-900 group-hover:text-brand-600 flex items-center gap-2">
                      Connect API Docs
                      <ExternalLink className="h-4 w-4" />
                    </h3>
                    <p className="text-sm text-surface-600 mt-1">
                      REST API for design management
                    </p>
                  </a>

                  <a
                    href="https://www.canva.dev/docs/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-brand-300 transition-colors group"
                  >
                    <h3 className="font-heading font-semibold text-surface-900 group-hover:text-brand-600 flex items-center gap-2">
                      Apps SDK Docs
                      <ExternalLink className="h-4 w-4" />
                    </h3>
                    <p className="text-sm text-surface-600 mt-1">
                      Build apps inside Canva editor
                    </p>
                  </a>

                  <a
                    href="https://www.canva.dev/docs/apps/app-ui-kit/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-surface-50 rounded-xl border border-surface-200 hover:border-brand-300 transition-colors group"
                  >
                    <h3 className="font-heading font-semibold text-surface-900 group-hover:text-brand-600 flex items-center gap-2">
                      App UI Kit
                      <ExternalLink className="h-4 w-4" />
                    </h3>
                    <p className="text-sm text-surface-600 mt-1">
                      React components for Canva apps
                    </p>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Canva Monetization Strategy */}
            <Card className="border-2 border-brand-300 bg-brand-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-brand-500" />
                  Canva Monetization Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-surface-600">
                  There are multiple ways to monetize the Canva integration for InviteGenerator:
                </p>

                {/* Empower Canvassador Program */}
                <div className="p-4 bg-white rounded-xl border border-surface-200">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-surface-900">
                          Empower Canvassador Program
                        </h3>
                        <Badge variant="primary">Recommended</Badge>
                      </div>
                      <p className="text-sm text-surface-600 mb-3">
                        Canva's affiliate program for content creators. Earn up to $36 per Pro subscription referral.
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-surface-50 rounded-lg text-center">
                          <p className="text-lg font-bold text-brand-600">$36</p>
                          <p className="text-xs text-surface-500">Max per referral</p>
                        </div>
                        <div className="p-3 bg-surface-50 rounded-lg text-center">
                          <p className="text-lg font-bold text-brand-600">80%</p>
                          <p className="text-xs text-surface-500">Annual commission</p>
                        </div>
                        <div className="p-3 bg-surface-50 rounded-lg text-center">
                          <p className="text-lg font-bold text-brand-600">30 days</p>
                          <p className="text-xs text-surface-500">Cookie window</p>
                        </div>
                        <div className="p-3 bg-surface-50 rounded-lg text-center">
                          <p className="text-lg font-bold text-brand-600">2%</p>
                          <p className="text-xs text-surface-500">Acceptance rate</p>
                        </div>
                      </div>

                      <div className="p-3 bg-warning-50 rounded-lg border border-warning-200 mb-4">
                        <h4 className="font-semibold text-warning-800 text-sm mb-1">Requirements to Qualify:</h4>
                        <ul className="text-xs text-warning-700 space-y-1">
                          <li>• Active social media presence (YouTube, TikTok, Instagram, etc.)</li>
                          <li>• Create at least 1 Canva-related content piece monthly</li>
                          <li>• Embody Canva's values and have engaged audience</li>
                        </ul>
                      </div>

                      <a
                        href="https://public.canva.site/empower-canvassador-program"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="primary" rightIcon={<ExternalLink className="h-4 w-4" />}>
                          Apply to Empower Program
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reseller Partner */}
                <div className="p-4 bg-white rounded-xl border border-surface-200">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-surface-900 mb-2">
                        Reseller Partner Program
                      </h3>
                      <p className="text-sm text-surface-600 mb-3">
                        Resell Canva Enterprise licenses to organizations with 100+ users. Earn margin on each sale.
                      </p>
                      <ul className="text-sm text-surface-600 space-y-1 mb-3">
                        <li>• Target mid-large organizations (100+ people)</li>
                        <li>• Resell Canva Enterprise and Canva for Campus</li>
                        <li>• Unlock exclusive benefits and support</li>
                      </ul>
                      <a
                        href="https://www.canva.com/partners/reseller/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-4 w-4" />}>
                          Learn About Reseller Program
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Implementation Strategy */}
                <div className="p-4 bg-surface-900 rounded-xl text-white">
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-400" />
                    Implementation Strategy for InviteGenerator
                  </h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <div>
                        <p className="font-medium text-white">Add Affiliate Links at Key Touchpoints</p>
                        <p className="text-surface-400 text-xs">When users export to Canva, recommend Canva Pro for advanced features</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <div>
                        <p className="font-medium text-white">Create Canva Tutorial Content</p>
                        <p className="text-surface-400 text-xs">Produce monthly videos/guides showing how to use Canva with InviteGenerator</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <div>
                        <p className="font-medium text-white">Promote Canva Pro Benefits</p>
                        <p className="text-surface-400 text-xs">Highlight Pro features: background remover, Brand Kit, premium templates</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <div>
                        <p className="font-medium text-white">Track Conversions</p>
                        <p className="text-surface-400 text-xs">Use Impact.com dashboard to monitor clicks, conversions, and earnings</p>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Revenue Potential */}
                <div className="p-4 bg-success-50 rounded-xl border border-success-200">
                  <h3 className="font-heading font-semibold text-success-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Potential Calculator
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-surface-500 mb-1">If 100 users/month convert:</p>
                      <p className="text-2xl font-bold text-success-600">$3,600/mo</p>
                      <p className="text-xs text-surface-500">100 × $36 commission</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-surface-500 mb-1">If 500 users/month convert:</p>
                      <p className="text-2xl font-bold text-success-600">$18,000/mo</p>
                      <p className="text-xs text-surface-500">500 × $36 commission</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-surface-500 mb-1">If 1000 users/month convert:</p>
                      <p className="text-2xl font-bold text-success-600">$36,000/mo</p>
                      <p className="text-xs text-surface-500">1000 × $36 commission</p>
                    </div>
                  </div>
                  <p className="text-xs text-success-700 mt-3">
                    * Assumes all users sign up for annual Canva Pro subscriptions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
