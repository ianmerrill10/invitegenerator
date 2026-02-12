"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  Check,
  X,
  Wand2,
  Image as ImageIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BackgroundRemovalProps {
  onComplete: (processedUrl: string) => void;
  className?: string;
}

type ProcessingStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function BackgroundRemoval({ onComplete, className = "" }: BackgroundRemovalProps) {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processImage = async (file: File) => {
    setStatus("processing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Background removal failed");
      }

      setProcessedPreview(data.data.processedUrl);
      setStatus("success");
      toast.success("Background removed successfully");
    } catch (error) {
      console.error("Background removal error:", error);
      setStatus("error");
      toast.error(error instanceof Error ? error.message : "Processing failed");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setProcessedPreview(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process the image
    await processImage(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: status === "processing",
  });

  const handleRetry = async () => {
    if (selectedFile) {
      setProcessedPreview(null);
      await processImage(selectedFile);
    }
  };

  const handleUseProcessed = () => {
    if (processedPreview) {
      onComplete(processedPreview);
      handleReset();
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setOriginalPreview(null);
    setProcessedPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-3">
        <Wand2 className="h-5 w-5 text-brand-500" />
        <div>
          <h3 className="text-sm font-medium text-surface-800">Background Removal</h3>
          <p className="text-xs text-surface-500">AI-powered background removal</p>
        </div>
      </div>

      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {status === "idle" && !originalPreview && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                {...getRootProps()}
                className={`
                  flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8
                  transition-colors
                  ${isDragActive
                    ? "border-brand-500 bg-brand-50"
                    : "border-surface-300 hover:border-brand-400 hover:bg-surface-50"
                  }
                `}
              >
                <input {...getInputProps()} />
                <ImageIcon className="mb-3 h-10 w-10 text-surface-400" />
                <p className="mb-1 text-sm font-medium text-surface-700">
                  {isDragActive ? "Drop image here" : "Drop an image to remove background"}
                </p>
                <p className="text-xs text-surface-500">or click to browse</p>
                <p className="mt-2 text-xs text-surface-400">
                  Supports JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            </motion.div>
          )}

          {(originalPreview || processedPreview) && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Before/After Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-surface-500">Original</span>
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-surface-200 bg-[url('/checkerboard.svg')] bg-repeat">
                    {originalPreview && (
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Processed */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-surface-500">Processed</span>
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-surface-200 bg-[url('/checkerboard.svg')] bg-repeat">
                    {status === "processing" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-900/60">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="mt-2 text-sm text-white">Removing background...</p>
                      </div>
                    )}
                    {processedPreview && (
                      <img
                        src={processedPreview}
                        alt="Processed"
                        className="h-full w-full object-contain"
                      />
                    )}
                    {status === "error" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20">
                        <X className="h-8 w-8 text-red-500" />
                        <p className="mt-2 text-sm text-red-600">Processing failed</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>

                {status === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Retry
                  </Button>
                )}

                {status === "success" && processedPreview && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUseProcessed}
                    className="flex-1"
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Use Image
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="border-t border-surface-200 px-4 py-3">
        <p className="text-xs text-surface-500">
          <strong>Tip:</strong> Works best with high-contrast images and solid backgrounds.
          For complex images, results may vary.
        </p>
      </div>
    </div>
  );
}

// Compact button version for toolbar
export function BackgroundRemovalButton({
  imageUrl,
  onComplete,
}: {
  imageUrl: string;
  onComplete: (processedUrl: string) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("imageUrl", imageUrl);

      const response = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Background removal failed");
      }

      onComplete(data.data.processedUrl);
      toast.success("Background removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRemoveBackground}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-1.5 h-4 w-4" />
      )}
      Remove Background
    </Button>
  );
}
