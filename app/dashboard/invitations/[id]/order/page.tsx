"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Package,
  Truck,
  CreditCard,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  Gift,
  Heart,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useInvitationStore } from "@/lib/stores";

// Product types from our config
interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  dimensions: { width: number; height: number; units: string };
  includesEnvelope: boolean;
  paperWeight: string;
  minQuantity: number;
  suggestedMarkup: number;
  isRecommended?: boolean;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice?: number;
}

interface Quote {
  shipmentMethod: string;
  retailSummary: {
    items: { amount: string; currency: string };
    shipping: { amount: string; currency: string };
    total: { amount: string; currency: string };
  };
}

const SHIPPING_OPTIONS = [
  { id: "Budget", name: "Budget", description: "7-14 business days", icon: Package },
  { id: "Standard", name: "Standard", description: "5-7 business days", icon: Truck },
  { id: "Express", name: "Express", description: "2-4 business days", icon: Truck },
];

export default function OrderPrintsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { currentInvitation, fetchInvitation } = useInvitationStore();

  // State
  const [step, setStep] = React.useState<"products" | "shipping" | "payment" | "confirmation">("products");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedShipping, setSelectedShipping] = React.useState("Standard");
  const [quote, setQuote] = React.useState<Quote | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [orderLoading, setOrderLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Shipping address
  const [shippingAddress, setShippingAddress] = React.useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // Load invitation and products
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await fetchInvitation(id);

        // Fetch products
        const eventType = currentInvitation?.eventType || "wedding";
        const res = await fetch(`/api/prodigi/products?eventType=${eventType}`);
        const data = await res.json();

        if (data.success) {
          setProducts(data.data.products);

          // Auto-add invitation to cart if recommended
          const invitationProduct = data.data.products.find(
            (p: Product) => p.id === "invitation"
          );
          if (invitationProduct) {
            setCart([
              {
                productId: "invitation",
                product: invitationProduct,
                quantity: invitationProduct.minQuantity,
              },
            ]);
          }
        }
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchInvitation, currentInvitation?.eventType]);

  // Update quote when cart or shipping changes
  React.useEffect(() => {
    const getQuote = async () => {
      if (cart.length === 0 || !shippingAddress.country) return;

      setQuoteLoading(true);
      try {
        const res = await fetch("/api/prodigi/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            countryCode: shippingAddress.country,
            shippingMethod: selectedShipping,
          }),
        });

        const data = await res.json();
        if (data.success && data.data.quotes.length > 0) {
          setQuote(data.data.quotes[0]);
        }
      } catch (err) {
        console.error("Quote error:", err);
      } finally {
        setQuoteLoading(false);
      }
    };

    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [cart, shippingAddress.country, selectedShipping]);

  // Cart functions
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + product.minQuantity);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          product,
          quantity: product.minQuantity,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;

    const minQty = item.product.minQuantity;
    const newQty = Math.max(minQty, quantity);

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city) {
      setError("Please fill in all required shipping fields");
      return;
    }

    setOrderLoading(true);
    setError(null);

    try {
      // For now, we'll need an image URL - in production this would be generated from the canvas
      // TODO: Implement canvas-to-image export for print-ready files
      const imageUrl = currentInvitation?.designData?.backgroundImage ||
        "https://placehold.co/1748x1748/D4919F/white?text=Invitation+Preview";

      const res = await fetch("/api/prodigi/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            imageUrl,
            customerPrice: quote?.retailSummary?.items
              ? parseFloat(quote.retailSummary.items.amount) / cart.length
              : undefined,
          })),
          recipient: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
          },
          shippingMethod: selectedShipping,
          merchantReference: `INV-${id}-${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("confirmation");
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/invitations/${id}/edit`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-surface-900">Order Prints</h1>
                <p className="text-xs text-surface-500">{currentInvitation?.title}</p>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-surface-500" />
                <Badge variant="primary">{cartTotal} items</Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { id: "products", label: "Select Products", icon: Package },
              { id: "shipping", label: "Shipping", icon: Truck },
              { id: "payment", label: "Review & Pay", icon: CreditCard },
              { id: "confirmation", label: "Confirmation", icon: CheckCircle },
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                    step === s.id
                      ? "bg-brand-500 text-white"
                      : ["products", "shipping", "payment", "confirmation"].indexOf(step) >
                        ["products", "shipping", "payment", "confirmation"].indexOf(s.id)
                      ? "bg-brand-100 text-brand-700"
                      : "bg-surface-100 text-surface-500"
                  )}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < 3 && <ChevronRight className="h-4 w-4 text-surface-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-error-500" />
            <p className="text-error-700">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Select Products */}
          {step === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Products */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                    Choose Your Products
                  </h2>
                  <p className="text-surface-600">
                    Select the items you'd like to print for your event
                  </p>
                </div>

                {/* Recommended Products */}
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-brand-500" />
                    Recommended for your {currentInvitation?.eventType || "event"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {products
                      .filter((p) => p.isRecommended)
                      .map((product) => {
                        const inCart = cart.find((i) => i.productId === product.id);
                        return (
                          <Card
                            key={product.id}
                            className={cn(
                              "transition-all cursor-pointer",
                              inCart
                                ? "border-brand-500 bg-brand-50"
                                : "hover:border-surface-300"
                            )}
                            onClick={() => !inCart && addToCart(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-surface-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-surface-500">
                                    {product.description}
                                  </p>
                                </div>
                                {inCart && (
                                  <CheckCircle className="h-5 w-5 text-brand-500" />
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="secondary">
                                  {product.dimensions.width}x{product.dimensions.height}
                                  {product.dimensions.units}
                                </Badge>
                                {product.includesEnvelope && (
                                  <Badge variant="secondary">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Envelope included
                                  </Badge>
                                )}
                              </div>
                              {!inCart && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-3"
                                  leftIcon={<Plus className="h-4 w-4" />}
                                >
                                  Add to Order
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* Other Products */}
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-2">
                    <Gift className="h-4 w-4 text-accent-500" />
                    More Options
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {products
                      .filter((p) => !p.isRecommended)
                      .slice(0, 6)
                      .map((product) => {
                        const inCart = cart.find((i) => i.productId === product.id);
                        return (
                          <Card
                            key={product.id}
                            className={cn(
                              "transition-all cursor-pointer",
                              inCart
                                ? "border-brand-500 bg-brand-50"
                                : "hover:border-surface-300"
                            )}
                            onClick={() => !inCart && addToCart(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-surface-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-surface-500">
                                    {product.description}
                                  </p>
                                </div>
                                {inCart ? (
                                  <CheckCircle className="h-4 w-4 text-brand-500" />
                                ) : (
                                  <Plus className="h-4 w-4 text-surface-400" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Your Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-surface-500 text-center py-4">
                        No items in your order yet
                      </p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between py-2 border-b border-surface-100"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-surface-900 text-sm">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-surface-500">
                                Min: {item.product.minQuantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - item.product.minQuantity
                                  )
                                }
                                className="h-7 w-7 rounded border border-surface-200 flex items-center justify-center hover:bg-surface-50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + item.product.minQuantity
                                  )
                                }
                                className="h-7 w-7 rounded border border-surface-200 flex items-center justify-center hover:bg-surface-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-surface-400 hover:text-error-500 ml-2"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}

                        {quoteLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                          </div>
                        ) : quote ? (
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-surface-600">Subtotal</span>
                              <span className="font-medium">
                                ${quote.retailSummary.items.amount}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-surface-600">Shipping</span>
                              <span className="font-medium">
                                ${quote.retailSummary.shipping.amount}
                              </span>
                            </div>
                            <div className="flex justify-between text-base pt-2 border-t border-surface-200">
                              <span className="font-semibold">Total</span>
                              <span className="font-bold text-brand-600">
                                ${quote.retailSummary.total.amount}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => setStep("shipping")}
                          disabled={cart.length === 0}
                        >
                          Continue to Shipping
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 2: Shipping */}
          {step === "shipping" && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                    Shipping Details
                  </h2>
                  <p className="text-surface-600">
                    Where should we send your prints?
                  </p>
                </div>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                          Full Name *
                        </label>
                        <Input
                          value={shippingAddress.name}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, name: e.target.value })
                          }
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, email: e.target.value })
                          }
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-surface-700 mb-1 block">
                        Address Line 1 *
                      </label>
                      <Input
                        value={shippingAddress.line1}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, line1: e.target.value })
                        }
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-surface-700 mb-1 block">
                        Address Line 2
                      </label>
                      <Input
                        value={shippingAddress.line2}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, line2: e.target.value })
                        }
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                          City *
                        </label>
                        <Input
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, city: e.target.value })
                          }
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                          State
                        </label>
                        <Input
                          value={shippingAddress.state}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, state: e.target.value })
                          }
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                          Postal Code *
                        </label>
                        <Input
                          value={shippingAddress.postalCode}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-surface-700 mb-1 block">
                        Country
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, country: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SHIPPING_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedShipping(option.id)}
                          className={cn(
                            "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-4",
                            selectedShipping === option.id
                              ? "border-brand-500 bg-brand-50"
                              : "border-surface-200 hover:border-surface-300"
                          )}
                        >
                          <option.icon
                            className={cn(
                              "h-5 w-5",
                              selectedShipping === option.id
                                ? "text-brand-500"
                                : "text-surface-400"
                            )}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-surface-900">{option.name}</p>
                            <p className="text-sm text-surface-500">{option.description}</p>
                          </div>
                          {selectedShipping === option.id && (
                            <CheckCircle className="h-5 w-5 text-brand-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("products")}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep("payment")}>
                    Continue to Review
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-surface-600">
                          {item.product.name} × {item.quantity}
                        </span>
                      </div>
                    ))}

                    {quote && (
                      <div className="space-y-2 pt-4 border-t border-surface-200">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>${quote.retailSummary.items.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shipping ({selectedShipping})</span>
                          <span>${quote.retailSummary.shipping.amount}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total</span>
                          <span className="text-brand-600">
                            ${quote.retailSummary.total.amount}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Pay */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-2">
                  Review Your Order
                </h2>
                <p className="text-surface-600">
                  Please review your order details before placing
                </p>
              </div>

              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-surface-900 mb-3">Items</h3>
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between py-2 border-b border-surface-100"
                      >
                        <span>
                          {item.product.name} × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  <div>
                    <h3 className="font-semibold text-surface-900 mb-3">
                      Shipping To
                    </h3>
                    <p className="text-surface-600">
                      {shippingAddress.name}
                      <br />
                      {shippingAddress.line1}
                      {shippingAddress.line2 && <br />}
                      {shippingAddress.line2}
                      <br />
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postalCode}
                      <br />
                      {shippingAddress.country}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {selectedShipping} Shipping
                    </Badge>
                  </div>

                  {/* Total */}
                  {quote && (
                    <div className="pt-4 border-t border-surface-200">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-brand-600">
                          ${quote.retailSummary.total.amount}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-surface-50 p-4 rounded-lg text-sm text-surface-600">
                    <p>
                      By placing this order, you agree to our Terms of Service.
                      Your prints will be produced and shipped by our print
                      partner Prodigi.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("shipping")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitOrder}
                      loading={orderLoading}
                      className="flex-1"
                    >
                      Place Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-12"
            >
              <div className="h-20 w-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-success-500" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-surface-900 mb-3">
                Order Placed Successfully!
              </h2>
              <p className="text-surface-600 mb-8">
                Your prints are being prepared. You'll receive an email with
                tracking information once your order ships.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`/dashboard/invitations/${id}`}>
                  <Button variant="outline">Back to Invitation</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
