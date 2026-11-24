/**
 * URGENIE Email OTP Password Reset Client Service
 * Connects to /api/send-otp and /api/reset-password
 * Powered by ZeonyTechnologies
 */

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
  email?: string;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends a 6-digit verification code to the registered email address via Gmail SMTP
 */
export async function sendPasswordResetOtp(email: string): Promise<SendOtpResponse> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { success: false, error: 'Please enter your registered email address.' };
  }

  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: trimmedEmail }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Failed to send code (Status ${res.status}). Please try again.`,
      };
    }

    return {
      success: true,
      message: data.message || 'Verification code sent to your email successfully.',
      resetToken: data.resetToken,
      email: trimmedEmail,
    };
  } catch (err: any) {
    console.error('sendPasswordResetOtp network error:', err);
    return {
      success: false,
      error: 'Network error or service unavailable. Please check your internet connection.',
    };
  }
}

/**
 * Verifies the 6-digit OTP code and updates the user's password in the database
 */
export async function verifyOtpAndResetPassword(params: {
  email: string;
  otp: string;
  newPassword: string;
  resetToken: string;
}): Promise<ResetPasswordResponse> {
  const { email, otp, newPassword, resetToken } = params;

  if (!email || !otp || !newPassword || !resetToken) {
    return { success: false, error: 'All fields are required.' };
  }

  const cleanOtp = otp.trim().replace(/\D/g, '');
  if (cleanOtp.length !== 6) {
    return { success: false, error: 'Please enter the 6-digit verification code sent to your email.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  try {
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword,
        resetToken,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to verify code or update password. Please try again.',
      };
    }

    // Also update locally cached credentials if this user exists in localStorage
    try {
      const trimmedEmail = email.trim().toLowerCase();
      localStorage.setItem(`urgenie_password_${trimmedEmail}`, newPassword);

      const savedAccount = localStorage.getItem(`urgenie_account_${trimmedEmail}`);
      if (savedAccount) {
        const parsed = JSON.parse(savedAccount);
        parsed.password = newPassword;
        if (parsed.profile) parsed.profile.password = newPassword;
        localStorage.setItem(`urgenie_account_${trimmedEmail}`, JSON.stringify(parsed));
      }

      const currentAuth = localStorage.getItem('urgenie_auth_user');
      if (currentAuth) {
        const parsedAuth = JSON.parse(currentAuth);
        if (parsedAuth.profile && parsedAuth.profile.email?.toLowerCase() === trimmedEmail) {
          parsedAuth.profile.password = newPassword;
          localStorage.setItem('urgenie_auth_user', JSON.stringify(parsedAuth));
        }
      }
    } catch {}

    return {
      success: true,
      message: data.message || 'Password reset successfully! You can now sign in.',
    };
  } catch (err: any) {
    console.error('verifyOtpAndResetPassword network error:', err);
    return {
      success: false,
      error: 'Network connection failed. Please check your connection and try again.',
    };
  }
}

