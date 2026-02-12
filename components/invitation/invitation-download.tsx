"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  FileImage,
  FileText,
  Printer,
  Loader2,
  Check,
  Info,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Invitation, UserPlan } from "@/types";

interface InvitationDownloadProps {
  invitation: Invitation;
  userPlan?: UserPlan;
  onDownload?: (format: string, size: string) => void;
}

// Standard print sizes in inches
const PRINT_SIZES = [
  { id: "4x6", label: "4×6 inches", width: 4, height: 6, popular: true },
  { id: "5x7", label: "5×7 inches", width: 5, height: 7, popular: true },
  { id: "a6", label: "A6 (4.1×5.8\")", width: 4.1, height: 5.8, popular: false },
  { id: "a5", label: "A5 (5.8×8.3\")", width: 5.8, height: 8.3, popular: false },
  { id: "square5", label: "5×5 inches (Square)", width: 5, height: 5, popular: true },
  { id: "postcard", label: "Postcard (6×4\")", width: 6, height: 4, popular: false },
];

// Export formats
const EXPORT_FORMATS = [
  {
    id: "png-standard",
    label: "PNG (Standard)",
    description: "Good for digital sharing",
    dpi: 150,
    icon: FileImage,
    free: true,
  },
  {
    id: "png-print",
    label: "PNG (Print Quality)",
    description: "300 DPI - Professional print quality",
    dpi: 300,
    icon: FileImage,
    free: false,
  },
  {
    id: "pdf-print",
    label: "PDF (Print Ready)",
    description: "Vector quality with bleed marks",
    dpi: 300,
    icon: FileText,
    free: false,
  },
  {
    id: "pdf-bleed",
    label: "PDF (With Bleed)",
    description: "Includes 0.125\" bleed for professional printing",
    dpi: 300,
    icon: Printer,
    free: false,
  },
];

export function InvitationDownload({
  invitation,
  userPlan = "free",
  onDownload,
}: InvitationDownloadProps) {
  const [selectedSize, setSelectedSize] = useState("5x7");
  const [selectedFormat, setSelectedFormat] = useState("png-standard");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const isPremium = userPlan !== "free";
  const selectedFormatInfo = EXPORT_FORMATS.find((f) => f.id === selectedFormat);
  const selectedSizeInfo = PRINT_SIZES.find((s) => s.id === selectedSize);

  const canDownload = selectedFormatInfo?.free || isPremium;

  const handleDownload = async () => {
    if (!canDownload) {
      toast.error("Upgrade to Pro to access print-quality downloads");
      return;
    }

    setIsDownloading(true);
    setDownloadComplete(false);

    try {
      // Calculate dimensions based on DPI
      const dpi = selectedFormatInfo?.dpi || 150;
      const width = (selectedSizeInfo?.width || 5) * dpi;
      const height = (selectedSizeInfo?.height || 7) * dpi;

      // Call the export API
      const response = await fetch(`/api/invitations/${invitation.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: selectedFormat,
          size: selectedSize,
          width,
          height,
          dpi,
          includeBleed: selectedFormat === "pdf-bleed",
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the blob and download
      const blob = await response.blob();
      const extension = selectedFormat.startsWith("pdf") ? "pdf" : "png";
      const filename = `${invitation.title.replace(/[^a-z0-9]/gi, "-")}-${selectedSize}-${dpi}dpi.${extension}`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadComplete(true);
      toast.success("Download complete!");
      onDownload?.(selectedFormat, selectedSize);

      // Reset after 3 seconds
      setTimeout(() => setDownloadComplete(false), 3000);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Download Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormat === format.id;
            const isLocked = !format.free && !isPremium;

            return (
              <button
                key={format.id}
                onClick={() => !isLocked && setSelectedFormat(format.id)}
                disabled={isLocked}
                className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : isLocked
                    ? "border-surface-200 bg-surface-50 opacity-60 cursor-not-allowed"
                    : "border-surface-200 hover:border-surface-300"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-brand-500 text-white" : "bg-surface-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{format.label}</span>
                    {!format.free && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-brand-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Size Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Print Size</label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRINT_SIZES.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                <div className="flex items-center gap-2">
                  <span>{size.label}</span>
                  {size.popular && (
                    <Badge variant="outline" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Size Preview */}
        <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
          <div
            className="bg-white border border-surface-200 shadow-sm"
            style={{
              width: `${(selectedSizeInfo?.width || 5) * 12}px`,
              height: `${(selectedSizeInfo?.height || 7) * 12}px`,
              maxWidth: "100px",
              maxHeight: "140px",
            }}
          />
          <div className="text-sm">
            <p className="font-medium">{selectedSizeInfo?.label}</p>
            <p className="text-muted-foreground">
              {selectedFormatInfo?.dpi || 150} DPI •{" "}
              {Math.round((selectedSizeInfo?.width || 5) * (selectedFormatInfo?.dpi || 150))} ×{" "}
              {Math.round((selectedSizeInfo?.height || 7) * (selectedFormatInfo?.dpi || 150))} pixels
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={isDownloading || !canDownload}
        className="w-full"
        size="lg"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Preparing Download...
          </>
        ) : downloadComplete ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            Downloaded!
          </>
        ) : !canDownload ? (
          <>
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Download
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Download {selectedFormatInfo?.label}
          </>
        )}
      </Button>

      {!isPremium && (
        <p className="text-xs text-center text-muted-foreground">
          <Sparkles className="h-3 w-3 inline mr-1" />
          Upgrade to Pro for high-resolution print downloads
        </p>
      )}
    </div>
  );
}

// Print Guide Component
export function PrintGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print at Home Guide
        </CardTitle>
        <CardDescription>
          Tips for getting the best results when printing your invitations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <StepItem
            number={1}
            title="Choose the Right Paper"
            description="Use cardstock (80-110 lb) for best results. Matte or glossy finish both work well."
          />
          <StepItem
            number={2}
            title="Printer Settings"
            description="Select 'Best Quality' or 'Photo' mode. Use 'Actual Size' - don't scale to fit."
          />
          <StepItem
            number={3}
            title="Test Print First"
            description="Print one copy on regular paper to check alignment and colors before using cardstock."
          />
          <StepItem
            number={4}
            title="Let It Dry"
            description="Allow ink to dry for 5-10 minutes before handling to prevent smudging."
          />
        </div>

        <Separator />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Pro Tip</p>
              <p className="text-amber-700">
                For best results with home printing, download the PNG (Print Quality)
                format at 300 DPI. This ensures crisp text and images.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="font-medium text-sm mb-2">Recommended Paper</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Avery Postcards (5389) - 4×6 inches</li>
            <li>• Neenah Classic Crest - Premium cardstock</li>
            <li>• HP Premium Photo Paper - For glossy finish</li>
            <li>• Epson Premium Matte - Great for matte finish</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
        <span className="text-sm font-medium text-brand-600">{number}</span>
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Professional Print Services Info
export function ProfessionalPrintInfo() {
  return (
    <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-500" />
          <CardTitle className="text-lg">Want Professional Printing?</CardTitle>
        </div>
        <CardDescription>
          Coming soon: Order professionally printed invitations delivered to your door
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-slate-500" />
            <span>Premium cardstock</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-slate-500" />
            <span>Multiple finishes</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-slate-500" />
            <span>Worldwide shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-slate-500" />
            <span>Bulk discounts</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" disabled>
          <Printer className="h-4 w-4 mr-2" />
          Coming Soon
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Join the waitlist to be notified when professional printing is available
        </p>
      </CardContent>
    </Card>
  );
}
