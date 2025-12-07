/**
 * Privacy Policy Page
 *
 * LEGAL COMPLIANCE:
 * - GDPR (EU General Data Protection Regulation)
 * - CCPA (California Consumer Privacy Act)
 * - CAN-SPAM Act
 *
 * This page discloses all data collection practices including:
 * - Personal data collected via social logins
 * - Event/invitation data used for marketing
 * - Third-party sharing with affiliate partners
 * - Cookie usage and tracking
 *
 * IMPORTANT: Update this page whenever data practices change.
 * Last Legal Review: December 2025
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | InviteGenerator",
  description: "Learn how InviteGenerator collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 7, 2025";
  const companyName = "InviteGenerator";
  const companyEmail = "privacy@invitegenerator.com";

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-brand-600 hover:text-brand-700 font-medium">
            ← Back to InviteGenerator
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-display font-bold text-surface-900 mb-4">
            Privacy Policy
          </h1>

          <p className="text-surface-500 mb-8">
            Last Updated: {lastUpdated}
          </p>

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-brand-900 mt-0">Quick Summary</h3>
            <ul className="text-brand-800 mb-0">
              <li>We collect information you provide and data about your invitations</li>
              <li>We use this data to personalize your experience and show relevant products</li>
              <li>We share data with partners to provide product recommendations</li>
              <li>You can control your privacy settings and request data deletion anytime</li>
            </ul>
          </div>

          <h2>1. Information We Collect</h2>

          <h3>1.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li><strong>Email Registration:</strong> Name, email address, password</li>
            <li><strong>Google Sign-In:</strong> Name, email, profile picture, locale preferences</li>
            <li><strong>Facebook Sign-In:</strong> Name, email, profile picture, birthday (if shared), location</li>
            <li><strong>Apple Sign-In:</strong> Name, email (may be anonymized by Apple)</li>
            <li><strong>Twitter/X Sign-In:</strong> Name, email, username, follower count</li>
          </ul>

          <h3>1.2 Invitation & Event Data</h3>
          <p>When you create invitations, we collect:</p>
          <ul>
            <li><strong>Event Details:</strong> Event type (birthday, wedding, etc.), date, time, location</li>
            <li><strong>Design Preferences:</strong> Colors, fonts, templates, style choices</li>
            <li><strong>Guest Information:</strong> Number of guests, RSVP responses, dietary restrictions</li>
            <li><strong>Planning Timeline:</strong> When you create invitations relative to event date</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 my-6">
            <h4 className="text-yellow-900 font-semibold mt-0">Why We Collect Event Data</h4>
            <p className="text-yellow-800 mb-0">
              We use your event information to provide personalized product recommendations
              and connect you with relevant services. For example, if you're planning a
              birthday party for 30 guests, we can suggest appropriate quantities of
              party supplies and decorations.
            </p>
          </div>

          <h3>1.3 Usage & Analytics Data</h3>
          <ul>
            <li>Pages visited and features used</li>
            <li>Device type, browser, operating system</li>
            <li>IP address and approximate location</li>
            <li>Referral source (how you found us)</li>
            <li>Clicks on product recommendations and affiliate links</li>
          </ul>

          <h2>2. How We Use Your Information</h2>

          <h3>2.1 Providing Our Service</h3>
          <ul>
            <li>Creating and managing your invitations</li>
            <li>Processing RSVP responses</li>
            <li>Sending event-related notifications</li>
          </ul>

          <h3>2.2 Personalization & Recommendations</h3>
          <ul>
            <li>Showing relevant product suggestions based on your event type</li>
            <li>Recommending quantities based on your guest count</li>
            <li>Suggesting services (catering, photography) in your area</li>
            <li>Customizing email content to your interests</li>
          </ul>

          <h3>2.3 Marketing Communications</h3>
          <p>With your consent, we may send you:</p>
          <ul>
            <li>Product recommendations related to your events</li>
            <li>Partner offers and discounts</li>
            <li>Planning tips and inspiration</li>
            <li>New feature announcements</li>
          </ul>
          <p>
            You can opt out of marketing emails at any time via the unsubscribe link
            or in your <Link href="/dashboard/settings">account settings</Link>.
          </p>

          <h2>3. Information Sharing</h2>

          <h3>3.1 Affiliate Partners</h3>
          <p>
            We work with affiliate partners to provide product recommendations.
            When you click on a product link, we share:
          </p>
          <ul>
            <li>A unique click identifier (not your personal info)</li>
            <li>The event type you were browsing</li>
            <li>Your approximate location (city/region level)</li>
          </ul>

          <h3>3.2 Advertising Partners</h3>
          <p>
            We may share aggregated, non-personally-identifiable data with advertising
            partners to show you relevant ads. This includes:
          </p>
          <ul>
            <li>Event categories you're interested in</li>
            <li>General demographic information</li>
            <li>Purchase intent signals</li>
          </ul>

          <h3>3.3 Service Providers</h3>
          <p>We share data with providers who help us operate our service:</p>
          <ul>
            <li><strong>AWS:</strong> Cloud hosting and data storage</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>SendGrid/SES:</strong> Email delivery</li>
            <li><strong>Analytics:</strong> Usage tracking and optimization</li>
          </ul>

          <h2>4. Your Rights & Choices</h2>

          <h3>4.1 Access Your Data</h3>
          <p>
            You can download all your personal data in machine-readable format
            from your <Link href="/dashboard/settings">account settings</Link>.
          </p>

          <h3>4.2 Delete Your Data</h3>
          <p>
            You can request complete deletion of your account and all associated
            data. This action is irreversible.
          </p>

          <h3>4.3 Marketing Opt-Out</h3>
          <p>You can control marketing preferences:</p>
          <ul>
            <li>Unsubscribe from emails using the link in any email</li>
            <li>Adjust preferences in <Link href="/dashboard/settings">account settings</Link></li>
            <li>Opt out of personalized recommendations</li>
          </ul>

          <h3>4.4 Do Not Sell My Information (CCPA)</h3>
          <p>
            California residents can opt out of the "sale" of personal information
            under the CCPA. Visit our <Link href="/do-not-sell">Do Not Sell</Link> page
            to exercise this right.
          </p>

          <h2>5. Cookies & Tracking</h2>
          <p>
            We use cookies and similar technologies for functionality, analytics,
            and advertising. See our <Link href="/cookies">Cookie Policy</Link> for details.
          </p>

          <h2>6. Data Retention</h2>
          <ul>
            <li><strong>Account Data:</strong> Retained while your account is active</li>
            <li><strong>Invitation Data:</strong> Retained for 2 years after event date</li>
            <li><strong>Analytics Data:</strong> Retained for 26 months</li>
            <li><strong>Deleted Accounts:</strong> Data removed within 30 days</li>
          </ul>

          <h2>7. Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Encryption in transit (HTTPS/TLS)</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>

          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not directed to children under 13 (or 16 in the EU).
            We do not knowingly collect data from children.
          </p>

          <h2>9. International Transfers</h2>
          <p>
            Your data may be transferred to and processed in the United States.
            We ensure appropriate safeguards are in place for international transfers.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of material
            changes via email or prominent notice on our website.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For privacy-related questions or to exercise your rights:
          </p>
          <ul>
            <li>Email: <a href={`mailto:${companyEmail}`}>{companyEmail}</a></li>
            <li>Mail: InviteGenerator Privacy Team, [Address]</li>
          </ul>

          <div className="bg-surface-100 rounded-xl p-6 mt-8">
            <h3 className="mt-0">Related Pages</h3>
            <ul className="mb-0">
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
              <li><Link href="/do-not-sell">Do Not Sell My Information</Link></li>
              <li><Link href="/dashboard/settings">Privacy Settings</Link></li>
            </ul>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-surface-500">
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
