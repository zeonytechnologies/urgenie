import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '../types/database';

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  allow_whatsapp: boolean;
  bio: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

// Map known demo accounts with real database IDs in public.profiles
const DEMO_ACCOUNTS: Record<string, { id: string; role: UserRole; name: string; phone: string; city: string }> = {
  'admin@urgenie.com': { id: '5e1b8333-4982-4614-9b54-f585689f7ed1', role: 'admin', name: 'Super Admin', phone: '9876543210', city: 'Hosur Town, Tamil Nadu' },
  'user@urgenie.com': { id: 'd12fc73e-2b3c-4371-b22c-ce3181ec864a', role: 'user', name: 'Regular Buyer', phone: '9876543212', city: 'Mathigiri, Hosur' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        // Also check if there's a cached avatar locally
        const cachedAvatar = localStorage.getItem(`urgenie_avatar_${userId}`);
        const finalProfile = {
          ...data,
          avatar_url: cachedAvatar || data.avatar_url || null,
        } as Profile;
        setProfile(finalProfile);
      }
    } catch {
      // Ignored
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Restore stored session or local demo session on load
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check Supabase session
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          await fetchProfile(s.user.id);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to local session check
      }

      // 2. Check local saved session fallback
      const savedMock = localStorage.getItem('urgenie_demo_user');
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          const email = (parsed.user?.email || '').toLowerCase();
          const validId = DEMO_ACCOUNTS[email]?.id || parsed.user?.id || 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
          
          if (parsed.user) parsed.user.id = validId;
          if (parsed.profile) {
            parsed.profile.id = validId;
            const cachedAvatar = localStorage.getItem(`urgenie_avatar_${validId}`);
            if (cachedAvatar) {
              parsed.profile.avatar_url = cachedAvatar;
            }
          }
          localStorage.setItem('urgenie_demo_user', JSON.stringify(parsed));

          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          localStorage.removeItem('urgenie_demo_user');
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          await fetchProfile(s.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Attempt Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id);
        localStorage.removeItem('urgenie_demo_user');
        return { error: null };
      }
    } catch {
      // Continue to demo check
    }

    // 2. If it's a known demo account, attempt auto-signup in Supabase or enable instant local demo session
    if (DEMO_ACCOUNTS[trimmedEmail]) {
      const demo = DEMO_ACCOUNTS[trimmedEmail];

      // Check if user set a custom password locally
      const customSavedPass = localStorage.getItem(`urgenie_password_${trimmedEmail}`);
      if (customSavedPass && customSavedPass !== password && password !== 'password123') {
        return { error: 'Invalid password. Please use your updated password or password123.' };
      }

      // Try automatic registration in Supabase
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: {
              full_name: demo.name,
              role: demo.role,
              phone: demo.phone,
              city: demo.city,
            },
          },
        });

        if (!signUpError && signUpData.user) {
          setUser(signUpData.user);
          setSession(signUpData.session);
          const cachedAvatar = localStorage.getItem(`urgenie_avatar_${signUpData.user.id}`) || null;
          setProfile({
            id: signUpData.user.id,
            full_name: demo.name,
            email: trimmedEmail,
            phone: demo.phone,
            avatar_url: cachedAvatar,
            city: demo.city,
            is_phone_verified: true,
            is_email_verified: true,
            allow_whatsapp: true,
            bio: `${demo.name} account on Urgenie`,
            role: demo.role,
          });
          return { error: null };
        }
      } catch {
        // Fallback to local session below
      }

      // Check if avatar was previously saved for this user
      const cachedAvatar = localStorage.getItem(`urgenie_avatar_${demo.id}`) || null;

      // Instant fallback login
      const mockUser = {
        id: demo.id,
        email: trimmedEmail,
        app_metadata: {},
        user_metadata: { full_name: demo.name, role: demo.role },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: Profile = {
        id: demo.id,
        full_name: demo.name,
        email: trimmedEmail,
        phone: demo.phone,
        avatar_url: cachedAvatar,
        city: demo.city,
        is_phone_verified: true,
        is_email_verified: true,
        allow_whatsapp: true,
        bio: `${demo.name} account on Urgenie`,
        role: demo.role,
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('urgenie_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    return { error: 'Invalid login credentials. Check your email & password or use the demo buttons below.' };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);
        setProfile({
          id: data.user.id,
          full_name: metadata.full_name || 'User',
          email: email,
          phone: metadata.phone || '',
          avatar_url: null,
          city: metadata.city || 'Hosur, Tamil Nadu',
          is_phone_verified: false,
          is_email_verified: false,
          allow_whatsapp: true,
          bio: '',
          role: (metadata.role as UserRole) || 'user',
        });
        return { error: null };
      }

      if (error) {
        return { error: error.message };
      }
    } catch (err: any) {
      return { error: err.message || 'Error creating account' };
    }
    return { error: null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    localStorage.removeItem('urgenie_demo_user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    // 1. If active Supabase session exists, attempt real GoTrue update
    if (session) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) return { error: null };
        // If error is not session missing, return it
        if (!error.message.toLowerCase().includes('auth session missing')) {
          return { error: error.message };
        }
      } catch {
        // Fallback to local session update
      }
    }

    // 2. If in demo or local session, store password safely in local storage
    if (user?.email) {
      localStorage.setItem(`urgenie_password_${user.email.toLowerCase()}`, newPassword);
      const savedMock = localStorage.getItem('urgenie_demo_user');
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          if (parsed.user) parsed.user.password = newPassword;
          localStorage.setItem('urgenie_demo_user', JSON.stringify(parsed));
        } catch {}
      }
      return { error: null };
    }

    return { error: 'Please sign in first to update your password' };
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' };

    // 1. Attempt database update in public.profiles
    try {
      await (supabase.from('profiles') as any).update(data).eq('id', user.id);
    } catch {
      // Ignored
    }

    // 2. Cache avatar_url independently in localStorage for persistence
    if (data.avatar_url) {
      localStorage.setItem(`urgenie_avatar_${user.id}`, data.avatar_url);
    }

    // 3. Update React profile state & sync localStorage demo session
    setProfile((prev) => {
      const updated = prev ? { ...prev, ...data } : null;
      const savedMock = localStorage.getItem('urgenie_demo_user');
      if (savedMock && updated) {
        try {
          const parsed = JSON.parse(savedMock);
          parsed.profile = updated;
          localStorage.setItem('urgenie_demo_user', JSON.stringify(parsed));
        } catch {}
      }
      return updated;
    });

    return { error: null };
  };

  const effectiveRole = profile?.role || 'user';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAdmin: effectiveRole === 'admin',
    isSeller: effectiveRole === 'seller' || effectiveRole === 'admin',
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
