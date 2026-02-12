/**
 * Email Utility
 *
 * Handles sending emails via AWS SES.
 * Configure AWS_SES_FROM_EMAIL in environment variables.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@invitegenerator.com";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@invitegenerator.com";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using AWS SES
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: text,
            Charset: "UTF-8",
          },
          ...(html && {
            Html: {
              Data: html,
              Charset: "UTF-8",
            },
          }),
        },
      },
    });

    await sesClient.send(command);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  email: string,
  invoiceId: string,
  amount: number,
  currency: string = "usd"
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return sendEmail({
    to: email,
    subject: "Payment Receipt - InviteGenerator",
    text: `Thank you for your payment!

Your payment of ${formattedAmount} has been successfully processed.

Invoice ID: ${invoiceId}

If you have any questions, please contact us at ${SUPPORT_EMAIL}.

Best regards,
The InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .amount { font-size: 32px; font-weight: bold; color: #8B5CF6; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received</h1>
    </div>
    <div class="content">
      <p>Thank you for your payment!</p>
      <p class="amount">${formattedAmount}</p>
      <p>Your payment has been successfully processed.</p>
      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedEmail(
  email: string,
  invoiceId: string,
  amount: number,
  currency: string = "usd"
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return sendEmail({
    to: email,
    subject: "Payment Failed - Action Required - InviteGenerator",
    text: `We were unable to process your payment.

Your payment of ${formattedAmount} could not be processed.

Invoice ID: ${invoiceId}

Please update your payment method in your account settings to avoid any service interruption.

Update your payment method: https://invitegenerator.com/dashboard/billing

If you need assistance, please contact us at ${SUPPORT_EMAIL}.

Best regards,
The InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .amount { font-size: 24px; font-weight: bold; color: #EF4444; margin: 20px 0; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Failed</h1>
    </div>
    <div class="content">
      <p>We were unable to process your payment.</p>
      <p class="amount">${formattedAmount}</p>
      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p>Please update your payment method to avoid any service interruption.</p>
      <p style="text-align: center;">
        <a href="https://invitegenerator.com/dashboard/billing" class="button">Update Payment Method</a>
      </p>
      <p>If you need assistance, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(
  email: string,
  orderId: string,
  trackingNumber?: string,
  trackingUrl?: string,
  carrier?: string
): Promise<boolean> {
  const trackingSection = trackingUrl
    ? `<p style="text-align: center;"><a href="${trackingUrl}" class="button">Track Your Package</a></p><p><strong>Tracking Number:</strong> ${trackingNumber || "N/A"}</p><p><strong>Carrier:</strong> ${carrier || "N/A"}</p>`
    : `<p>Tracking information will be updated shortly.</p>`;

  const trackingText = trackingUrl
    ? `Track your package: ${trackingUrl}\nTracking Number: ${trackingNumber || "N/A"}\nCarrier: ${carrier || "N/A"}`
    : "Tracking information will be updated shortly.";

  return sendEmail({
    to: email,
    subject: "Your Invitations Have Shipped! - InviteGenerator",
    text: `Great news! Your print order has shipped.

Order ID: ${orderId}
${trackingText}

If you have any questions, please contact us at ${SUPPORT_EMAIL}.

Best regards,
The InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Invitations Have Shipped!</h1>
    </div>
    <div class="content">
      <p>Great news! Your print order is on its way.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      ${trackingSection}
      <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  itemDescription: string,
  total: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Order Confirmed - InviteGenerator",
    text: `Thank you for your order!

Order ID: ${orderId}
Item: ${itemDescription}
Total: ${total}

We'll send you a shipping notification once your invitations are on their way.

Best regards,
The InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Item:</strong> ${itemDescription}</p>
      <p><strong>Total:</strong> ${total}</p>
      <p>We'll send you a shipping notification once your invitations are on their way.</p>
      <p style="text-align: center;">
        <a href="https://invitegenerator.com/dashboard" class="button">View Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send welcome email for new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to InviteGenerator!",
    text: `Hi ${name},

Welcome to InviteGenerator! We're excited to have you join us.

You can now create beautiful wedding invitations with our easy-to-use design tools and professional templates.

Get started: https://invitegenerator.com/dashboard

If you have any questions, we're here to help at ${SUPPORT_EMAIL}.

Best regards,
The InviteGenerator Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to InviteGenerator!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>We're excited to have you join us! You can now create beautiful wedding invitations with our easy-to-use design tools and professional templates.</p>
      <p style="text-align: center;">
        <a href="https://invitegenerator.com/dashboard" class="button">Get Started</a>
      </p>
      <p>If you have any questions, we're here to help at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The InviteGenerator Team</p>
    </div>
  </div>
</body>
</html>`,
  });
}
