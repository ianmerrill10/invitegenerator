import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "InviteGenerator Privacy Policy - Learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 16, 2025";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-surface-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-surface-600 mb-8">
              Last updated: {lastUpdated}
            </p>

            <div className="prose prose-surface max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  1. Introduction
                </h2>
                <p className="text-surface-700 mb-4">
                  Welcome to InviteGenerator (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services at invitegenerator.com (the &ldquo;Service&rdquo;).
                </p>
                <p className="text-surface-700">
                  By using our Service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  2.1 Personal Information
                </h3>
                <p className="text-surface-700 mb-4">
                  When you create an account or use our services, we may collect:
                </p>
                <ul className="list-disc list-inside text-surface-700 mb-4 space-y-2">
                  <li>Name and email address</li>
                  <li>Account credentials (password is securely hashed)</li>
                  <li>Profile information you choose to provide</li>
                  <li>Payment information (processed securely by Stripe)</li>
                  <li>Event details you enter for invitations</li>
                </ul>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  2.2 Automatically Collected Information
                </h3>
                <p className="text-surface-700 mb-4">
                  When you access our Service, we automatically collect:
                </p>
                <ul className="list-disc list-inside text-surface-700 mb-4 space-y-2">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and approximate location</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  2.3 Guest Information
                </h3>
                <p className="text-surface-700">
                  When guests RSVP to invitations, we collect the information they provide (name, email, attendance status, dietary preferences, etc.) on behalf of the invitation host.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-surface-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Communicate with you about products, services, and events</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent or illegal activities</li>
                  <li>Personalize and improve your experience</li>
                  <li>Generate AI-powered invitation designs and content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  4. Information Sharing
                </h2>
                <p className="text-surface-700 mb-4">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our Service (hosting, payment processing, email delivery)</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
                  <li><strong>Public Invitations:</strong> Information you include in public invitations is visible to anyone with the link</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  5. Data Security
                </h2>
                <p className="text-surface-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>Encryption of data in transit (HTTPS/TLS)</li>
                  <li>Encryption of sensitive data at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure cloud infrastructure (AWS)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  6. Cookies and Tracking
                </h2>
                <p className="text-surface-700 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-surface-700 mb-4 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate users and prevent fraud</li>
                  <li>Analyze how our Service is used</li>
                  <li>Deliver relevant advertisements (with consent)</li>
                </ul>
                <p className="text-surface-700">
                  You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  7. Your Rights
                </h2>
                <p className="text-surface-700 mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request a portable copy of your data</li>
                  <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Request limitation of processing</li>
                </ul>
                <p className="text-surface-700 mt-4">
                  To exercise these rights, contact us at privacy@invitegenerator.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  8. Data Retention
                </h2>
                <p className="text-surface-700">
                  We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and data at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-surface-700">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  10. Children&apos;s Privacy
                </h2>
                <p className="text-surface-700">
                  Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  11. Changes to This Policy
                </h2>
                <p className="text-surface-700">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  12. Contact Us
                </h2>
                <p className="text-surface-700 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <ul className="list-none text-surface-700 space-y-2">
                  <li><strong>Email:</strong> privacy@invitegenerator.com</li>
                  <li><strong>Website:</strong> <Link href="/help" className="text-brand-600 hover:text-brand-700">Help Center</Link></li>
                </ul>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-surface-200">
              <Link
                href="/"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
