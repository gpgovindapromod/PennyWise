const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize Resend if API key is present in environment
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey);
};

// Initialize Nodemailer SMTP transporter (Gmail or any custom SMTP)
const getSmtpTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && user.trim() !== '' && pass.trim() !== '') {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: user.trim(),
        pass: pass.trim()
      }
    });
  }
  return null;
};

/**
 * Send an OTP email to any recipient
 * Priority:
 * 1. SMTP / Gmail App Password (delivers to ANY real user email without domain restrictions)
 * 2. Resend API (delivers to verified recipient or custom domain)
 * 3. Fallback console logging for dev
 * 
 * @param {string} toEmail 
 * @param {string} otpCode 
 * @param {'registration'|'password-reset'} purpose 
 */
const sendOtpEmail = async (toEmail, otpCode, purpose) => {
  const isReset = purpose === 'password-reset';
  const subject = isReset 
    ? '🔐 PennyWise - Your Password Reset Code' 
    : '🎓 PennyWise - Verify Your Student Account';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background-color: #FAFAF9; border-radius: 16px; border: 1px solid #E7E5E4;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #9F1239; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">pennywise</h1>
        <p style="color: #78716C; font-size: 13px; margin-top: 4px;">Smart Student Financial Ledger</p>
      </div>

      <div style="background-color: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E7E5E4; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="font-size: 18px; color: #1C1917; margin-top: 0; margin-bottom: 12px; font-weight: 700;">
          ${isReset ? 'Reset Your Password' : 'Verify Your Email Address'}
        </h2>
        <p style="font-size: 14px; color: #57534E; line-height: 1.5; margin: 0 0 20px 0;">
          ${isReset 
            ? 'We received a request to reset your PennyWise password. Use the verification code below to set a new password:' 
            : 'Welcome to PennyWise! Enter the 6-digit verification code below to complete creating your student profile:'}
        </p>

        <div style="text-align: center; padding: 18px; background-color: #FFF1F2; border: 1.5px dashed #FDA4AF; border-radius: 10px; margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #9F1239;">
            ${otpCode}
          </span>
        </div>

        <p style="font-size: 12px; color: #A8A29E; line-height: 1.4; margin: 0;">
          ⏱️ This code expires in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #A8A29E;">
        © 2026 PennyWise Student Financial Engine · Automated Security Notification
      </div>
    </div>
  `;

  // OPTION 1: SMTP Transporter (e.g. Gmail App Password - allows emailing ANY user)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"PennyWise" <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html
      });
      console.log(`[SMTP] Successfully sent OTP email to ${toEmail}: ${info.messageId}`);
      return { 
        success: true, 
        deliveredToInbox: true, 
        provider: 'smtp', 
        messageId: info.messageId,
        otpCode 
      };
    } catch (smtpErr) {
      console.error(`[SMTP Error] Failed sending to ${toEmail}:`, smtpErr.message);
      // Fall through to Resend or fallback
    }
  }

  // OPTION 2: Resend API
  const resend = getResendClient();
  if (resend) {
    try {
      const sender = process.env.EMAIL_FROM || 'PennyWise Security <onboarding@resend.dev>';
      const response = await resend.emails.send({
        from: sender,
        to: toEmail,
        subject,
        html
      });

      if (response.error) {
        console.warn(`[Resend Notice] ${response.error.message}`);
        console.log(`[OTP CONSOLE FALLBACK] OTP for ${toEmail} is: >>> [ ${otpCode} ] <<<`);
        return { 
          success: true, 
          deliveredToInbox: false, 
          provider: 'resend-fallback', 
          warning: response.error.message,
          otpCode 
        };
      }

      console.log(`[Resend] OTP email delivered to ${toEmail}:`, response.data);
      return { success: true, deliveredToInbox: true, provider: 'resend', id: response.data?.id, otpCode };
    } catch (err) {
      console.warn(`[Resend Network Error]`, err.message);
      console.log(`[OTP CONSOLE FALLBACK] OTP for ${toEmail} is: >>> [ ${otpCode} ] <<<`);
      return { 
        success: true, 
        deliveredToInbox: false, 
        provider: 'resend-fallback', 
        warning: err.message,
        otpCode 
      };
    }
  }

  // OPTION 3: Development console simulation
  console.log(`\n======================================================`);
  console.log(`[DEV EMAIL SIMULATION] No active SMTP or Resend credentials`);
  console.log(`To: ${toEmail}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP Code: >>> [ ${otpCode} ] <<<`);
  console.log(`Valid for 10 minutes`);
  console.log(`======================================================\n`);
  return { success: true, deliveredToInbox: false, provider: 'dev-console', otpCode };
};

module.exports = { sendOtpEmail };
