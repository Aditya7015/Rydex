const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initialize Brevo / Sendinblue API client
let apiInstance = null;

const initBrevo = () => {
  if (!apiInstance) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Missing BREVO_API_KEY environment variable');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }
  return apiInstance;
};

// OTP Storage (In production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Brevo REST API
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    initBrevo();
    
    const subject = purpose === 'reset' 
      ? 'Rydex - Password Reset OTP'
      : 'Rydex - Email Verification OTP';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4f46e5; background: white; padding: 15px; text-align: center; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Rydex</h1>
            <p>India's Trusted Carpooling Platform</p>
          </div>
          <div class="content">
            <h2>Your Verification Code</h2>
            <p>Hello,</p>
            <p>You requested to ${purpose === 'reset' ? 'reset your password' : 'verify your email address'}.</p>
            <div class="otp-code">${otp}</div>
            <p>This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Rydex. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { 
      name: process.env.BREVO_FROM_NAME, 
      email: process.env.BREVO_FROM_EMAIL 
    };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.replyTo = { email: process.env.BREVO_FROM_EMAIL };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ OTP email sent to ${email}`);
    return { success: true, messageId: response.messageId || null };
    
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Generate and store OTP, then send email
const generateAndStoreOTP = async (email, purpose = 'verification') => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStore.set(email, {
    code: otp,
    expiresAt,
    purpose,
    attempts: 0,
  });
  
  // Log OTP in development for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
  }
  
  const result = await sendOTPEmail(email, otp, purpose);
  return { success: result.success, otp: process.env.NODE_ENV !== 'production' ? otp : undefined };
};

// Verify OTP
const verifyOTP = async (email, enteredOTP, purpose = 'verification') => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { success: false, error: 'OTP not found. Please request a new code.' };
  }
  
  if (storedData.purpose !== purpose) {
    return { success: false, error: 'Invalid OTP purpose.' };
  }
  
  if (storedData.expiresAt < Date.now()) {
    otpStore.delete(email);
    return { success: false, error: 'OTP has expired. Please request a new code.' };
  }
  
  if (storedData.attempts >= 5) {
    otpStore.delete(email);
    return { success: false, error: 'Too many failed attempts. Please request a new code.' };
  }
  
  if (storedData.code !== enteredOTP) {
    storedData.attempts += 1;
    otpStore.set(email, storedData);
    return { success: false, error: `Invalid OTP. ${5 - storedData.attempts} attempts remaining.` };
  }
  
  // OTP verified successfully
  otpStore.delete(email);
  return { success: true, message: 'OTP verified successfully' };
};

// Resend OTP with rate limiting
const resendOTP = async (email, purpose = 'verification') => {
  const storedData = otpStore.get(email);
  
  if (storedData && storedData.lastResendAt) {
    const timeSinceLastResend = Date.now() - storedData.lastResendAt;
    if (timeSinceLastResend < 30000) {
      return { 
        success: false, 
        error: `Please wait ${Math.ceil((30000 - timeSinceLastResend) / 1000)} seconds before requesting again.` 
      };
    }
  }
  
  return await generateAndStoreOTP(email, purpose);
};

module.exports = {
  generateAndStoreOTP,
  verifyOTP,
  resendOTP,
  sendOTPEmail,
};