/**
 * Cookie Policy Page
 *
 * LEGAL COMPLIANCE:
 * - EU Cookie Directive (ePrivacy)
 * - GDPR Cookie Requirements
 *
 * Lists all cookies used and their purposes.
 * Last Legal Review: December 2025
 */

import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | InviteGenerator",
  description: "Learn about the cookies and tracking technologies used by InviteGenerator.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "December 7, 2025";

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
            Cookie Policy
          </h1>

          <p className="text-surface-500 mb-8">
            Last Updated: {lastUpdated}
          </p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit websites.
            They help websites function properly, remember your preferences, and provide
            analytics and advertising capabilities.
          </p>

          <h2>How We Use Cookies</h2>

          <h3>Essential Cookies (Required)</h3>
          <p>These cookies are necessary for the website to function:</p>
          <table className="w-full">
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>access_token</code></td>
                <td>Authentication - keeps you logged in</td>
                <td>7 days</td>
              </tr>
              <tr>
                <td><code>id_token</code></td>
                <td>User identification</td>
                <td>7 days</td>
              </tr>
              <tr>
                <td><code>refresh_token</code></td>
                <td>Session refresh</td>
                <td>30 days</td>
              </tr>
              <tr>
                <td><code>csrf_token</code></td>
                <td>Security - prevents cross-site attacks</td>
                <td>Session</td>
              </tr>
              <tr>
                <td><code>cookie_consent</code></td>
                <td>Remembers your cookie preferences</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>Analytics Cookies</h3>
          <p>These help us understand how visitors use our website:</p>
          <table className="w-full">
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>_ga</code></td>
                <td>Google Analytics - distinguishes users</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td><code>_gid</code></td>
                <td>Google Analytics - distinguishes users</td>
                <td>24 hours</td>
              </tr>
              <tr>
                <td><code>_gat</code></td>
                <td>Google Analytics - throttles request rate</td>
                <td>1 minute</td>
              </tr>
            </tbody>
          </table>

          <h3>Marketing & Advertising Cookies</h3>
          <p>These cookies help us show relevant ads and track conversions:</p>
          <table className="w-full">
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>_fbp</code></td>
                <td>Facebook Pixel - ad targeting</td>
                <td>3 months</td>
              </tr>
              <tr>
                <td><code>_gcl_au</code></td>
                <td>Google Ads - conversion tracking</td>
                <td>3 months</td>
              </tr>
              <tr>
                <td><code>affiliate_id</code></td>
                <td>Tracks affiliate referrals</td>
                <td>30 days</td>
              </tr>
              <tr>
                <td><code>utm_*</code></td>
                <td>Campaign tracking parameters</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>

          <h3>Personalization Cookies</h3>
          <p>These cookies help us personalize your experience:</p>
          <table className="w-full">
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>user_preferences</code></td>
                <td>Remembers your settings</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td><code>recent_events</code></td>
                <td>Remembers event types you've created</td>
                <td>90 days</td>
              </tr>
              <tr>
                <td><code>recommended_seen</code></td>
                <td>Tracks which recommendations you've seen</td>
                <td>30 days</td>
              </tr>
            </tbody>
          </table>

          <h2>Third-Party Cookies</h2>
          <p>
            Some cookies are set by third-party services we use:
          </p>
          <ul>
            <li><strong>Google:</strong> Analytics, Ads, Sign-In</li>
            <li><strong>Facebook:</strong> Login, Pixel tracking</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Intercom/Zendesk:</strong> Customer support</li>
          </ul>

          <h2>Managing Cookies</h2>

          <h3>Browser Settings</h3>
          <p>
            You can control cookies through your browser settings:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener">Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener">Edge</a></li>
          </ul>

          <h3>Opt-Out Tools</h3>
          <ul>
            <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out</a></li>
            <li><a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener">Facebook Ad Preferences</a></li>
            <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener">Network Advertising Initiative Opt-out</a></li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 my-6">
            <h4 className="text-yellow-900 font-semibold mt-0">Important Note</h4>
            <p className="text-yellow-800 mb-0">
              Disabling cookies may affect the functionality of our website.
              Essential cookies cannot be disabled as they're required for the
              site to work properly.
            </p>
          </div>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy periodically. We will notify you
            of significant changes and update the "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            For questions about our use of cookies, contact us at{" "}
            <a href="mailto:privacy@invitegenerator.com">privacy@invitegenerator.com</a>.
          </p>

          <div className="bg-surface-100 rounded-xl p-6 mt-8">
            <h3 className="mt-0">Related Pages</h3>
            <ul className="mb-0">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-surface-500">
          <p>© {new Date().getFullYear()} InviteGenerator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
