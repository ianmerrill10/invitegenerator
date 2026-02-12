// ============================================
// AFFILIATE EMAIL TEMPLATES
// Email templates for affiliate program communications
// ============================================

const BRAND_COLOR = "#EC4899";
const ACCENT_COLOR = "#64748B";

// Base template wrapper (same as main templates)
function baseTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>InviteGenerator Partner Program</title>
  <meta name="x-apple-disable-message-reformatting">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #e55a3a 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
    .content { padding: 32px; }
    .footer { background-color: #18181b; padding: 32px; text-align: center; font-size: 12px; color: #a1a1aa; }
    .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button-secondary { background-color: ${ACCENT_COLOR}; }
    .card { background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0; }
    .highlight-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; }
    .stats-grid { display: flex; justify-content: space-around; text-align: center; }
    .stat-item { padding: 16px; }
    .stat-value { font-size: 32px; font-weight: 700; color: ${BRAND_COLOR}; }
    .stat-label { font-size: 14px; color: #71717a; }
    h2 { color: #18181b; margin: 0 0 16px 0; }
    p { color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0; }
    .highlight { color: ${BRAND_COLOR}; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #78350f; }
    .badge-silver { background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%); color: #374151; }
    .badge-bronze { background: linear-gradient(135deg, #fdba74 0%, #fb923c 100%); color: #7c2d12; }
    .tier-benefits { list-style: none; padding: 0; margin: 0; }
    .tier-benefits li { padding: 8px 0; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; }
    .tier-benefits li:last-child { border-bottom: none; }
    .check-icon { color: #22c55e; margin-right: 12px; font-size: 18px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
      .stats-grid { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Affiliate header
function affiliateHeader(title: string, subtitle?: string): string {
  return `
  <tr>
    <td class="header" style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #e55a3a 100%); padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${title}</h1>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">${subtitle}</p>` : ''}
    </td>
  </tr>
  `;
}

// Affiliate footer
function affiliateFooter(): string {
  const year = new Date().getFullYear();
  return `
  <tr>
    <td style="background-color: #18181b; padding: 32px; text-align: center;">
      <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">InviteGenerator Partner Program</p>
      <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 16px 0;">&copy; ${year} InviteGenerator. All rights reserved.</p>
      <p style="margin: 0;">
        <a href="https://invitegenerator.com/affiliates/dashboard" style="color: ${BRAND_COLOR}; text-decoration: none; margin: 0 12px;">Dashboard</a>
        <a href="https://invitegenerator.com/affiliates/resources" style="color: ${BRAND_COLOR}; text-decoration: none; margin: 0 12px;">Resources</a>
        <a href="https://invitegenerator.com/contact" style="color: ${BRAND_COLOR}; text-decoration: none; margin: 0 12px;">Support</a>
      </p>
    </td>
  </tr>
  `;
}

// ==================== WELCOME/APPROVAL EMAIL ====================
export interface AffiliateWelcomeData {
  affiliateName: string;
  affiliateCode: string;
  affiliateLink: string;
  dashboardUrl: string;
  tier: string;
  commissionRate: number;
}

export function affiliateWelcomeEmail(data: AffiliateWelcomeData): string {
  const content = `
    ${affiliateHeader("Welcome to the Partner Program!", "You're now part of an exclusive community")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Congratulations, ${data.affiliateName}!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Your application has been approved! Welcome to the InviteGenerator Partner Program. We're thrilled to have you join our community of successful affiliates.
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: #92400e; margin: 0 0 8px 0; font-weight: 600;">Your Referral Code</p>
          <p style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #78350f; margin: 0; letter-spacing: 4px;">${data.affiliateCode}</p>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px;">Your Partner Benefits</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong style="color: ${BRAND_COLOR};">${data.commissionRate}% Commission</strong> on all referred sales
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong>12+ Months</strong> of recurring commissions
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong>$50 Minimum</strong> payout threshold
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong>90-day</strong> cookie duration
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong>Weekly payouts</strong> via PayPal, Stripe, or bank transfer
              </td>
            </tr>
          </table>
        </div>

        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          <strong>Your Affiliate Link:</strong><br>
          <a href="${data.affiliateLink}" style="color: ${BRAND_COLOR}; word-break: break-all;">${data.affiliateLink}</a>
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Access Your Dashboard
          </a>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-size: 14px;">
            <strong>Quick Start Tip:</strong> Share your link on social media with a personal story about why you love InviteGenerator. Authentic recommendations convert 3x better than generic promotions!
          </p>
        </div>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `Welcome to the Partner Program! Your code: ${data.affiliateCode}`);
}

// ==================== NEW REFERRAL EMAIL ====================
export interface NewReferralData {
  affiliateName: string;
  referredName: string;
  referredEmail: string;
  source: string;
  timestamp: string;
  totalReferrals: number;
  dashboardUrl: string;
}

export function newReferralEmail(data: NewReferralData): string {
  const content = `
    ${affiliateHeader("New Referral!", "Someone signed up using your link")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Great news, ${data.affiliateName}!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Someone just signed up for InviteGenerator using your referral link. You're one step closer to earning a commission!
        </p>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">New User:</strong><br>
                <span style="color: #18181b; font-size: 18px;">${data.referredName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Email:</strong><br>
                <span style="color: #18181b;">${data.referredEmail}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Source:</strong><br>
                <span style="color: #18181b;">${data.source}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Signed Up:</strong><br>
                <span style="color: #18181b;">${data.timestamp}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Total Referrals This Month</p>
          <p style="color: #15803d; font-size: 48px; font-weight: 700; margin: 0;">${data.totalReferrals}</p>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          You'll earn your commission when they upgrade to a paid plan!
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View All Referrals
          </a>
        </div>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `New referral: ${data.referredName} signed up using your link!`);
}

// ==================== COMMISSION EARNED EMAIL ====================
export interface CommissionEarnedData {
  affiliateName: string;
  referredName: string;
  planPurchased: string;
  saleAmount: number;
  commissionAmount: number;
  commissionRate: number;
  totalPending: number;
  totalEarned: number;
  dashboardUrl: string;
}

export function commissionEarnedEmail(data: CommissionEarnedData): string {
  const content = `
    ${affiliateHeader("Cha-Ching! 💰", "You just earned a commission")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Congratulations, ${data.affiliateName}!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Your referral just converted to a paying customer! Here's your commission breakdown:
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
          <p style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Commission Earned</p>
          <p style="color: #78350f; font-size: 48px; font-weight: 700; margin: 0;">$${data.commissionAmount.toFixed(2)}</p>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Customer:</strong><br>
                <span style="color: #18181b;">${data.referredName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Plan Purchased:</strong><br>
                <span style="color: #18181b;">${data.planPurchased}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Sale Amount:</strong><br>
                <span style="color: #18181b;">$${data.saleAmount.toFixed(2)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Your Rate:</strong><br>
                <span style="color: ${BRAND_COLOR}; font-weight: 600;">${data.commissionRate}%</span>
              </td>
            </tr>
          </table>
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
          <tr>
            <td style="width: 50%; padding: 16px; text-align: center; background-color: #f0fdf4; border-radius: 8px 0 0 8px;">
              <p style="color: #166534; font-size: 12px; margin: 0 0 4px 0;">Pending Earnings</p>
              <p style="color: #15803d; font-size: 24px; font-weight: 700; margin: 0;">$${data.totalPending.toFixed(2)}</p>
            </td>
            <td style="width: 50%; padding: 16px; text-align: center; background-color: #ecfdf5; border-radius: 0 8px 8px 0;">
              <p style="color: #166534; font-size: 12px; margin: 0 0 4px 0;">Total Earned</p>
              <p style="color: #15803d; font-size: 24px; font-weight: 700; margin: 0;">$${data.totalEarned.toFixed(2)}</p>
            </td>
          </tr>
        </table>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          Plus, you'll earn recurring commissions every month they stay subscribed!
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Earnings Dashboard
          </a>
        </div>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `You earned $${data.commissionAmount.toFixed(2)} commission!`);
}

// ==================== TIER UPGRADE EMAIL ====================
export interface TierUpgradeData {
  affiliateName: string;
  oldTier: string;
  newTier: string;
  newCommissionRate: number;
  totalReferrals: number;
  bonusEarned?: number;
  newBenefits: string[];
  dashboardUrl: string;
}

export function tierUpgradeEmail(data: TierUpgradeData): string {
  const tierColors: Record<string, string> = {
    bronze: "#fdba74",
    silver: "#d1d5db",
    gold: "#fbbf24",
    platinum: "#a78bfa",
    diamond: "#67e8f9",
  };

  const tierColor = tierColors[data.newTier.toLowerCase()] || BRAND_COLOR;

  const content = `
    ${affiliateHeader("🎉 Level Up!", "You've been promoted to a new tier")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Amazing work, ${data.affiliateName}!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Your hard work is paying off! You've been promoted from ${data.oldTier} to <strong style="color: ${tierColor};">${data.newTier} Partner</strong>!
        </p>

        <div style="background: linear-gradient(135deg, ${tierColor}22 0%, ${tierColor}44 100%); border: 2px solid ${tierColor}; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
          <p style="color: #3f3f46; margin: 0 0 8px 0; font-size: 14px;">Your New Status</p>
          <p style="font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 2px; color: #18181b;">
            ${data.newTier} Partner
          </p>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px;">Your Enhanced Benefits</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                <strong style="color: ${BRAND_COLOR};">${data.newCommissionRate}% Commission Rate</strong>
              </td>
            </tr>
            ${data.newBenefits.map(benefit => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                <span style="color: #22c55e; margin-right: 12px;">✓</span>
                ${benefit}
              </td>
            </tr>
            `).join('')}
          </table>
        </div>

        ${data.bonusEarned ? `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Tier Bonus Earned!</p>
          <p style="color: #78350f; font-size: 36px; font-weight: 700; margin: 0;">+$${data.bonusEarned.toFixed(2)}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Your New Dashboard
          </a>
        </div>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `Congratulations! You're now a ${data.newTier} Partner!`);
}

// ==================== PAYOUT PROCESSED EMAIL ====================
export interface PayoutProcessedData {
  affiliateName: string;
  payoutAmount: number;
  payoutMethod: string;
  transactionId: string;
  processedDate: string;
  dashboardUrl: string;
}

export function payoutProcessedEmail(data: PayoutProcessedData): string {
  const content = `
    ${affiliateHeader("💸 Payment Sent!", "Your earnings are on the way")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Hi ${data.affiliateName},</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Great news! Your affiliate payout has been processed and is on its way to you.
        </p>

        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
          <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Amount Sent</p>
          <p style="color: #15803d; font-size: 48px; font-weight: 700; margin: 0;">$${data.payoutAmount.toFixed(2)}</p>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Payment Method:</strong><br>
                <span style="color: #18181b;">${data.payoutMethod}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Transaction ID:</strong><br>
                <span style="color: #18181b; font-family: monospace;">${data.transactionId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Processed On:</strong><br>
                <span style="color: #18181b;">${data.processedDate}</span>
              </td>
            </tr>
          </table>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          Funds typically arrive within 2-3 business days depending on your payment method.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Payout History
          </a>
        </div>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `Your $${data.payoutAmount.toFixed(2)} payout has been sent!`);
}

// ==================== AFFILIATE OUTREACH EMAIL ====================
// This is the cold outreach email for recruiting new affiliates
export interface AffiliateOutreachData {
  recipientName: string;
  recipientWebsite?: string;
  personalizationNote?: string;
  signupUrl: string;
}

export function affiliateOutreachEmail(data: AffiliateOutreachData): string {
  const content = `
    ${affiliateHeader("Partner With InviteGenerator", "Earn up to 50% recurring commissions")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Hi ${data.recipientName},</h2>

        ${data.personalizationNote ? `
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          ${data.personalizationNote}
        </p>
        ` : ''}

        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          I'm reaching out because I think you'd be a great fit for our affiliate program at InviteGenerator - the fastest-growing digital invitation platform.
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #78350f; margin: 0 0 16px 0; font-size: 18px;">Why Partner With Us?</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #92400e; margin-right: 12px; font-size: 20px;">💰</span>
                <strong>30-50% Recurring Commissions</strong> - Higher than industry average
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #92400e; margin-right: 12px; font-size: 20px;">🔄</span>
                <strong>12-36 Months</strong> of recurring revenue per referral
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #92400e; margin-right: 12px; font-size: 20px;">🎯</span>
                <strong>90-Day Cookie</strong> - Get credit for conversions
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #92400e; margin-right: 12px; font-size: 20px;">💸</span>
                <strong>$50 Low Payout Threshold</strong> - Get paid faster
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #92400e; margin-right: 12px; font-size: 20px;">🏆</span>
                <strong>Tier Bonuses</strong> up to $2,500 quarterly
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px;">Perfect For:</h3>
          <ul style="color: #3f3f46; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Wedding & event bloggers</li>
            <li>Party planning influencers</li>
            <li>Design & DIY content creators</li>
            <li>Email marketing specialists</li>
            <li>Small business consultants</li>
          </ul>
        </div>

        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Our affiliates typically earn <strong style="color: ${BRAND_COLOR};">$500-$5,000/month</strong> promoting a product their audience already needs - beautiful invitations for weddings, birthdays, and special events.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.signupUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Apply to Partner Program
          </a>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0;">
          Questions? Reply directly to this email or visit our <a href="https://invitegenerator.com/affiliates" style="color: ${BRAND_COLOR};">partner page</a> for more details.
        </p>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `Earn up to 50% recurring commissions as an InviteGenerator Partner`);
}

// ==================== MONTHLY PERFORMANCE REPORT ====================
export interface MonthlyReportData {
  affiliateName: string;
  month: string;
  year: number;
  clicks: number;
  signups: number;
  conversions: number;
  conversionRate: number;
  earnings: number;
  pendingEarnings: number;
  rank: number;
  totalAffiliates: number;
  topPerformerBonus?: number;
  dashboardUrl: string;
}

export function monthlyReportEmail(data: MonthlyReportData): string {
  const content = `
    ${affiliateHeader(`${data.month} ${data.year} Report`, "Your monthly performance summary")}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Hi ${data.affiliateName},</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Here's how you performed last month in the InviteGenerator Partner Program:
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
          <tr>
            <td style="width: 33%; padding: 16px; text-align: center; background-color: #fafafa; border-radius: 8px 0 0 8px;">
              <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0;">Clicks</p>
              <p style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0;">${data.clicks.toLocaleString()}</p>
            </td>
            <td style="width: 33%; padding: 16px; text-align: center; background-color: #f5f5f5;">
              <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0;">Signups</p>
              <p style="color: #18181b; font-size: 28px; font-weight: 700; margin: 0;">${data.signups}</p>
            </td>
            <td style="width: 33%; padding: 16px; text-align: center; background-color: #fafafa; border-radius: 0 8px 8px 0;">
              <p style="color: #71717a; font-size: 12px; margin: 0 0 4px 0;">Conversions</p>
              <p style="color: ${BRAND_COLOR}; font-size: 28px; font-weight: 700; margin: 0;">${data.conversions}</p>
            </td>
          </tr>
        </table>

        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Earnings This Month</p>
          <p style="color: #15803d; font-size: 48px; font-weight: 700; margin: 0;">$${data.earnings.toFixed(2)}</p>
          <p style="color: #166534; font-size: 14px; margin: 8px 0 0 0;">
            Pending: $${data.pendingEarnings.toFixed(2)} | Conversion Rate: ${data.conversionRate.toFixed(1)}%
          </p>
        </div>

        <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">Your Leaderboard Rank</p>
          <p style="color: #18181b; font-size: 36px; font-weight: 700; margin: 0;">
            #${data.rank} <span style="font-size: 16px; color: #71717a;">of ${data.totalAffiliates}</span>
          </p>
        </div>

        ${data.topPerformerBonus ? `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">🏆 Top Performer Bonus!</p>
          <p style="color: #78350f; font-size: 36px; font-weight: 700; margin: 0;">+$${data.topPerformerBonus.toFixed(2)}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Full Report
          </a>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0;">
          Keep up the great work! Share your affiliate link to grow your earnings.
        </p>
      </td>
    </tr>
    ${affiliateFooter()}
  `;

  return baseTemplate(content, `Your ${data.month} report: $${data.earnings.toFixed(2)} earned, #${data.rank} rank`);
}
