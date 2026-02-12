"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  onUploadComplete: (url: string, file: UploadedFile) => void;
  maxSize?: number; // in bytes
  accept?: string[];
  className?: string;
}

interface UploadedFile {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ImageUpload({
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  className = "",
}: ImageUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploadStatus("uploading");
    setProgress(0);

    try {
      // Method 1: Direct upload (simpler, for smaller files)
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Upload failed");
      }

      setProgress(100);
      setUploadStatus("success");

      const uploadedFile: UploadedFile = {
        url: data.data.publicUrl,
        key: data.data.key,
        fileName: data.data.fileName,
        fileSize: data.data.fileSize,
        fileType: data.data.fileType,
      };

      onUploadComplete(data.data.publicUrl, uploadedFile);
      toast.success("Image uploaded successfully");

      // Reset after success
      setTimeout(() => {
        setUploadStatus("idle");
        setPreview(null);
        setProgress(0);
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Upload failed");

      setTimeout(() => {
        setUploadStatus("idle");
        setProgress(0);
      }, 2000);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await uploadFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- uploadFile is stable, depends only on onUploadComplete
    [maxSize, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {} as Record<string, string[]>
    ),
    maxSize,
    multiple: false,
    disabled: uploadStatus === "uploading",
  });

  const clearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setUploadStatus("idle");
    setProgress(0);
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200
          ${isDragActive && !isDragReject ? "border-brand-500 bg-brand-50" : ""}
          ${isDragReject ? "border-red-500 bg-red-50" : ""}
          ${!isDragActive && uploadStatus === "idle" ? "border-surface-300 hover:border-surface-400 bg-surface-50" : ""}
          ${uploadStatus === "uploading" ? "border-brand-400 bg-brand-50" : ""}
          ${uploadStatus === "success" ? "border-green-500 bg-green-50" : ""}
          ${uploadStatus === "error" ? "border-red-500 bg-red-50" : ""}
          cursor-pointer
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-video"
            >
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-contain"
              />
              {uploadStatus === "idle" && (
                <button
                  onClick={clearPreview}
                  className="absolute right-2 top-2 rounded-full bg-surface-900/80 p-1 text-white hover:bg-surface-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Upload Progress Overlay */}
              {uploadStatus === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-900/60">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <p className="mt-2 text-sm font-medium text-white">
                    Uploading... {progress}%
                  </p>
                </div>
              )}

              {/* Success Overlay */}
              {uploadStatus === "success" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-600/60">
                  <Check className="h-8 w-8 text-white" />
                  <p className="mt-2 text-sm font-medium text-white">Uploaded!</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center px-6 py-12"
            >
              <div
                className={`
                  mb-4 rounded-full p-3
                  ${isDragActive ? "bg-brand-100 text-brand-600" : "bg-surface-100 text-surface-500"}
                  ${isDragReject ? "bg-red-100 text-red-600" : ""}
                `}
              >
                {isDragReject ? (
                  <X className="h-8 w-8" />
                ) : isDragActive ? (
                  <Upload className="h-8 w-8" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>

              <p className="mb-1 text-sm font-medium text-surface-700">
                {isDragReject
                  ? "File type not supported"
                  : isDragActive
                    ? "Drop your image here"
                    : "Drag & drop an image"}
              </p>
              <p className="text-xs text-surface-500">
                or click to browse
              </p>
              <p className="mt-2 text-xs text-surface-400">
                Max size: {maxSize / 1024 / 1024}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        {uploadStatus === "uploading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-200">
            <motion.div
              className="h-full bg-brand-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for toolbar use
export function ImageUploadButton({
  onUploadComplete,
  className = "",
}: {
  onUploadComplete: (url: string, file: UploadedFile) => void;
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Upload failed");
      }

      onUploadComplete(data.data.publicUrl, {
        url: data.data.publicUrl,
        key: data.data.key,
        fileName: data.data.fileName,
        fileSize: data.data.fileSize,
        fileType: data.data.fileType,
      });

      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label className={className}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <Button variant="outline" size="sm" disabled={isUploading} asChild>
        <span>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload Image
        </span>
      </Button>
    </label>
  );
}
