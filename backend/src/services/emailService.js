import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const OUTBOX_FILE = path.join(DATA_DIR, 'email_outbox.json');

// Your activated FormSubmit endpoint token from your Gmail confirmation
const FORMSUBMIT_TOKEN = process.env.FORMSUBMIT_TOKEN || '9bdc70c0d9a8d9d4a0f31360c9d28fc6';

function logToEmailOutbox(entry) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let list = [];
    if (fs.existsSync(OUTBOX_FILE)) {
      list = JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf-8') || '[]');
    }
    list.unshift(entry);
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[EmailService] Outbox logging notice:', err.message);
  }
}

let transporter = null;

/**
 * Initializes the Nodemailer SMTP transporter.
 */
function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASS ||
    SMTP_PASS.includes('placeholder') ||
    SMTP_PASS.includes('your_16_digit')
  ) {
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  } catch (err) {
    console.warn('[EmailService]: Transporter initialization warning:', err.message);
    return null;
  }
}

/**
 * Sends enquiry details to admin email via HTTP relay.
 * Shows ONLY the exact client-entered details: Name, Phone Number, Email, Service Required, Project Details.
 */
async function sendViaRelay(contact, targetEmail) {
  // Construct clean payload with ONLY the fields client submitted
  const cleanPayload = {
    'Name': contact.fullName,
    'Phone Number': contact.phone,
    'Email Address': contact.email,
    'Service Required': contact.service,
    'Project Details': contact.message,
    _subject: `🚀 [MIRAX MEDIA Lead] ${contact.fullName} - ${contact.service}`,
    _template: 'table',
    _captcha: 'false',
  };

  // Only include optional fields if the customer actually provided them
  if (contact.companyName && contact.companyName.trim()) {
    cleanPayload['Company Name'] = contact.companyName.trim();
  }
  if (contact.budget && contact.budget.trim()) {
    cleanPayload['Target Budget'] = contact.budget.trim();
  }

  // Dispatch to BOTH ruppavimal@gmail.com and vimaldigitechzo@gmail.com so neither is missed
  const recipients = [
    'ruppavimal@gmail.com',
    'vimaldigitechzo@gmail.com',
  ];

  let anySuccess = false;

  for (const email of recipients) {
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Referer: 'https://miraxmedia.in',
          Origin: 'https://miraxmedia.in',
        },
        body: JSON.stringify(cleanPayload),
      });

      const result = await response.json().catch(() => ({}));
      if (result.success === 'true' || result.success === true) {
        console.log(`✅ [EmailService]: Lead delivered to ${email}!`);
        anySuccess = true;
      } else {
        console.warn(`[EmailService]: Notice for ${email}:`, result.message);
      }
    } catch (relayError) {
      console.warn(`[EmailService]: Relay error for ${email}:`, relayError.message);
    }
  }

  return { success: anySuccess, method: 'relay' };
}

/**
 * Sends an email notification to ruppavimal@gmail.com when a new client enquiry is submitted.
 * Formats ONLY: Name, Phone Number, Email, Service Required, and Project Details.
 * @param {object} contact - Saved contact record
 */
