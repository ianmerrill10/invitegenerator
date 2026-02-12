"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Plus, Mail, Send, Users, AlertCircle } from "lucide-react";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailInviteFormProps {
  invitationTitle: string;
  invitationUrl: string;
  onSend: (recipients: EmailRecipient[], message: string) => Promise<void>;
  maxRecipients?: number;
  className?: string;
}

export function EmailInviteForm({
  invitationTitle,
  invitationUrl,
  onSend,
  maxRecipients = 50,
  className,
}: EmailInviteFormProps) {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addRecipient = () => {
    if (!emailInput.trim()) return;

    if (!validateEmail(emailInput)) {
      setError("Please enter a valid email address");
      return;
    }

    if (recipients.some((r) => r.email === emailInput.trim())) {
      setError("This email is already in the list");
      return;
    }

    if (recipients.length >= maxRecipients) {
      setError(`Maximum ${maxRecipients} recipients allowed`);
      return;
    }

    setRecipients([
      ...recipients,
      { email: emailInput.trim(), name: nameInput.trim() || undefined },
    ]);
    setEmailInput("");
    setNameInput("");
    setError(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r.email !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSend(recipients, customMessage);
      setRecipients([]);
      setCustomMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = (text: string) => {
    const emails = text.split(/[,;\n]/).map((e) => e.trim()).filter(Boolean);
    const validEmails: EmailRecipient[] = [];

    for (const email of emails) {
      if (validateEmail(email) && !recipients.some((r) => r.email === email)) {
        validEmails.push({ email });
      }
    }

    if (validEmails.length > 0) {
      const newRecipients = [...recipients, ...validEmails].slice(0, maxRecipients);
      setRecipients(newRecipients);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email Invitations
        </CardTitle>
        <CardDescription>
          Invite guests directly via email. They&apos;ll receive a beautiful invitation
          with a link to RSVP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add recipient form */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email" className="text-xs">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="guest@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-xs">
                Name (optional)
              </Label>
              <Input
                id="name"
                placeholder="Guest name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRecipient}
            disabled={!emailInput.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Recipient
          </Button>
        </div>

        {/* Error message */}
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {error}
            </div>
          )}
        </div>

        {/* Recipients list */}
        {recipients.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Recipients ({recipients.length}/{maxRecipients})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecipients([])}
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-auto p-2 border rounded-md bg-surface-50">
              {recipients.map((recipient) => (
                <Badge
                  key={recipient.email}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="truncate max-w-[150px]">
                    {recipient.name || recipient.email}
                  </span>
                  <button
                    onClick={() => removeRecipient(recipient.email)}
                    className="ml-1 hover:bg-surface-200 rounded p-0.5"
                    aria-label={`Remove ${recipient.name || recipient.email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bulk add */}
        <div className="space-y-2">
          <Label htmlFor="bulk-add" className="text-xs">Bulk Add (paste emails separated by commas)</Label>
          <Textarea
            id="bulk-add"
            placeholder="email1@example.com, email2@example.com..."
            className="h-20"
            onPaste={(e) => {
              e.preventDefault();
              handleBulkAdd(e.clipboardData.getData("text"));
            }}
          />
        </div>

        {/* Custom message */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-xs">
            Personal Message (optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Add a personal note to your invitation..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="h-24"
          />
        </div>

        {/* Send button */}
        <Button
          className="w-full"
          onClick={handleSend}
          disabled={recipients.length === 0 || isLoading}
        >
          {isLoading ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send to {recipients.length} {recipients.length === 1 ? "Guest" : "Guests"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Compact email list for showing sent invites
interface EmailListItemProps {
  email: string;
  name?: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced";
  sentAt: string;
}

export function EmailListItem({ email, name, status, sentAt }: EmailListItemProps) {
  const statusColors = {
    sent: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    opened: "bg-purple-100 text-purple-700",
    clicked: "bg-amber-100 text-amber-700",
    bounced: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{name || email}</p>
          {name && <p className="text-xs text-muted-foreground">{email}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs capitalize", statusColors[status])}>
          {status}
        </Badge>
        <span className="text-xs text-muted-foreground">{sentAt}</span>
      </div>
    </div>
  );
}
