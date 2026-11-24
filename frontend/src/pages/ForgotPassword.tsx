import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Timer, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { sendPasswordResetOtp, verifyOtpAndResetPassword } from '../utils/otpAuth';

type Step = 'email' | 'otp' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // 10-minute expiry countdown
  const [timeLeft, setTimeLeft] = useState(600);
  // 30-second cooldown for resend button
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Expiry timer countdown
  useEffect(() => {
    if (step !== 'otp' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await sendPasswordResetOtp(trimmedEmail);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to send verification code. Please try again.');
    } else {
      setResetToken(result.resetToken || '');
      setTimeLeft(600); // 10 minutes
      setResendCooldown(30); // 30s cooldown
      setStep('otp');
      setInfoMessage(`We sent a 6-digit verification code to ${trimmedEmail}`);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setInfoMessage(null);
    setResending(true);

    const result = await sendPasswordResetOtp(email);
    setResending(false);

    if (!result.success) {
      setError(result.error || 'Failed to resend verification code.');
    } else {
      setResetToken(result.resetToken || '');
      setTimeLeft(600);
      setResendCooldown(30);
      setInfoMessage('A fresh verification code has been sent to your email.');
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleVerifyAndReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (timeLeft <= 0) {
      setError('Your verification code has expired. Please click "Resend Code" below.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setLoading(true);
    const result = await verifyOtpAndResetPassword({
      email,
      otp: cleanOtp,
      newPassword,
      resetToken,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to reset password. Please check your OTP and try again.');
    } else {
      setStep('success');
    }
  };

  return (
    <div className="container mx-auto px-4 py-14 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200/90 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Global Info Banner */}
        {infoMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200/90 rounded-2xl flex items-start gap-3 text-blue-900 text-xs font-semibold animate-in fade-in">
            <Sparkles className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
            <div className="flex-1">{infoMessage}</div>
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 'email' && (
          <div>
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <KeyRound className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
                Enter your registered email address and we'll send a 6-digit verification code (OTP) to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 py-3 text-sm font-medium"
                    placeholder="e.g. name@example.com"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3.5 text-sm shadow-md font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Get Verification OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500 pt-6 border-t border-slate-100 flex items-center justify-between">
              <Link 
                to="/login" 
                className="font-bold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
              <Link 
                to="/register" 
                className="font-bold text-blue-600 hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER OTP & NEW PASSWORD */}
        {step === 'otp' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Enter Verification OTP
              </h1>
              <div className="mt-2 text-xs text-slate-500 font-medium">
                Sent to <strong className="text-slate-800">{email}</strong>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(null); setInfoMessage(null); }}
                  className="ml-2 text-blue-600 hover:underline font-bold"
                >
                  Change
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {/* 6-Digit OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    6-Digit Verification Code (OTP) <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-extrabold flex items-center gap-1 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                    <Timer className="h-3 w-3" />
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center font-mono text-2xl tracking-[0.35em] py-2.5 font-bold text-blue-900 bg-blue-50/40 border-blue-200 focus:bg-white"
                  placeholder="••••••"
                  autoFocus
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-10 pr-10 py-2.5 text-sm"
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10 py-2.5 text-sm"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || timeLeft <= 0}
                className="btn btn-primary w-full py-3.5 text-sm shadow-md font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Verify OTP & Set New Password</span>
                )}
              </button>
            </form>

            {/* Resend Code Action */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
                className="text-xs font-bold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? (
                  'Resending OTP...'
                ) : resendCooldown > 0 ? (
                  `Resend Code in ${resendCooldown}s`
                ) : (
                  'Didn\'t receive code? Resend OTP'
                )}
              </button>
            </div>

            <div className="mt-8 text-center text-xs text-slate-500 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setStep('email'); setError(null); }}
                className="font-bold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Start over with different email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Password Reset Complete!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mb-8 leading-relaxed max-w-xs mx-auto">
              Your password has been changed successfully. You can now sign in to your URGENIE account using your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full py-3.5 text-sm shadow-md font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
