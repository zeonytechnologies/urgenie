import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Shield, UserCheck, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('user@urgenie.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRedirect = new URLSearchParams(location.search).get('redirect');

  const handleSelectRole = (role: 'user' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@urgenie.com');
      setPassword('password123');
    } else {
      setEmail('user@urgenie.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const { error: signInError } = await signIn(trimmedEmail, password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    } else {
      const explicitFrom = (location.state as any)?.from?.pathname || searchRedirect;
      if (explicitFrom) {
        navigate(explicitFrom, { replace: true });
      } else if (trimmedEmail === 'admin@urgenie.com') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle top decoration */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
            selectedRole === 'admin' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`} 
        />

        <div className="text-center mb-6">
          <div 
            className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all ${
              selectedRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {selectedRole === 'admin' ? <Shield className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {selectedRole === 'admin' ? 'Admin Portal Login' : 'User Account Login'}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {selectedRole === 'admin' 
              ? 'Sign in to access admin management and platform controls' 
              : 'Sign in to manage advertisements, favorites, and profile'}
          </p>
        </div>

        {/* Quick Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleSelectRole('user')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'user'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>User Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole('admin')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 pr-4 py-2.5 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10 py-2.5 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn w-full py-3 text-sm shadow-md mt-2 disabled:opacity-50 font-black tracking-wide text-white transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? 'Signing in...' : `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'User'}`}
          </button>
        </form>

        {/* Credentials Info Cards (Admin and User Only) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Fill Credentials (2 Logins Only)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* User Account Card */}
            <button
              type="button"
              onClick={() => handleSelectRole('user')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                selectedRole === 'user'
                  ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700">
                  <UserCheck className="h-3.5 w-3.5" />
                  User Login
                </span>
                {selectedRole === 'user' && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <p className="text-slate-600">
                  <span className="font-bold text-slate-800">Email:</span> user@urgenie.com
                </p>
                <p className="text-slate-600">
                  <span className="font-bold text-slate-800">Password:</span> password123
                </p>
              </div>
            </button>

            {/* Admin Account Card */}
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                selectedRole === 'admin'
                  ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-700">
                  <Shield className="h-3.5 w-3.5" />
                  Admin Login
                </span>
                {selectedRole === 'admin' && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <p className="text-slate-600">
                  <span className="font-bold text-slate-800">Email:</span> admin@urgenie.com
                </p>
                <p className="text-slate-600">
                  <span className="font-bold text-slate-800">Password:</span> password123
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
            Create an account <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
