"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Printer,
  Package,
  Truck,
  CreditCard,
  Loader2,
  Check,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Invitation } from "@/types";

interface PrintOrderProps {
  invitation: Invitation;
  onOrderComplete?: (orderId: string) => void;
}

const CARD_TYPES = [
  {
    id: "flat",
    label: "Flat Cards",
    description: "Single-sided printed cards",
    popular: true,
  },
  {
    id: "folded",
    label: "Folded Cards",
    description: "Folded with blank inside, includes envelope",
    popular: false,
  },
  {
    id: "premium",
    label: "Premium Cards",
    description: "Thick 350gsm cardstock",
    popular: false,
  },
  {
    id: "postcard",
    label: "Postcards",
    description: "Postcard format, no envelope",
    popular: false,
  },
];

const SIZES = [
  { id: "4x6", label: "4×6 inches", available: ["flat", "postcard", "premium"] },
  { id: "5x7", label: "5×7 inches", available: ["flat", "folded", "premium"] },
  { id: "a6", label: "A6", available: ["flat", "folded", "postcard"] },
  { id: "a5", label: "A5", available: ["flat"] },
];

const FINISHES = [
  { id: "matte", label: "Matte", description: "Smooth, non-reflective finish" },
  { id: "gloss", label: "Gloss", description: "Shiny, vibrant finish" },
  { id: "luster", label: "Luster", description: "Semi-gloss, professional look" },
];

const QUANTITIES = [10, 25, 50, 75, 100, 150, 200, 250];

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", days: "5-7 business days" },
  { id: "express", label: "Express", days: "2-3 business days" },
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
];

interface ShippingAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export function PrintOrder({ invitation, onOrderComplete }: PrintOrderProps) {
  const [step, setStep] = useState<"product" | "shipping" | "review">("product");
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<{
    unitPrice: number;
    subtotal: number;
    shipping: number;
    total: number;
    estimatedDelivery: string;
  } | null>(null);

  // Product options
  const [cardType, setCardType] = useState("flat");
  const [size, setSize] = useState("5x7");
  const [finish, setFinish] = useState("matte");
  const [quantity, setQuantity] = useState(25);
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Shipping address
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
    email: "",
  });

  const availableSizes = SIZES.filter((s) => s.available.includes(cardType));

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/print/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          size,
          quantity,
          cardType,
          finish,
          shippingCountry: address.country,
          shippingMethod,
        }),
      });

      if (!response.ok) throw new Error("Failed to get quote");

      const data = await response.json();
      if (data.success) {
        setQuote(data.data);
      }
    } catch (error) {
      console.error("Quote error:", error);
      toast.error("Failed to get price quote");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (step === "product") {
      await fetchQuote();
      setStep("shipping");
    } else if (step === "shipping") {
      // Validate address
      if (!address.name || !address.line1 || !address.city || !address.postalCode) {
        toast.error("Please fill in all required address fields");
        return;
      }
      await fetchQuote(); // Refresh quote with final shipping
      setStep("review");
    }
  };

  const handleOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/print/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          size,
          quantity,
          cardType,
          finish,
          shippingMethod,
          shippingAddress: address,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      if (data.success && data.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className={`flex items-center gap-1 ${step === "product" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <Package className="h-4 w-4" />
          <span>Product</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-1 ${step === "shipping" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <Truck className="h-4 w-4" />
          <span>Shipping</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-1 ${step === "review" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <CreditCard className="h-4 w-4" />
          <span>Payment</span>
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {step === "product" && (
        <div className="space-y-6">
          {/* Card Type */}
          <div className="space-y-3">
            <Label>Card Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {CARD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCardType(type.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    cardType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-surface-200 hover:border-surface-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{type.label}</span>
                    {type.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  {cardType === type.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <Label>Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Finish */}
          <div className="space-y-3">
            <Label>Finish</Label>
            <Select value={finish} onValueChange={setFinish}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FINISHES.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <div>
                      <span>{f.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {f.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <Label>Quantity</Label>
            <Select value={quantity.toString()} onValueChange={(v) => setQuantity(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITIES.map((q) => (
                  <SelectItem key={q} value={q.toString()}>
                    {q} cards
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Bulk discounts available at 25+, 50+, and 100+ cards
            </p>
          </div>

          {/* Country (for initial quote) */}
          <div className="space-y-3">
            <Label>Ship To</Label>
            <Select value={address.country} onValueChange={(v) => setAddress({ ...address, country: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleNextStep} className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              <>
                Continue to Shipping
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Shipping Address */}
      {step === "shipping" && (
        <div className="space-y-6">
          {/* Quote Summary */}
          {quote && (
            <Card className="bg-surface-50">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {quantity}× {CARD_TYPES.find((t) => t.id === cardType)?.label} ({size})
                  </span>
                  <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Method */}
          <div className="space-y-3">
            <Label>Shipping Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {SHIPPING_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setShippingMethod(method.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    shippingMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-surface-200 hover:border-surface-300"
                  }`}
                >
                  <span className="font-medium text-sm">{method.label}</span>
                  <p className="text-xs text-muted-foreground">{method.days}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Address Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Delivery Address</Label>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={address.country}
                    onValueChange={(v) => setAddress({ ...address, country: v })}
                  >
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (for tracking updates)</Label>
                <Input
                  id="email"
                  type="email"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone (for delivery)</Label>
                <Input
                  id="phone"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+1 555-123-4567"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("product")} className="flex-1">
              Back
            </Button>
            <Button onClick={handleNextStep} className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Review Order"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === "review" && quote && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {CARD_TYPES.find((t) => t.id === cardType)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {size} • {finish} finish • {quantity} cards
                  </p>
                </div>
                <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
              </div>

              <Separator />

              {/* Shipping */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label} Shipping
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quote.estimatedDelivery}
                  </p>
                </div>
                <span className="font-medium">${quote.shipping.toFixed(2)}</span>
              </div>

              <Separator />

              {/* Delivery Address */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Deliver to:</p>
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-muted-foreground">
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {COUNTRIES.find((c) => c.code === address.country)?.name}
                </p>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${quote.total.toFixed(2)} USD</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("shipping")} className="flex-1">
              Back
            </Button>
            <Button onClick={handleOrder} className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${quote.total.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to Stripe for secure payment
          </p>
        </div>
      )}
    </div>
  );
}

// Coming Soon component for print ordering
export function PrintOrderComingSoon() {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Printer className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Professional Printing Coming Soon</CardTitle>
        <CardDescription>
          Order professionally printed invitations delivered to your door
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
          In the meantime, download your invitation and print at home or at a local print shop
        </p>
      </CardContent>
    </Card>
  );
}
