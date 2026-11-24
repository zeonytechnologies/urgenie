import nodemailer from 'nodemailer';
import crypto from 'crypto';

const GMAIL_USER = process.env.GMAIL_USER || 'urgenie2026@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'xluphbykxfatfdfd';
const OTP_SECRET = process.env.OTP_SECRET || 'urgenie-super-secret-otp-signing-key-2026-hosur';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gdqquukuzqpyufecyios.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcXF1dWt1enFweXVmZWN5aW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNDQyMTEsImV4cCI6MjEwNjkyMDIxMX0.NrrO8KeZMb78Q5vsPukYtkTpFgjM4j1dhLuJ0L_OhwE';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { email } = body || {};

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if account exists in Supabase public.profiles
    let accountName = 'Valued User';
    try {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(trimmedEmail)}&select=id,full_name,email`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        }
      });
      if (checkRes.ok) {
        const users = await checkRes.json();
        if (!users || users.length === 0) {
          return res.status(404).json({ error: 'No account found with this email address. Please check your email or register a new account.' });
        }
        if (users[0]?.full_name) {
          accountName = users[0].full_name;
        }
      }
    } catch (dbErr) {
      console.warn('Database lookup notice:', dbErr);
    }

    // Generate 6-digit cryptographically secure OTP
    const otp = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', OTP_SECRET);
    hmac.update(`${trimmedEmail}|${otp}|${expiresAt}`);
    const hash = hmac.digest('hex');

    const resetToken = Buffer.from(JSON.stringify({
      email: trimmedEmail,
      expiresAt,
      hash
    })).toString('base64');

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">URGENIE</h1>
          <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px; font-weight: 600;">Hosur's Local Classifieds & Community Marketplace</p>
        </div>

        <div style="padding: 32px 28px;">
          <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Password Reset Verification</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Hello <strong>${accountName}</strong>,<br/>
            We received a request to reset the password for your URGENIE account associated with <strong>${trimmedEmail}</strong>. Use the 6-digit verification code below to set a new password:
          </p>

          <div style="text-align: center; margin: 28px 0; padding: 22px; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #2563eb; margin-bottom: 8px;">Your One-Time Password (OTP)</div>
            <div style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1e3a8a; padding-left: 10px;">${otp}</div>
            <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 8px;">Valid for 10 minutes only</div>
          </div>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #991b1b; font-size: 12px; margin: 0; font-weight: 500;">
              <strong>Security Warning:</strong> Never share this verification code with anyone. URGENIE staff will never ask for your password or OTP. If you did not request this code, you can safely ignore this email.
            </p>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
            Need help? Contact URGENIE Support at <a href="mailto:urgenie2026@gmail.com" style="color: #2563eb; text-decoration: none;">urgenie2026@gmail.com</a>
          </p>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">Powered by ZeonyTechnologies</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} URGENIE Classifieds. Hosur, Tamil Nadu.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"URGENIE Classifieds" <${GMAIL_USER}>`,
      to: trimmedEmail,
      subject: `URGENIE - ${otp} is your Password Reset Verification Code`,
      html: htmlContent,
      text: `Hello ${accountName},\n\nYour URGENIE password reset verification code is: ${otp}\n\nThis code is valid for 10 minutes.\nIf you did not request this, please ignore this email.\n\nPowered by ZeonyTechnologies`,
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email successfully.',
      resetToken,
      email: trimmedEmail,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      error: error.message || 'Failed to send verification email. Please check your connection and try again.'
    });
  }
}
