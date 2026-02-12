"use client";

import { useState } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Check,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact" | "vertical";
  showLabels?: boolean;
}

interface ShareButton {
  name: string;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
  getUrl: (url: string, title: string, description?: string) => string;
}

const shareButtons: ShareButton[] = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-[#1877F2]",
    hoverColor: "hover:bg-[#0C63D4]",
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "bg-[#1DA1F2]",
    hoverColor: "hover:bg-[#0C8BD9]",
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-[#0A66C2]",
    hoverColor: "hover:bg-[#084E96]",
    getUrl: (url, title, description) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${description ? `&summary=${encodeURIComponent(description)}` : ""}`,
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-[#25D366]",
    hoverColor: "hover:bg-[#1DA851]",
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "bg-[#0088CC]",
    hoverColor: "hover:bg-[#006DA3]",
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-surface-600",
    hoverColor: "hover:bg-surface-700",
    getUrl: (url, title, description) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ""}\n\n${url}`)}`,
  },
];

export function SocialShare({
  url,
  title,
  description,
  className = "",
  variant = "default",
  showLabels = false,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (button: ShareButton) => {
    const shareUrl = button.getUrl(url, title, description);
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {shareButtons.slice(0, 4).map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.name}
              onClick={() => handleShare(button)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors",
                button.color,
                button.hoverColor
              )}
              aria-label={`Share on ${button.name}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <button
          onClick={handleCopyLink}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-200 hover:bg-surface-300 transition-colors"
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Link2 className="w-4 h-4 text-surface-600" />
          )}
        </button>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {shareButtons.map((button) => {
          const Icon = button.icon;
          return (
            <Button
              key={button.name}
              onClick={() => handleShare(button)}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white",
                  button.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              Share on {button.name}
            </Button>
          );
        })}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-200">
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Link2 className="w-4 h-4 text-surface-600" />
            )}
          </div>
          {copied ? "Link Copied!" : "Copy Link"}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {shareButtons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.name}
            onClick={() => handleShare(button)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors",
              button.color,
              button.hoverColor
            )}
            aria-label={`Share on ${button.name}`}
          >
            <Icon className="w-5 h-5" />
            {showLabels && <span className="text-sm font-medium">{button.name}</span>}
          </button>
        );
      })}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-500" />
            {showLabels && <span className="text-sm font-medium text-green-600">Copied!</span>}
          </>
        ) : (
          <>
            <Link2 className="w-5 h-5 text-surface-600" />
            {showLabels && <span className="text-sm font-medium text-surface-700">Copy Link</span>}
          </>
        )}
      </button>
    </div>
  );
}

// Simple share button for invitation pages
export function ShareInvitation({
  shortId,
  eventTitle,
}: {
  shortId: string;
  eventTitle: string;
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://invitegenerator.com";
  const url = `${baseUrl}/i/${shortId}`;

  return (
    <SocialShare
      url={url}
      title={`You're invited: ${eventTitle}`}
      description={`Check out this invitation and RSVP!`}
      variant="compact"
    />
  );
}
