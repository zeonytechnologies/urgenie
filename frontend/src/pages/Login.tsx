import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Shield, Store, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRedirect = new URLSearchParams(location.search).get('redirect');
  const from = (location.state as any)?.from?.pathname || searchRedirect || '/profile';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleQuickRoleFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your advertisements, favorites, and profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-900">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
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
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-base shadow-sm mt-2 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Roles Helper */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 font-medium mb-3 uppercase tracking-wider">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRoleFill('admin@urgenie.com')}
              className="px-2 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex flex-col items-center gap-1 border border-purple-200 transition-colors"
            >
              <Shield className="h-4 w-4 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleFill('seller@urgenie.com')}
              className="px-2 py-2 rounded-xl bg-brand-light/40 text-brand hover:bg-brand-light text-xs font-semibold flex flex-col items-center gap-1 border border-brand-light transition-colors"
            >
              <Store className="h-4 w-4 text-brand" />
              <span>Seller</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleFill('user@urgenie.com')}
              className="px-2 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold flex flex-col items-center gap-1 border border-gray-200 transition-colors"
            >
              <UserCheck className="h-4 w-4 text-gray-600" />
              <span>User</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline inline-flex items-center gap-1">
            Create an account <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
