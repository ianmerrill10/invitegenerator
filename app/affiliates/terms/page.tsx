import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Affiliate Program Terms & Conditions | InviteGenerator",
  description: "Terms and conditions for the InviteGenerator affiliate program. Read our guidelines, commission structure, and policies.",
  alternates: {
    canonical: "/affiliates/terms",
  },
};

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          <h1 className="font-heading text-4xl font-bold text-surface-900 mb-4">
            Affiliate Program Terms & Conditions
          </h1>
          <p className="text-surface-600 mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                1. Program Overview
              </h2>
              <p className="text-surface-700 mb-4">
                The InviteGenerator Affiliate Program (&quot;Program&quot;) allows approved participants (&quot;Affiliates&quot;) to earn commissions by referring new customers to InviteGenerator.com (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
              </p>
              <p className="text-surface-700">
                By participating in the Program, you agree to be bound by these Terms & Conditions, which constitute a binding agreement between you and InviteGenerator.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                2. Eligibility & Enrollment
              </h2>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>You must be at least 18 years of age to participate.</li>
                <li>You must have a valid website, blog, email list, or social media presence.</li>
                <li>You must provide accurate and complete information during enrollment.</li>
                <li>We reserve the right to accept or reject any application at our sole discretion.</li>
                <li>Existing InviteGenerator users may be automatically approved.</li>
                <li>You may not create accounts solely to earn referral bonuses.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                3. Commission Structure
              </h2>
              <p className="text-surface-700 mb-4">
                Affiliates earn commissions based on their tier level:
              </p>
              <table className="w-full border-collapse border border-surface-200 mb-4">
                <thead>
                  <tr className="bg-surface-100">
                    <th className="border border-surface-200 px-4 py-2 text-left">Tier</th>
                    <th className="border border-surface-200 px-4 py-2 text-left">Commission Rate</th>
                    <th className="border border-surface-200 px-4 py-2 text-left">Recurring Duration</th>
                    <th className="border border-surface-200 px-4 py-2 text-left">Qualification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-surface-200 px-4 py-2">Bronze</td>
                    <td className="border border-surface-200 px-4 py-2">30%</td>
                    <td className="border border-surface-200 px-4 py-2">12 months</td>
                    <td className="border border-surface-200 px-4 py-2">Starting tier</td>
                  </tr>
                  <tr>
                    <td className="border border-surface-200 px-4 py-2">Silver</td>
                    <td className="border border-surface-200 px-4 py-2">35%</td>
                    <td className="border border-surface-200 px-4 py-2">12 months</td>
                    <td className="border border-surface-200 px-4 py-2">10+ conversions</td>
                  </tr>
                  <tr>
                    <td className="border border-surface-200 px-4 py-2">Gold</td>
                    <td className="border border-surface-200 px-4 py-2">40%</td>
                    <td className="border border-surface-200 px-4 py-2">18 months</td>
                    <td className="border border-surface-200 px-4 py-2">25+ conversions</td>
                  </tr>
                  <tr>
                    <td className="border border-surface-200 px-4 py-2">Platinum</td>
                    <td className="border border-surface-200 px-4 py-2">45%</td>
                    <td className="border border-surface-200 px-4 py-2">24 months</td>
                    <td className="border border-surface-200 px-4 py-2">50+ conversions</td>
                  </tr>
                  <tr>
                    <td className="border border-surface-200 px-4 py-2">Diamond</td>
                    <td className="border border-surface-200 px-4 py-2">50%</td>
                    <td className="border border-surface-200 px-4 py-2">36 months</td>
                    <td className="border border-surface-200 px-4 py-2">100+ conversions</td>
                  </tr>
                </tbody>
              </table>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>Commissions are calculated on the net sale amount (excluding taxes and refunds).</li>
                <li>Recurring commissions are earned for the duration specified above, as long as the customer remains subscribed.</li>
                <li>Self-referrals are not allowed and will not earn commissions.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                4. Cookie Duration & Attribution
              </h2>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>Our tracking cookie duration is 90 days.</li>
                <li>If a user clicks multiple affiliate links, the last affiliate cookie takes precedence.</li>
                <li>Commissions are attributed based on the tracking cookie present at the time of purchase.</li>
                <li>We use first-party cookies and server-side tracking for accurate attribution.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                5. Payment Terms
              </h2>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>Minimum payout threshold: $50 USD.</li>
                <li>Payouts are processed weekly for approved balances.</li>
                <li>Payment methods: PayPal, Stripe Connect, bank transfer (ACH/wire).</li>
                <li>Commissions have a 30-day hold period before becoming eligible for payout (to account for refunds).</li>
                <li>You are responsible for any taxes on your affiliate earnings.</li>
                <li>We may request tax documentation (W-9/W-8BEN) for payouts exceeding $600 annually.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                6. Promotional Guidelines
              </h2>
              <h3 className="font-semibold text-lg text-surface-900 mb-2">Permitted Activities:</h3>
              <ul className="list-disc pl-6 text-surface-700 space-y-2 mb-4">
                <li>Promoting InviteGenerator on your website, blog, or social media.</li>
                <li>Creating original content about InviteGenerator (reviews, tutorials, comparisons).</li>
                <li>Using paid advertising on social media and content networks.</li>
                <li>Email marketing to your own subscriber list.</li>
              </ul>

              <h3 className="font-semibold text-lg text-surface-900 mb-2">Prohibited Activities:</h3>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>Bidding on &quot;InviteGenerator&quot; or similar brand terms in paid search advertising.</li>
                <li>Creating websites that impersonate or could be confused with InviteGenerator.</li>
                <li>Sending unsolicited emails (spam) promoting InviteGenerator.</li>
                <li>Making false, misleading, or unsubstantiated claims about our products.</li>
                <li>Using cookie stuffing, ad injection, or other deceptive techniques.</li>
                <li>Offering unauthorized discounts or coupon codes.</li>
                <li>Promoting InviteGenerator on adult, illegal, or otherwise objectionable websites.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                7. Termination
              </h2>
              <p className="text-surface-700 mb-4">
                Either party may terminate this agreement at any time for any reason. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-surface-700 space-y-2">
                <li>Pending commissions that have passed the hold period will be paid out.</li>
                <li>Commissions still in the hold period may be forfeited if termination is due to violation of these terms.</li>
                <li>You must remove all InviteGenerator affiliate links and promotional materials.</li>
                <li>Access to the affiliate dashboard will be revoked.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                8. Modifications
              </h2>
              <p className="text-surface-700">
                We reserve the right to modify these terms at any time. We will notify affiliates of material changes via email. Continued participation in the Program after such notice constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-surface-700">
                InviteGenerator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your participation in the Program. Our total liability shall not exceed the total commissions paid to you in the twelve (12) months preceding any claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-surface-900 mb-4">
                10. Contact Information
              </h2>
              <p className="text-surface-700 mb-4">
                For questions about the affiliate program, contact us at:
              </p>
              <ul className="text-surface-700">
                <li>Email: affiliates@invitegenerator.com</li>
                <li>Support: <Link href="/contact" className="text-brand-600 hover:underline">Contact Form</Link></li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-surface-200">
            <p className="text-surface-600 text-center">
              Ready to join?{" "}
              <Link href="/affiliates/join" className="text-brand-600 hover:underline font-medium">
                Apply to the Partner Program
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
