"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Download,
} from "lucide-react";

interface ParsedGuest {
  name: string;
  email: string;
  valid: boolean;
  error?: string;
}

interface GuestImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (guests: { name: string; email: string }[]) => Promise<void>;
  maxGuests?: number;
}

export function GuestImport({
  open,
  onOpenChange,
  onImport,
  maxGuests = 500,
}: GuestImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const parseCSV = useCallback((content: string): ParsedGuest[] => {
    const lines = content.trim().split(/\r?\n/);
    const guests: ParsedGuest[] = [];

    // Skip header if it looks like one
    const startIndex = lines[0]?.toLowerCase().includes("name") ? 1 : 0;

    for (let i = startIndex; i < lines.length && guests.length < maxGuests; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV with quotes and commas
      const parts = line.match(/(?:\"([^\"]*)\"|([^,]+))/g);
      if (!parts || parts.length < 2) {
        guests.push({
          name: line,
          email: "",
          valid: false,
          error: "Invalid format - expected name,email",
        });
        continue;
      }

      const name = parts[0].replace(/"/g, "").trim();
      const email = parts[1].replace(/"/g, "").trim();

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(email);

      guests.push({
        name,
        email,
        valid: !!name && isValidEmail,
        error: !name
          ? "Name is required"
          : !isValidEmail
          ? "Invalid email format"
          : undefined,
      });
    }

    return guests;
  }, [maxGuests]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      // 1MB limit
      setError("File size must be less than 1MB");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setParsedGuests(parsed);
      setStep("preview");
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    const validGuests = parsedGuests.filter((g) => g.valid);
    if (validGuests.length === 0) {
      setError("No valid guests to import");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(validGuests.map(({ name, email }) => ({ name, email })));
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import guests");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedGuests([]);
    setError(null);
    setStep("upload");
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const template = "Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest-list-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedGuests.filter((g) => g.valid).length;
  const invalidCount = parsedGuests.filter((g) => !g.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Guests</DialogTitle>
          <DialogDescription>
            Upload a CSV file with guest names and emails
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                "hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Drop your CSV file here</p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg">
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download our CSV template to get started
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            {/* Format Info */}
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV Format:</p>
              <code className="bg-surface-100 dark:bg-surface-900 px-2 py-1 rounded">
                Name,Email
              </code>
              <p className="mt-1">Maximum {maxGuests} guests per import</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {validCount} valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="error" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {invalidCount} invalid
                </Badge>
              )}
            </div>

            {/* Preview List */}
            <div className="max-h-64 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 dark:bg-surface-900 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedGuests.map((guest, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-t",
                        !guest.valid && "bg-destructive/5"
                      )}
                    >
                      <td className="px-3 py-2">
                        {guest.valid ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </td>
                      <td className="px-3 py-2">{guest.name || "-"}</td>
                      <td className="px-3 py-2">
                        <div>
                          {guest.email || "-"}
                          {guest.error && (
                            <p className="text-xs text-destructive">
                              {guest.error}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("upload");
                setFile(null);
                setParsedGuests([]);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Choose different file
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === "preview" && (
            <Button
              onClick={handleImport}
              disabled={isImporting || validCount === 0}
            >
              {isImporting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {validCount} Guests
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
