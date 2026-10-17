const { Resend } = require('resend');

// Initialize Resend if API key is present in environment
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Send an OTP email using Resend (free tier) with graceful console fallback
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

  const resend = getResendClient();

  if (resend) {
    try {
      // By default with Resend free tier on onboarding domain, sender is onboarding@resend.dev
      const sender = process.env.EMAIL_FROM || 'PennyWise Security <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: sender,
        to: toEmail,
        subject,
        html
      });
      console.log(`[Resend] OTP email sent successfully to ${toEmail}:`, result);
      return { success: true, provider: 'resend', id: result.id };
    } catch (err) {
      console.error(`[Resend Error] Failed to send via Resend API:`, err.message);
      console.log(`[DEV OTP FALLBACK] OTP for ${toEmail} is: [ ${otpCode} ]`);
      return { success: true, provider: 'fallback-console', warning: err.message };
    }
  } else {
    // If RESEND_API_KEY is not yet added in .env, log visibly for seamless local dev & testing
    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL SIMULATION] RESEND_API_KEY not configured in .env`);
    console.log(`To: ${toEmail}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: >>> [ ${otpCode} ] <<<`);
    console.log(`Valid for 10 minutes`);
    console.log(`======================================================\n`);
    return { success: true, provider: 'dev-console' };
  }
};

module.exports = { sendOtpEmail };
