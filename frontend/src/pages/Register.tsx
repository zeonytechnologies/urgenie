import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, AlertCircle, CheckCircle2, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/database';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Hosur Town, Tamil Nadu');
  const [role, setRole] = useState<UserRole>('user');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password, {
      full_name: fullName,
      phone,
      city,
      role,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2500);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-gray-500 text-sm">Join URGENIE to buy, sell, and discover locally in Hosur</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 text-sm mb-6">
              Welcome aboard, {fullName}! Logging you into your dashboard...
            </p>
            <Link to="/profile" className="btn btn-primary w-full py-3 inline-flex items-center justify-center">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector (Role) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">I want to register as:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    role === 'user'
                      ? 'border-brand bg-brand-light/30 text-brand ring-1 ring-brand font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Buyer / User</div>
                    <div className="text-xs opacity-75">Browse & contact</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    role === 'seller'
                      ? 'border-brand bg-brand-light/30 text-brand ring-1 ring-brand font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Store className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold">Seller / Business</div>
                    <div className="text-xs opacity-75">Post ads & sell</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-10 py-2.5"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mobile Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10 py-2.5"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 py-2.5"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">City / Region *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field pl-10 py-2.5"
                >
                  <option value="Hosur Town, Tamil Nadu">Hosur Town, Tamil Nadu</option>
                  <option value="SIPCOT Phase 1, Hosur">SIPCOT Phase 1, Hosur</option>
                  <option value="Mathigiri, Hosur">Mathigiri, Hosur</option>
                  <option value="Bagalur Road, Hosur">Bagalur Road, Hosur</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 py-2.5"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base shadow-sm mt-4 font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
