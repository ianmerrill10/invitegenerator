"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: plan ? `Inquiry about ${plan} plan` : "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to send message");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 to-surface-50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-surface-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-surface-600 max-w-2xl mx-auto">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-heading font-bold text-surface-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900">Email</h3>
                      <p className="text-surface-600">support@invitegenerator.com</p>
                      <p className="text-surface-600">sales@invitegenerator.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900">Phone</h3>
                      <p className="text-surface-600">+1 (555) 123-4567</p>
                      <p className="text-surface-500 text-sm">Mon-Fri 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900">Office</h3>
                      <p className="text-surface-600">
                        123 Innovation Way<br />
                        San Francisco, CA 94105<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-10 pt-10 border-t border-surface-200">
                  <h3 className="font-semibold text-surface-900 mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/help" className="text-brand-600 hover:text-brand-700">
                        Help Center & FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-brand-600 hover:text-brand-700">
                        Pricing Plans
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-brand-600 hover:text-brand-700">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-brand-600 hover:text-brand-700">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-surface-900 mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-surface-600 mb-6">
                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {error}
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="company">Company (Optional)</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          >
                            <option value="">Select a subject</option>
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Sales Question">Sales Question</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Billing Question">Billing Question</option>
                            <option value="Partnership Opportunity">Partnership Opportunity</option>
                            <option value="Enterprise Plan">Enterprise Plan</option>
                            <option value="Feature Request">Feature Request</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          rows={6}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-surface-500">
                          * Required fields
                        </p>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="bg-brand-50 rounded-xl p-6">
                    <h3 className="font-semibold text-surface-900 mb-2">
                      For Sales Inquiries
                    </h3>
                    <p className="text-surface-600 text-sm mb-4">
                      Looking for enterprise solutions or volume pricing? Our sales team is here to help.
                    </p>
                    <a
                      href="mailto:sales@invitegenerator.com"
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                    >
                      sales@invitegenerator.com
                    </a>
                  </div>

                  <div className="bg-accent-50 rounded-xl p-6">
                    <h3 className="font-semibold text-surface-900 mb-2">
                      For Technical Support
                    </h3>
                    <p className="text-surface-600 text-sm mb-4">
                      Need help with your account or experiencing issues? Check our help center first.
                    </p>
                    <Link
                      href="/help"
                      className="text-accent-600 hover:text-accent-700 font-medium text-sm"
                    >
                      Visit Help Center →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
