const nodemailer = require('nodemailer');

/**
 * Pure Node.js SMTP Transporter via Nodemailer
 * Configured via standard SMTP environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM
 * Or standard Gmail App Password via SMTP_USER & SMTP_PASS
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || user.trim() === '' || pass.trim() === '') {
    return null;
  }

  // If host is explicitly provided, use custom host/port, else default to standard service or Gmail
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: user.trim(),
        pass: pass.trim()
      }
    });
  }

  // Default Gmail SMTP with explicit connection timeout and port
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, '')
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

/**
 * Send an OTP email using standard Node.js nodemailer
 * @param {string} toEmail 
 * @param {string} otpCode 
 * @param {'registration'|'password-reset'} purpose 
 */
const sendOtpEmail = async (toEmail, otpCode, purpose) => {
  const isReset = purpose === 'password-reset';
  const subject = isReset 
    ? '🔐 PennyWise - Your Password Reset Code' 
    : '🎓 PennyWise - Verify Your Account';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E7E5E4;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #E11D48; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">pennywise</h1>
        <p style="color: #78716C; font-size: 13px; margin-top: 4px;">Smart Financial Workspace</p>
      </div>

      <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E7E5E4; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="font-size: 18px; color: #1C1917; margin-top: 0; margin-bottom: 12px; font-weight: 700;">
          ${isReset ? 'Reset Your Password' : 'Verify Your Email Address'}
        </h2>
        <p style="font-size: 14px; color: #57534E; line-height: 1.5; margin: 0 0 20px 0;">
          ${isReset 
            ? 'We received a request to reset your PennyWise password. Use the verification code below to set a new password:' 
            : 'Welcome to PennyWise! Enter the 6-digit verification code below to complete creating your account:'}
        </p>

        <div style="text-align: center; padding: 18px; background-color: #FFF1F2; border: 1.5px dashed #FDA4AF; border-radius: 10px; margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #E11D48;">
            ${otpCode}
          </span>
        </div>

        <p style="font-size: 12px; color: #A8A29E; line-height: 1.4; margin: 0;">
          ⏱️ This code expires in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #A8A29E;">
        © 2026 PennyWise Financial Engine · Automated Security Notification
      </div>
    </div>
  `;

  const transporter = getTransporter();

  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"PennyWise" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html
      });
      console.log(`[Nodemailer] Successfully sent email to ${toEmail}: ${info.messageId}`);
      return { 
        success: true, 
        deliveredToInbox: true, 
        provider: 'nodemailer', 
        messageId: info.messageId, 
        otpCode 
      };
    } catch (smtpErr) {
      console.error(`[Nodemailer Error] Failed sending to ${toEmail}:`, smtpErr.message);
      // Fallback to console simulation so registration is not blocked during dev
      return {
        success: true,
        deliveredToInbox: false,
        provider: 'nodemailer-error-fallback',
        warning: smtpErr.message,
        otpCode
      };
    }
  }

  // Local console simulation if SMTP credentials not yet provided in .env
  console.log(`\n======================================================`);
  console.log(`[NODE EMAIL CONSOLE] SMTP_USER & SMTP_PASS not set in .env`);
  console.log(`To: ${toEmail}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: >>> [ ${otpCode} ] <<<`);
  console.log(`Valid for 10 minutes`);
  console.log(`======================================================\n`);

  return { 
    success: true, 
    deliveredToInbox: false, 
    provider: 'dev-console', 
    otpCode 
  };
};

/**
 * Send Welcome / Account Creation Confirmation email via Nodemailer
 * @param {string} toEmail 
 * @param {string} userName 
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  const transporter = getTransporter();
  if (!transporter) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E7E5E4;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #E11D48; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">pennywise</h1>
        <p style="color: #78716C; font-size: 13px; margin-top: 4px;">Smart Financial Workspace</p>
      </div>

      <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E7E5E4;">
        <h2 style="font-size: 18px; color: #1C1917; margin-top: 0; margin-bottom: 12px; font-weight: 700;">
          Welcome aboard, ${userName || 'Friend'}! 🎉
        </h2>
        <p style="font-size: 14px; color: #57534E; line-height: 1.6; margin: 0 0 16px 0;">
          Your PennyWise account has been successfully verified and activated. You can now track income, expenses, budgets, and operational ledgers seamlessly.
        </p>
        <div style="margin-top: 20px; padding: 12px; background: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0; font-size: 13px; color: #166534;">
          ✓ Verified Login Email: <strong>${toEmail}</strong>
        </div>
      </div>
    </div>
  `;

  try {
    const fromAddress = process.env.SMTP_FROM || `"PennyWise" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: '🎉 Welcome to PennyWise Financial Hub!',
      html
    });
    console.log(`[Nodemailer] Welcome email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[Nodemailer Welcome Email Error]:`, err.message);
  }
};

module.exports = { 
  sendOtpEmail,
  sendWelcomeEmail 
};
