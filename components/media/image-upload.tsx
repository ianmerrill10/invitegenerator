"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in MB
  aspectRatio?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  accept = "image/*",
  maxSize = 5,
  aspectRatio,
  placeholder = "Click or drag to upload",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith("image/")) {
        return "Please upload an image file";
      }
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`;
      }
      return null;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress if no custom upload function
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        let url: string;
        if (onUpload) {
          url = await onUpload(file);
        } else {
          // Create object URL for preview
          url = URL.createObjectURL(file);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        onChange?.(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile, onUpload, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors overflow-hidden",
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          !value && !isUploading && "hover:border-primary/50 hover:bg-surface-50"
        )}
        style={{ aspectRatio: aspectRatio || "auto" }}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
      >
        {value ? (
          // Preview
          <div className="relative w-full h-full min-h-[120px]">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : isUploading ? (
          // Upload Progress
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium mb-2">Uploading...</p>
            <Progress value={uploadProgress} className="w-48" />
          </div>
        ) : (
          // Upload Area
          <label
            className={cn(
              "flex flex-col items-center justify-center p-8 cursor-pointer text-center min-h-[120px]",
              disabled && "cursor-not-allowed"
            )}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to {maxSize}MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              disabled={disabled}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// Multiple image upload
interface MultiImageUploadProps {
  values?: string[];
  onChange?: (urls: string[]) => void;
  onUpload?: (file: File) => Promise<string>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function MultiImageUpload({
  values = [],
  onChange,
  onUpload,
  maxFiles = 10,
  maxSize = 5,
  disabled = false,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (values.length + files.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setError(null);
      setIsUploading(true);
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxSize * 1024 * 1024) continue;

        try {
          const url = onUpload
            ? await onUpload(file)
            : URL.createObjectURL(file);
          newUrls.push(url);
        } catch {
          // Skip failed uploads
        }
      }

      setIsUploading(false);
      onChange?.([...values, ...newUrls]);
    },
    [values, maxFiles, maxSize, onUpload, onChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newValues = [...values];
      newValues.splice(index, 1);
      onChange?.(newValues);
    },
    [values, onChange]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {values.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {values.length < maxFiles && (
        <label
          className={cn(
            "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-surface-50",
            isUploading && "opacity-50 pointer-events-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Add images"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={disabled || isUploading}
            className="sr-only"
          />
        </label>
      )}

      {/* Counter & Error */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {values.length} / {maxFiles} images
        </span>
        {error && (
          <span className="text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
