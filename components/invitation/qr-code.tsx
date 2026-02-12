"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, QrCode as QrCodeIcon } from "lucide-react";

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

export function QRCode({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  includeMargin = true,
  className,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import of qrcode library
    const generateQR = async () => {
      try {
        const QRCodeLib = (await import("qrcode")).default;
        const canvas = canvasRef.current;
        if (canvas) {
          await QRCodeLib.toCanvas(canvas, value, {
            width: size,
            margin: includeMargin ? 2 : 0,
            color: {
              dark: fgColor,
              light: bgColor,
            },
          });
          setQrLoaded(true);
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        // Fallback: show placeholder
        setQrLoaded(false);
      }
    };

    generateQR();
  }, [value, size, bgColor, fgColor, includeMargin]);

  return (
    <div className={cn("inline-block", className)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={cn(
          "rounded-lg",
          !qrLoaded && "bg-surface-100 animate-pulse"
        )}
      />
      {!qrLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <QrCodeIcon className="h-12 w-12 text-surface-300" />
        </div>
      )}
    </div>
  );
}

// QR Code with download options
interface QRCodeDownloadProps {
  value: string;
  title?: string;
  className?: string;
}

export function QRCodeDownload({ value, title, className }: QRCodeDownloadProps) {
  const [size, setSize] = useState<string>("256");
  const [format, setFormat] = useState<string>("png");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");

  const handleDownload = async () => {
    try {
      const QRCodeLib = (await import("qrcode")).default;
      const dataUrl = await QRCodeLib.toDataURL(value, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      const link = document.createElement("a");
      link.download = `${title || "qrcode"}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-center">
          <QRCode
            value={value}
            size={200}
            bgColor={bgColor}
            fgColor={fgColor}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128px</SelectItem>
                <SelectItem value="256">256px</SelectItem>
                <SelectItem value="512">512px</SelectItem>
                <SelectItem value="1024">1024px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-8 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <span className="text-xs font-mono">{bgColor}</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Foreground</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <span className="text-xs font-mono">{fgColor}</span>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}

// Simple QR display for public views
interface QRCodeSimpleProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
}

export function QRCodeSimple({
  value,
  size = 120,
  label,
  className,
}: QRCodeSimpleProps) {
  return (
    <div className={cn("text-center", className)}>
      <QRCode value={value} size={size} />
      {label && (
        <p className="text-xs text-muted-foreground mt-2">{label}</p>
      )}
    </div>
  );
}
