"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gift,
  DollarSign,
  TrendingUp,
  Users,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const benefits = [
  "30-50% recurring commission",
  "12-36 months of recurring revenue",
  "90-day cookie duration",
  "$50 low payout threshold",
  "Weekly payouts",
  "Real-time analytics dashboard",
  "Promotional materials included",
  "Dedicated affiliate support",
];

export default function AffiliateJoinPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    instagram: "",
    twitter: "",
    youtube: "",
    audience: "",
    promotionPlan: "",
    monthlyTraffic: "",
    niche: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/affiliates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          socialMedia: {
            instagram: formData.instagram || undefined,
            twitter: formData.twitter || undefined,
            youtube: formData.youtube || undefined,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("success");
        toast.success("Application submitted successfully!");
      } else {
        toast.error(data.error?.message || "Failed to submit application");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left side - Benefits */}
              <div className="lg:col-span-2">
                <div className="sticky top-32">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6">
                    <Gift className="w-4 h-4" />
                    Free to Join
                  </div>

                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-4">
                    Join Our Partner Program
                  </h1>

                  <p className="text-lg text-surface-600 mb-8">
                    Start earning up to 50% recurring commission for every customer you refer.
                  </p>

                  <div className="space-y-4">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="text-surface-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-8 pt-8 border-t border-surface-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 mx-auto text-brand-500 mb-2" />
                        <p className="text-2xl font-bold text-surface-900">$500k+</p>
                        <p className="text-xs text-surface-500">Paid Out</p>
                      </div>
                      <div className="text-center">
                        <Users className="w-6 h-6 mx-auto text-brand-500 mb-2" />
                        <p className="text-2xl font-bold text-surface-900">2,500+</p>
                        <p className="text-xs text-surface-500">Partners</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-brand-500 mb-2" />
                        <p className="text-2xl font-bold text-surface-900">50%</p>
                        <p className="text-xs text-surface-500">Max Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="lg:col-span-3">
                {step === "form" ? (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="font-heading text-2xl font-bold text-surface-900 mb-6">
                      Apply to Become a Partner
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      {/* Website & Socials */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Website (optional)
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Instagram
                          </label>
                          <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Twitter/X
                          </label>
                          <input
                            type="text"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            YouTube
                          </label>
                          <input
                            type="text"
                            name="youtube"
                            value={formData.youtube}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Channel URL"
                          />
                        </div>
                      </div>

                      {/* Niche & Traffic */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Your Niche *
                          </label>
                          <select
                            name="niche"
                            value={formData.niche}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          >
                            <option value="">Select your niche</option>
                            <option value="wedding">Wedding & Bridal</option>
                            <option value="events">Event Planning</option>
                            <option value="design">Design & DIY</option>
                            <option value="parenting">Parenting & Family</option>
                            <option value="marketing">Marketing & Business</option>
                            <option value="lifestyle">Lifestyle & Social</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Monthly Traffic/Reach
                          </label>
                          <select
                            name="monthlyTraffic"
                            value={formData.monthlyTraffic}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          >
                            <option value="">Select range</option>
                            <option value="<1000">Less than 1,000</option>
                            <option value="1000-10000">1,000 - 10,000</option>
                            <option value="10000-50000">10,000 - 50,000</option>
                            <option value="50000-100000">50,000 - 100,000</option>
                            <option value="100000+">100,000+</option>
                          </select>
                        </div>
                      </div>

                      {/* Audience Description */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Describe Your Audience *
                        </label>
                        <textarea
                          name="audience"
                          value={formData.audience}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="Tell us about your audience demographics, interests, and engagement..."
                        />
                      </div>

                      {/* Promotion Plan */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          How Will You Promote InviteGenerator? *
                        </label>
                        <textarea
                          name="promotionPlan"
                          value={formData.promotionPlan}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="Describe how you plan to promote InviteGenerator to your audience..."
                        />
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="mt-1 w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                        />
                        <label htmlFor="terms" className="text-sm text-surface-600">
                          I agree to the{" "}
                          <Link href="/affiliates/terms" className="text-brand-600 hover:underline">
                            Affiliate Terms & Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-brand-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <Button type="submit" size="lg" fullWidth disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-center text-sm text-surface-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-brand-600 hover:underline">
                          Log in
                        </Link>{" "}
                        to access your affiliate dashboard.
                      </p>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                      Application Submitted!
                    </h2>

                    <p className="text-surface-600 mb-8 max-w-md mx-auto">
                      Thank you for applying to the InviteGenerator Partner Program. We&apos;ll review your application and get back to you within 24-48 hours.
                    </p>

                    <div className="bg-surface-50 rounded-xl p-6 mb-8">
                      <h3 className="font-semibold text-surface-900 mb-2">What&apos;s Next?</h3>
                      <ul className="text-left text-sm text-surface-600 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          We&apos;ll review your application within 24-48 hours
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          You&apos;ll receive an email with your approval status
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Once approved, you can start earning immediately
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => router.push("/")} variant="outline">
                        Back to Home
                      </Button>
                      <Button onClick={() => router.push("/affiliates")}>
                        Learn More About the Program
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
