"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCopyToClipboard } from "@/hooks";
import {
  Copy,
  Check,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  QrCode,
  Download,
  Share2,
} from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  title: string;
  description?: string;
  onEmailShare?: () => void;
  onDownloadQR?: () => void;
  className?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  shareUrl,
  title,
  description,
  onEmailShare,
  onDownloadQR,
  className,
}: ShareDialogProps) {
  const { copy, copied } = useCopyToClipboard();

  const handleCopyLink = () => {
    copy(shareUrl);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ""}\n\n${shareUrl}`)}`,
  };

  const handleSocialShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Invitation
          </DialogTitle>
          <DialogDescription>
            Share your invitation with guests via link, social media, or email.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="invitation-link">Invitation Link</Label>
              <div className="flex gap-2">
                <Input id="invitation-link" value={shareUrl} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline" aria-label={copied ? "Link copied" : "Copy link"}>
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">Link copied to clipboard!</p>
              )}
            </div>

            {onDownloadQR && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onDownloadQR}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            )}
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialShare("facebook")}
              >
                <Facebook className="h-5 w-5 mr-2 text-[#1877F2]" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialShare("twitter")}
              >
                <Twitter className="h-5 w-5 mr-2 text-[#1DA1F2]" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialShare("linkedin")}
              >
                <Linkedin className="h-5 w-5 mr-2 text-[#0A66C2]" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleSocialShare("whatsapp")}
              >
                <MessageCircle className="h-5 w-5 mr-2 text-[#25D366]" />
                WhatsApp
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleSocialShare("email")}
            >
              <Mail className="h-5 w-5 mr-2" />
              Open in Email App
            </Button>

            {onEmailShare && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button className="w-full" onClick={onEmailShare}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send via InviteGenerator
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Send branded emails directly from our platform
                </p>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Inline share buttons
interface ShareButtonsProps {
  shareUrl: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ShareButtons({
  shareUrl,
  title,
  size = "md",
  className,
}: ShareButtonsProps) {
  const { copy, copied } = useCopyToClipboard();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={sizeClasses[size]}
        onClick={() => copy(shareUrl)}
        title="Copy link"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className={cn(iconSizes[size], "text-green-600")} />
        ) : (
          <Link2 className={iconSizes[size]} />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={sizeClasses[size]}
        onClick={() => handleShare("facebook")}
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <Facebook className={cn(iconSizes[size], "text-[#1877F2]")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={sizeClasses[size]}
        onClick={() => handleShare("twitter")}
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <Twitter className={cn(iconSizes[size], "text-[#1DA1F2]")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={sizeClasses[size]}
        onClick={() => handleShare("whatsapp")}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className={cn(iconSizes[size], "text-[#25D366]")} />
      </Button>
    </div>
  );
}
