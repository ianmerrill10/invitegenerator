/**
 * Terms of Service Page
 *
 * LEGAL COMPLIANCE:
 * - Establishes user agreement
 * - Defines acceptable use
 * - Limits liability
 * - Establishes dispute resolution
 *
 * IMPORTANT: Update this page when terms change.
 * Last Legal Review: December 2025
 */

import Link from "next/link";

export const metadata = {
  title: "Terms of Service | InviteGenerator",
  description: "Terms and conditions for using InviteGenerator services.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "December 7, 2025";
  const companyName = "InviteGenerator";
  const companyEmail = "legal@invitegenerator.com";

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
            Terms of Service
          </h1>

          <p className="text-surface-500 mb-8">
            Last Updated: {lastUpdated}
          </p>

          <div className="bg-surface-100 border border-surface-200 rounded-xl p-6 mb-8">
            <p className="text-surface-700 mb-0">
              By using InviteGenerator, you agree to these terms. Please read them carefully.
              If you don't agree with these terms, please don't use our service.
            </p>
          </div>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using InviteGenerator ("Service"), you agree to be bound
            by these Terms of Service ("Terms"), our Privacy Policy, and all applicable
            laws and regulations. These Terms constitute a legally binding agreement
            between you and {companyName}.
          </p>

          <h2>2. Description of Service</h2>
          <p>InviteGenerator provides:</p>
          <ul>
            <li>Digital invitation creation tools</li>
            <li>AI-powered design generation</li>
            <li>RSVP collection and management</li>
            <li>Event planning resources and recommendations</li>
            <li>Product suggestions from third-party partners</li>
          </ul>

          <h2>3. Account Registration</h2>
          <h3>3.1 Account Creation</h3>
          <p>To use certain features, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h3>3.2 Age Requirement</h3>
          <p>
            You must be at least 13 years old (16 in the EU) to use our Service.
            By creating an account, you represent that you meet this requirement.
          </p>

          <h2>4. Free and Paid Services</h2>
          <h3>4.1 Free Features</h3>
          <p>
            InviteGenerator offers free invitation creation. Free accounts include
            product recommendations and marketing communications based on your
            event data (subject to your consent preferences).
          </p>

          <h3>4.2 Premium Features</h3>
          <p>
            Paid subscriptions may offer additional features. Payment terms,
            cancellation policies, and refund policies are provided at the time
            of purchase.
          </p>

          <h2>5. User Content</h2>
          <h3>5.1 Your Content</h3>
          <p>
            You retain ownership of content you create (invitations, text, images).
            By using our Service, you grant us a license to:
          </p>
          <ul>
            <li>Display your invitations to your intended recipients</li>
            <li>Store and process your content to provide the Service</li>
            <li>Use anonymized, aggregated data for analytics and improvements</li>
          </ul>

          <h3>5.2 Content Restrictions</h3>
          <p>You agree not to create or share content that:</p>
          <ul>
            <li>Violates any law or regulation</li>
            <li>Infringes intellectual property rights</li>
            <li>Contains hate speech, harassment, or threats</li>
            <li>Includes spam, malware, or deceptive content</li>
            <li>Contains sexually explicit or violent material</li>
            <li>Impersonates others or misrepresents your identity</li>
          </ul>

          <h2>6. Acceptable Use</h2>
          <p>You agree to use the Service only for lawful purposes. You will not:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Collect user information without consent</li>
            <li>Use the Service for commercial spam</li>
          </ul>

          <h2>7. Third-Party Services</h2>
          <h3>7.1 Product Recommendations</h3>
          <p>
            We provide product recommendations from affiliate partners. These are
            third-party products and services. We do not guarantee or warrant
            any third-party products.
          </p>

          <h3>7.2 External Links</h3>
          <p>
            Our Service may contain links to third-party websites. We are not
            responsible for the content or practices of these sites.
          </p>

          <h2>8. Intellectual Property</h2>
          <h3>8.1 Our Property</h3>
          <p>
            The Service, including its design, features, and content (excluding
            user content), is owned by {companyName} and protected by intellectual
            property laws.
          </p>

          <h3>8.2 Limited License</h3>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to
            use the Service for personal, non-commercial purposes.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
            OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE
            WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT
            BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL.
          </p>
          <p>
            OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE
            PAST 12 MONTHS OR $100, WHICHEVER IS GREATER.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {companyName}, its officers,
            directors, employees, and agents from any claims, damages, losses,
            or expenses arising from your use of the Service or violation of
            these Terms.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violation
            of these Terms or for any other reason at our discretion. You may
            terminate your account at any time through your account settings.
          </p>

          <h2>13. Dispute Resolution</h2>
          <h3>13.1 Governing Law</h3>
          <p>
            These Terms are governed by the laws of the State of Delaware, USA,
            without regard to conflict of law principles.
          </p>

          <h3>13.2 Arbitration</h3>
          <p>
            Any disputes shall be resolved through binding arbitration administered
            by the American Arbitration Association, except for disputes that
            qualify for small claims court.
          </p>

          <h3>13.3 Class Action Waiver</h3>
          <p>
            You agree to resolve disputes individually and waive any right to
            participate in class action lawsuits or class-wide arbitration.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material
            changes via email or prominent notice. Continued use after changes
            constitutes acceptance of the new Terms.
          </p>

          <h2>15. General Provisions</h2>
          <ul>
            <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and us.</li>
            <li><strong>Severability:</strong> If any provision is found unenforceable, other provisions remain in effect.</li>
            <li><strong>No Waiver:</strong> Failure to enforce any right does not waive that right.</li>
            <li><strong>Assignment:</strong> You may not assign these Terms. We may assign them freely.</li>
          </ul>

          <h2>16. Contact Us</h2>
          <p>
            For questions about these Terms, contact us at:
          </p>
          <ul>
            <li>Email: <a href={`mailto:${companyEmail}`}>{companyEmail}</a></li>
            <li>Mail: InviteGenerator Legal, [Address]</li>
          </ul>

          <div className="bg-surface-100 rounded-xl p-6 mt-8">
            <h3 className="mt-0">Related Pages</h3>
            <ul className="mb-0">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
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
