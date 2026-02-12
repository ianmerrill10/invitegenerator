import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "InviteGenerator Terms of Service - Read our terms and conditions for using our invitation creation platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "December 16, 2025";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-surface-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-surface-600 mb-8">
              Last updated: {lastUpdated}
            </p>

            <div className="prose prose-surface max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-surface-700 mb-4">
                  Welcome to InviteGenerator. By accessing or using our website at invitegenerator.com (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service.
                </p>
                <p className="text-surface-700">
                  We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting a notice on our website. Your continued use of the Service after any changes indicates your acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  2. Description of Service
                </h2>
                <p className="text-surface-700 mb-4">
                  InviteGenerator provides an AI-powered platform for creating, customizing, and sharing digital event invitations. Our services include:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>AI-assisted invitation design and content generation</li>
                  <li>Customizable invitation templates</li>
                  <li>RSVP collection and guest management</li>
                  <li>Digital invitation sharing and delivery</li>
                  <li>Analytics and tracking features</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  3. Account Registration
                </h2>
                <p className="text-surface-700 mb-4">
                  To access certain features, you must create an account. When registering, you agree to:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized account use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
                <p className="text-surface-700 mt-4">
                  You must be at least 13 years old to create an account. If you are under 18, you represent that you have parental or guardian consent to use the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  4. Acceptable Use
                </h2>
                <p className="text-surface-700 mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights of others</li>
                  <li>Transmit harmful, offensive, or objectionable content</li>
                  <li>Send spam, phishing, or unsolicited communications</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to systems or data</li>
                  <li>Use automated means to access the Service without permission</li>
                  <li>Create invitations for illegal events or activities</li>
                  <li>Collect personal information of others without consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  5. Content and Intellectual Property
                </h2>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  5.1 Your Content
                </h3>
                <p className="text-surface-700 mb-4">
                  You retain ownership of content you create using our Service. By uploading or creating content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and display your content as necessary to provide the Service.
                </p>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  5.2 Our Content
                </h3>
                <p className="text-surface-700 mb-4">
                  The Service, including its design, features, templates, and AI-generated content, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
                </p>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  5.3 AI-Generated Content
                </h3>
                <p className="text-surface-700">
                  Content generated by our AI tools is provided for your use in creating invitations. You acknowledge that AI-generated content may not be unique and similar content may be generated for other users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  6. Subscription and Payments
                </h2>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  6.1 Pricing
                </h3>
                <p className="text-surface-700 mb-4">
                  We offer free and paid subscription plans. Paid plans provide additional features and higher usage limits. Prices are subject to change with notice.
                </p>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  6.2 Billing
                </h3>
                <p className="text-surface-700 mb-4">
                  Paid subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees incurred.
                </p>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  6.3 Refunds
                </h3>
                <p className="text-surface-700 mb-4">
                  Subscription fees are generally non-refundable. However, we may offer refunds at our discretion for service issues or within 7 days of initial purchase.
                </p>

                <h3 className="text-lg font-semibold text-surface-800 mb-3">
                  6.4 Cancellation
                </h3>
                <p className="text-surface-700">
                  You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until then.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  7. Privacy
                </h2>
                <p className="text-surface-700">
                  Your use of the Service is also governed by our <Link href="/privacy" className="text-brand-600 hover:text-brand-700">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  8. Disclaimers
                </h2>
                <p className="text-surface-700 mb-4">
                  THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Accuracy or reliability of AI-generated content</li>
                  <li>Security of data transmission or storage</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-surface-700">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, INVITEGENERATOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  10. Indemnification
                </h2>
                <p className="text-surface-700">
                  You agree to indemnify and hold harmless InviteGenerator, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service, your content, or your violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  11. Termination
                </h2>
                <p className="text-surface-700 mb-4">
                  We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Upon termination:
                </p>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li>Your right to use the Service immediately ceases</li>
                  <li>We may delete your account and content</li>
                  <li>You remain liable for any outstanding obligations</li>
                  <li>Provisions that by their nature should survive will survive</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  12. Governing Law
                </h2>
                <p className="text-surface-700">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in the United States.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  13. General Provisions
                </h2>
                <ul className="list-disc list-inside text-surface-700 space-y-2">
                  <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and InviteGenerator</li>
                  <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
                  <li><strong>Waiver:</strong> Failure to enforce any right does not waive that right</li>
                  <li><strong>Assignment:</strong> You may not assign these Terms without our consent</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-heading font-semibold text-surface-900 mb-4">
                  14. Contact Us
                </h2>
                <p className="text-surface-700 mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <ul className="list-none text-surface-700 space-y-2">
                  <li><strong>Email:</strong> legal@invitegenerator.com</li>
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
