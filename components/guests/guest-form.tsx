"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Guest } from "./guest-table";

const guestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  response: z.enum(["attending", "not_attending", "maybe", "pending"]),
  guestCount: z.number().min(1).max(10),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestFormProps {
  guest?: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GuestFormData) => Promise<void>;
}

export function GuestForm({
  guest,
  open,
  onOpenChange,
  onSubmit,
}: GuestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!guest;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: guest
      ? {
          name: guest.name,
          email: guest.email,
          response: guest.response,
          guestCount: guest.guestCount,
          dietaryRestrictions: guest.dietaryRestrictions || "",
          message: guest.message || "",
        }
      : {
          name: "",
          email: "",
          response: "pending",
          guestCount: 1,
          dietaryRestrictions: "",
          message: "",
        },
  });

  const handleFormSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting guest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Guest" : "Add Guest"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update guest information"
              : "Add a new guest to your invitation list"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Guest name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="guest@email.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="response-status">Response Status</Label>
              <Select
                value={watch("response")}
                onValueChange={(val) =>
                  setValue("response", val as GuestFormData["response"])
                }
              >
                <SelectTrigger id="response-status" aria-label="Response status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="attending">Attending</SelectItem>
                  <SelectItem value="not_attending">Not Attending</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-count">Guest Count</Label>
              <Select
                value={String(watch("guestCount"))}
                onValueChange={(val) => setValue("guestCount", parseInt(val))}
              >
                <SelectTrigger id="guest-count" aria-label="Guest count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dietary">Dietary Restrictions</Label>
            <Input
              id="dietary"
              {...register("dietaryRestrictions")}
              placeholder="e.g., Vegetarian, Gluten-free"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Notes</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Update Guest"
              ) : (
                "Add Guest"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Quick add guest form (inline)
interface QuickAddGuestProps {
  onAdd: (name: string, email: string) => Promise<void>;
  className?: string;
}

export function QuickAddGuest({ onAdd, className }: QuickAddGuestProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      await onAdd(name.trim(), email.trim());
      setName("");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
        aria-label="Guest name"
      />
      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        aria-label="Guest email"
      />
      <Button type="submit" disabled={isAdding}>
        {isAdding ? <Spinner className="h-4 w-4" /> : "Add"}
      </Button>
      <div aria-live="polite" aria-atomic="true">
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      </div>
    </form>
  );
}
