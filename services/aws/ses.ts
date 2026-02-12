// ============================================
// AWS SES SERVICE
// Email sending functionality
// ============================================

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@invitegenerator.com';
const REPLY_TO_EMAIL = process.env.SES_REPLY_TO_EMAIL || 'support@invitegenerator.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a simple email
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: options.html,
            Charset: 'UTF-8',
          },
          ...(options.text && {
            Text: {
              Data: options.text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ReplyToAddresses: [options.replyTo || REPLY_TO_EMAIL],
    });

    const result = await sesClient.send(command);

    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    console.error('SES send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send invitation email to a guest
 */
export async function sendInvitationEmail(
  guestEmail: string,
  guestName: string,
  invitation: {
    title: string;
    hostName: string;
    eventDate: string;
    eventTime?: string;
    location: string;
    shareUrl: string;
    rsvpUrl: string;
  }
): Promise<SendResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${invitation.title}</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1C1917; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #EC4899 0%, #64748B 100%); border-radius: 16px; margin-bottom: 30px;">
    <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0;">You're Invited!</h1>
    <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">${invitation.title}</p>
  </div>

  <div style="padding: 30px; background: #FAFAF9; border-radius: 16px; margin-bottom: 20px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">Dear ${guestName},</p>
    <p style="font-size: 16px; margin: 0 0 20px 0;">${invitation.hostName} would like to invite you to ${invitation.title}.</p>

    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${invitation.eventDate}</p>
      ${invitation.eventTime ? `<p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${invitation.eventTime}</p>` : ''}
      <p style="margin: 0;"><strong>Location:</strong> ${invitation.location}</p>
    </div>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${invitation.shareUrl}" style="display: inline-block; padding: 16px 32px; background: #EC4899; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin-right: 10px;">View Invitation</a>
    <a href="${invitation.rsvpUrl}" style="display: inline-block; padding: 16px 32px; background: #64748B; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">RSVP Now</a>
  </div>

  <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 30px 0;">

  <p style="font-size: 14px; color: #78716C; text-align: center; margin: 0;">
    This invitation was sent via <a href="https://invitegenerator.com" style="color: #EC4899;">InviteGenerator</a>
  </p>
</body>
</html>`;

  const text = `
You're Invited!

${invitation.title}

Dear ${guestName},

${invitation.hostName} would like to invite you to ${invitation.title}.

Date: ${invitation.eventDate}
${invitation.eventTime ? `Time: ${invitation.eventTime}` : ''}
Location: ${invitation.location}

View Invitation: ${invitation.shareUrl}
RSVP: ${invitation.rsvpUrl}

---
This invitation was sent via InviteGenerator (https://invitegenerator.com)
`;

  return sendEmail({
    to: guestEmail,
    subject: `You're Invited: ${invitation.title}`,
    html,
    text,
  });
}

/**
 * Send RSVP confirmation email
 */
export async function sendRSVPConfirmationEmail(
  guestEmail: string,
  guestName: string,
  response: 'attending' | 'not_attending' | 'maybe',
  invitation: {
    title: string;
    eventDate: string;
    eventTime?: string;
    location: string;
    shareUrl: string;
  }
): Promise<SendResult> {
  const responseText = {
    attending: "We're excited to see you there!",
    not_attending: "We're sorry you can't make it.",
    maybe: "We hope to see you there!",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1C1917; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 40px 20px; background: #64748B; border-radius: 16px; margin-bottom: 30px;">
    <h1 style="color: white; font-size: 28px; margin: 0;">RSVP Confirmed!</h1>
  </div>

  <div style="padding: 30px; background: #FAFAF9; border-radius: 16px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">Hi ${guestName},</p>
    <p style="font-size: 16px; margin: 0 0 20px 0;">Your RSVP for <strong>${invitation.title}</strong> has been received.</p>
    <p style="font-size: 18px; margin: 0 0 20px 0; padding: 15px; background: white; border-radius: 8px; text-align: center;">
      <strong>Your response: ${response === 'attending' ? 'Attending' : response === 'not_attending' ? 'Not Attending' : 'Maybe'}</strong>
    </p>
    <p style="font-size: 16px; margin: 0;">${responseText[response]}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${invitation.shareUrl}" style="display: inline-block; padding: 14px 28px; background: #EC4899; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Event Details</a>
  </div>

  <p style="font-size: 14px; color: #78716C; text-align: center;">
    Need to change your response? <a href="${invitation.shareUrl}" style="color: #EC4899;">Update RSVP</a>
  </p>
</body>
</html>`;

  return sendEmail({
    to: guestEmail,
    subject: `RSVP Confirmed: ${invitation.title}`,
    html,
  });
}

/**
 * Send RSVP reminder email
 */
export async function sendRSVPReminderEmail(
  guestEmail: string,
  guestName: string,
  invitation: {
    title: string;
    hostName: string;
    eventDate: string;
    rsvpDeadline: string;
    rsvpUrl: string;
  }
): Promise<SendResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RSVP Reminder</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1C1917; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 40px 20px; background: #F59E0B; border-radius: 16px; margin-bottom: 30px;">
    <h1 style="color: white; font-size: 28px; margin: 0;">RSVP Reminder</h1>
  </div>

  <div style="padding: 30px; background: #FAFAF9; border-radius: 16px;">
    <p style="font-size: 16px; margin: 0 0 20px 0;">Hi ${guestName},</p>
    <p style="font-size: 16px; margin: 0 0 20px 0;">This is a friendly reminder that ${invitation.hostName} is still waiting to hear from you about <strong>${invitation.title}</strong>.</p>
    <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>Event Date:</strong> ${invitation.eventDate}</p>
    <p style="font-size: 16px; margin: 0; color: #DC2626;"><strong>RSVP Deadline:</strong> ${invitation.rsvpDeadline}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${invitation.rsvpUrl}" style="display: inline-block; padding: 16px 32px; background: #64748B; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">RSVP Now</a>
  </div>
</body>
</html>`;

  return sendEmail({
    to: guestEmail,
    subject: `Reminder: Please RSVP for ${invitation.title}`,
    html,
  });
}

