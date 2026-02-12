// ============================================
// EMAIL TEMPLATES
// HTML email templates for all notifications
// ============================================

const BRAND_COLOR = "#EC4899";

// Base template wrapper
function baseTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>InviteGenerator</title>
  <meta name="x-apple-disable-message-reformatting">
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button { padding: 12px 24px !important; }
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${BRAND_COLOR}; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 32px; }
    .footer { background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }
    .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background-color: #e55a3a; }
    .card { background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    h2 { color: #18181b; margin: 0 0 16px 0; }
    p { color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0; }
    .highlight { color: ${BRAND_COLOR}; font-weight: 600; }
    .muted { color: #71717a; font-size: 14px; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>
  <div style="display: none; max-height: 0; overflow: hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Header component
function header(title: string = "InviteGenerator"): string {
  return `
  <tr>
    <td class="header" style="background-color: ${BRAND_COLOR}; padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${title}</h1>
    </td>
  </tr>
  `;
}

// Footer component
function footer(): string {
  const year = new Date().getFullYear();
  return `
  <tr>
    <td class="footer" style="background-color: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a;">
      <p style="margin: 0 0 8px 0;">&copy; ${year} InviteGenerator. All rights reserved.</p>
      <p style="margin: 0;">Create beautiful invitations at <a href="https://invitegenerator.com" style="color: ${BRAND_COLOR};">invitegenerator.com</a></p>
    </td>
  </tr>
  `;
}

// ==================== INVITATION SENT ====================
export interface InvitationSentData {
  recipientName: string;
  hostName: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  invitationUrl: string;
  personalMessage?: string;
}

export function invitationSentEmail(data: InvitationSentData): string {
  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">You're Invited!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.recipientName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          <strong>${data.hostName}</strong> has invited you to <span style="color: ${BRAND_COLOR}; font-weight: 600;">${data.eventTitle}</span>.
        </p>

        ${data.personalMessage ? `
        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${BRAND_COLOR};">
          <p style="color: #3f3f46; margin: 0; font-style: italic;">"${data.personalMessage}"</p>
        </div>
        ` : ''}

        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">When:</strong><br>
                <span style="color: #18181b;">${data.eventDate}${data.eventTime ? ` at ${data.eventTime}` : ''}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Where:</strong><br>
                <span style="color: #18181b;">${data.eventLocation}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.invitationUrl}" class="button" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Invitation & RSVP
          </a>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center;">
          Can't click the button? Copy this link:<br>
          <a href="${data.invitationUrl}" style="color: ${BRAND_COLOR}; word-break: break-all;">${data.invitationUrl}</a>
        </p>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `You're invited to ${data.eventTitle} by ${data.hostName}`);
}

// ==================== RSVP RECEIVED ====================
export interface RSVPReceivedData {
  hostName: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  response: "attending" | "not_attending" | "maybe";
  guestCount: number;
  message?: string;
  dietaryRestrictions?: string;
  dashboardUrl: string;
}

export function rsvpReceivedEmail(data: RSVPReceivedData): string {
  const responseText = {
    attending: "is attending",
    not_attending: "can't make it",
    maybe: "might attend"
  }[data.response];

  const responseColor = {
    attending: "#22c55e",
    not_attending: "#ef4444",
    maybe: "#f59e0b"
  }[data.response];

  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">New RSVP Response!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.hostName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          You have a new RSVP for <strong>${data.eventTitle}</strong>.
        </p>

        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Guest:</strong><br>
                <span style="color: #18181b;">${data.guestName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Email:</strong><br>
                <span style="color: #18181b;">${data.guestEmail}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Response:</strong><br>
                <span style="color: ${responseColor}; font-weight: 600; text-transform: uppercase;">${responseText}</span>
              </td>
            </tr>
            ${data.guestCount > 1 ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Party Size:</strong><br>
                <span style="color: #18181b;">${data.guestCount} guests</span>
              </td>
            </tr>
            ` : ''}
            ${data.dietaryRestrictions ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Dietary Restrictions:</strong><br>
                <span style="color: #18181b;">${data.dietaryRestrictions}</span>
              </td>
            </tr>
            ` : ''}
            ${data.message ? `
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Message:</strong><br>
                <span style="color: #18181b; font-style: italic;">"${data.message}"</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" class="button" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View All RSVPs
          </a>
        </div>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `${data.guestName} ${responseText} to ${data.eventTitle}`);
}

// ==================== EVENT REMINDER ====================
export interface EventReminderData {
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  daysUntil: number;
  invitationUrl: string;
}

export function eventReminderEmail(data: EventReminderData): string {
  const urgencyText = data.daysUntil === 0
    ? "Today!"
    : data.daysUntil === 1
      ? "Tomorrow!"
      : `in ${data.daysUntil} days`;

  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Event Reminder</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.recipientName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          This is a friendly reminder that <span style="color: ${BRAND_COLOR}; font-weight: 600;">${data.eventTitle}</span> is coming up <strong>${urgencyText}</strong>
        </p>

        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">When:</strong><br>
                <span style="color: #18181b;">${data.eventDate}${data.eventTime ? ` at ${data.eventTime}` : ''}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Where:</strong><br>
                <span style="color: #18181b;">${data.eventLocation}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.invitationUrl}" class="button" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Invitation Details
          </a>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center;">
          We look forward to seeing you there!
        </p>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `Reminder: ${data.eventTitle} is ${urgencyText}`);
}

// ==================== PASSWORD RESET ====================
export interface PasswordResetData {
  userName: string;
  resetCode: string;
  expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetData): string {
  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Reset Your Password</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.userName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          We received a request to reset your password. Use the code below to complete the process:
        </p>

        <div style="background-color: #18181b; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
          <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${data.resetCode}</span>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center; margin: 0 0 16px 0;">
          This code expires in <strong>${data.expiresIn}</strong>.
        </p>

        <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Didn't request this?</strong><br>
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `Your password reset code: ${data.resetCode}`);
}

// ==================== RSVP CONFIRMATION ====================
export interface RSVPConfirmationData {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventLocation: string;
  response: "attending" | "not_attending" | "maybe";
  invitationUrl: string;
}

export function rsvpConfirmationEmail(data: RSVPConfirmationData): string {
  const responseMessages = {
    attending: "We're excited to see you there!",
    not_attending: "We're sorry you can't make it. We'll miss you!",
    maybe: "Thanks for letting us know. We hope you can make it!"
  };

  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">RSVP Confirmed</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.guestName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Your RSVP for <strong>${data.eventTitle}</strong> has been received. ${responseMessages[data.response]}
        </p>

        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Event:</strong><br>
                <span style="color: #18181b;">${data.eventTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">When:</strong><br>
                <span style="color: #18181b;">${data.eventDate}${data.eventTime ? ` at ${data.eventTime}` : ''}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <strong style="color: #71717a;">Where:</strong><br>
                <span style="color: #18181b;">${data.eventLocation}</span>
              </td>
            </tr>
          </table>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center;">
          Need to change your response? <a href="${data.invitationUrl}" style="color: ${BRAND_COLOR};">Update your RSVP</a>
        </p>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `RSVP confirmed for ${data.eventTitle}`);
}

// ==================== WELCOME EMAIL ====================
export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export function welcomeEmail(data: WelcomeEmailData): string {
  const content = `
    ${header()}
    <tr>
      <td class="content" style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 16px 0;">Welcome to InviteGenerator!</h2>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Hi ${data.userName},
        </p>
        <p style="color: #3f3f46; line-height: 1.6; margin: 0 0 16px 0;">
          Thanks for joining InviteGenerator! We're excited to help you create beautiful invitations for your events.
        </p>

        <div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 16px;">Getting Started:</h3>
          <ul style="color: #3f3f46; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Create your first invitation from 100+ templates</li>
            <li style="margin-bottom: 8px;">Customize with our drag-and-drop editor</li>
            <li style="margin-bottom: 8px;">Share and track RSVPs in real-time</li>
            <li style="margin-bottom: 0;">Use AI to generate unique designs</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" class="button" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Create Your First Invitation
          </a>
        </div>

        <p style="color: #71717a; font-size: 14px; text-align: center;">
          Questions? Reply to this email or visit our <a href="https://invitegenerator.com/help" style="color: ${BRAND_COLOR};">Help Center</a>
        </p>
      </td>
    </tr>
    ${footer()}
  `;

  return baseTemplate(content, `Welcome to InviteGenerator, ${data.userName}!`);
}
