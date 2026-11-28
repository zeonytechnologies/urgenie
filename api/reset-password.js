import crypto from 'crypto';

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
    const { email, otp, newPassword, resetToken } = body || {};

    if (!email || !otp || !newPassword || !resetToken) {
      return res.status(400).json({ error: 'All fields (email, verification code, new password) are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim().replace(/\s/g, '');

    if (cleanOtp.length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit verification code.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    // Decode and verify resetToken
    let tokenData;
    try {
      const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid or corrupted reset token. Please request a new code.' });
    }

    const { email: tokenEmail, expiresAt, hash } = tokenData;

    if (tokenEmail !== trimmedEmail) {
      return res.status(400).json({ error: 'Email does not match reset token.' });
    }

    if (Date.now() > expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Verify HMAC
    const hmac = crypto.createHmac('sha256', OTP_SECRET);
    hmac.update(`${trimmedEmail}|${cleanOtp}|${expiresAt}`);
    const expectedHash = hmac.digest('hex');

    if (hash !== expectedHash) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
    }

    // Update password in Supabase public.profiles
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(trimmedEmail)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        password: newPassword,
        updated_at: new Date().toISOString()
      })
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      console.error('Supabase update error:', patchRes.status, errText);
      return res.status(500).json({ error: 'Failed to update password in database. Please try again.' });
    }

    const updatedProfiles = await patchRes.json();
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new password.',
      updated: updatedProfiles && updatedProfiles.length > 0
    });
  } catch (error) {
    console.error('Error verifying OTP and resetting password:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while resetting your password.'
    });
  }
}