export async function sendAdminNotification(contact) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com';
  console.log(`[EmailService] Preparing lead notification to: ${adminEmail}`);

  let deliveryStatus = 'RECORDED_IN_OUTBOX';
  let messageId = null;

  // 1. Try Nodemailer if real SMTP credentials are set
  const mailer = getTransporter();
  if (mailer) {
    try {
      const fromAddress =
        process.env.SMTP_FROM || `"MIRAX MEDIA" <${adminEmail}>`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #08060D; color: #FFFFFF; padding: 28px; border-radius: 12px; max-width: 580px; margin: 0 auto; border: 1px solid rgba(139, 61, 255, 0.4);">
          <div style="text-align: center; margin-bottom: 22px;">
            <h1 style="color: #B66BFF; margin: 0; font-size: 22px; letter-spacing: 1px;">MIRAX MEDIA</h1>
            <p style="color: #9E97AA; font-size: 13px; margin-top: 4px;">🚀 New Client Enquiry Received</p>
          </div>

          <div style="background-color: #120D1D; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 18px; margin-bottom: 18px;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #9E97AA; width: 140px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Name:</strong></td>
                <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">${contact.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9E97AA; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Phone No:</strong></td>
                <td style="padding: 10px 0; color: #FFFFFF; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><a href="tel:${contact.phone}" style="color: #FFFFFF; text-decoration: none; font-weight: bold;">${contact.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9E97AA; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Email:</strong></td>
                <td style="padding: 10px 0; color: #B66BFF; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><a href="mailto:${contact.email}" style="color: #B66BFF; text-decoration: none;">${contact.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9E97AA; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Service Required:</strong></td>
                <td style="padding: 10px 0; color: #10B981; font-weight: bold; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">${contact.service}</td>
              </tr>
              ${
                contact.companyName
                  ? `<tr>
                      <td style="padding: 10px 0; color: #9E97AA; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Company Name:</strong></td>
                      <td style="padding: 10px 0; color: #FFFFFF; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">${contact.companyName}</td>
                    </tr>`
                  : ''
              }
              ${
                contact.budget
                  ? `<tr>
                      <td style="padding: 10px 0; color: #9E97AA; border-bottom: 1px solid rgba(255, 255, 255, 0.06);"><strong>Budget:</strong></td>
                      <td style="padding: 10px 0; color: #FFFFFF; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">${contact.budget}</td>
                    </tr>`
                  : ''
              }
            </table>
          </div>

          <div style="background-color: #120D1D; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
            <h3 style="font-size: 14px; margin-top: 0; color: #B66BFF; margin-bottom: 8px;">Project Details:</h3>
            <p style="color: #E2DCED; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${contact.message}</p>
          </div>

          <div style="text-align: center; color: #9E97AA; font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 14px;">
            MIRAX MEDIA Growth Management &bull; Received at ${new Date(contact.createdAt).toLocaleString()}
          </div>
        </div>
      `;

      const info = await mailer.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject: `[New Lead] ${contact.fullName} - ${contact.service}`,
        html: htmlContent,
      });

      console.log(`[EmailService]: Delivered via Gmail SMTP to ${adminEmail} (Msg ID: ${info.messageId})`);
      deliveryStatus = 'DELIVERED_GMAIL_SMTP';
      messageId = info.messageId;
    } catch (smtpError) {
      console.warn(`[EmailService]: Gmail SMTP notice: ${smtpError.message}`);
    }
  }

  // 2. Deliver via relay
  if (deliveryStatus !== 'DELIVERED_GMAIL_SMTP') {
    const relayRes = await sendViaRelay(contact, adminEmail);
    if (relayRes.success) {
      deliveryStatus = relayRes.method === 'relay' ? 'DELIVERED_RELAY' : 'ACTIVATION_PENDING';
    }
  }

  // 3. Log securely to persistent email outbox
  logToEmailOutbox({
    id: contact.id,
    recipient: adminEmail,
    deliveryStatus,
    name: contact.fullName,
    phone: contact.phone,
    email: contact.email,
    serviceRequired: contact.service,
    projectDetails: contact.message,
    sentAt: new Date().toISOString(),
    messageId,
  });

  return { success: true, status: deliveryStatus };
}

/**
 * Sends a confirmation email to the customer after their enquiry has been safely recorded.
 * @param {object} contact - Saved contact record
 */
export async function sendCustomerConfirmation(contact) {
  try {
    const mailer = getTransporter();
    if (!mailer) return { success: false, reason: 'SMTP not configured' };

    const fromAddress =
      process.env.SMTP_FROM ||
      `"MIRAX MEDIA" <${process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com'}>`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #08060D; color: #FFFFFF; padding: 28px; border-radius: 12px; max-width: 580px; margin: 0 auto; border: 1px solid rgba(139, 61, 255, 0.35);">
        <div style="text-align: center; margin-bottom: 22px;">
          <h1 style="color: #B66BFF; margin: 0; font-size: 22px; letter-spacing: 1px;">MIRAX MEDIA</h1>
          <p style="color: #9E97AA; font-size: 13px; margin-top: 4px;">Where Strategy Meets Digital Growth</p>
        </div>

        <h2 style="font-size: 18px; color: #FFFFFF; margin-top: 0;">
          Hi ${contact.fullName}, thank you for reaching out!
        </h2>

        <p style="color: #E2DCED; font-size: 14px; line-height: 1.6;">
          We have received your enquiry regarding <strong style="color: #B66BFF;">${contact.service}</strong>. Our dedicated strategy team is reviewing your project details.
        </p>

        <div style="background-color: #120D1D; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin: 18px 0;">
          <p style="color: #9E97AA; font-size: 13px; margin: 4px 0;"><strong>Service:</strong> ${contact.service}</p>
        </div>

        <div style="background-color: rgba(139, 61, 255, 0.1); border-left: 3px solid #8B3DFF; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
          <p style="color: #D6A5FF; font-size: 13px; margin: 0; line-height: 1.5;">
            <strong>What happens next?</strong> One of our digital marketing specialists will contact you within <strong>24 business hours</strong> to discuss your goals and share a custom roadmap.
          </p>
        </div>

        <p style="color: #E2DCED; font-size: 14px; line-height: 1.6;">
          If you have urgent questions, reply directly to this email or reach us at <a href="mailto:${process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com'}" style="color: #B66BFF; text-decoration: none;">${process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com'}</a>.
        </p>

        <div style="text-align: center; color: #9E97AA; font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; margin-top: 22px;">
          &copy; ${new Date().getFullYear()} MIRAX MEDIA. All rights reserved.
        </div>
      </div>
    `;

    const info = await mailer.sendMail({
      from: fromAddress,
      to: contact.email,
      subject: `We've received your enquiry — MIRAX MEDIA`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
