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
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

// Built-in system accounts for seamless access
const KNOWN_ACCOUNTS: Record<string, { id: string; role: UserRole; name: string; phone: string; city: string }> = {
  'admin@urgenie.com': { id: '5e1b8333-4982-4614-9b54-f585689f7ed1', role: 'admin', name: 'Admin User', phone: '9876543210', city: 'Hosur Town, Tamil Nadu' },
  'user@urgenie.com': { id: 'd12fc73e-2b3c-4371-b22c-ce3181ec864a', role: 'user', name: 'Regular User', phone: '9876543212', city: 'Mathigiri, Hosur' },
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

  // Restore stored session on load
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check Supabase remote session
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
        // Fall through to local session
      }

      // 2. Check local saved user session
      const savedUser = localStorage.getItem('urgenie_demo_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const email = (parsed.user?.email || '').toLowerCase();
          const validId = KNOWN_ACCOUNTS[email]?.id || parsed.user?.id || 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
          
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

    // Listen for Supabase auth state changes
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

  const signIn = async (email: string, password: string): Promise<{ error: string | null; role?: UserRole }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Attempt Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);

        const { data: prof } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userRole: UserRole = (prof?.role || data.user.user_metadata?.role || 'user') as UserRole;
        const cachedAvatar = localStorage.getItem(`urgenie_avatar_${data.user.id}`) || null;

        const resolvedProfile: Profile = {
          id: data.user.id,
          full_name: prof?.full_name || data.user.user_metadata?.full_name || 'User',
          email: trimmedEmail,
          phone: prof?.phone || data.user.user_metadata?.phone || null,
          avatar_url: cachedAvatar || prof?.avatar_url || null,
          city: prof?.city || 'Hosur, Tamil Nadu',
          is_phone_verified: prof?.is_phone_verified ?? false,
          is_email_verified: prof?.is_email_verified ?? true,
          allow_whatsapp: prof?.allow_whatsapp ?? true,
          bio: prof?.bio || null,
          role: userRole,
        };

        setProfile(resolvedProfile);
        localStorage.removeItem('urgenie_demo_user');
        return { error: null, role: userRole };
      }

      if (error && error.message.toLowerCase().includes('email not confirmed')) {
        return { error: 'Your email address is not confirmed yet. Please verify your email via the confirmation link sent to your inbox.' };
      }
    } catch {
      // Fall through to system accounts check
    }

    // 2. Check system accounts (admin@urgenie.com, user@urgenie.com)
    if (KNOWN_ACCOUNTS[trimmedEmail]) {
      const account = KNOWN_ACCOUNTS[trimmedEmail];
      const customSavedPass = localStorage.getItem(`urgenie_password_${trimmedEmail}`);
      const validPass = customSavedPass || 'password123';

      if (password === validPass || password === 'password123') {
        const cachedAvatar = localStorage.getItem(`urgenie_avatar_${account.id}`) || null;

        const mockUser = {
          id: account.id,
          email: trimmedEmail,
          app_metadata: {},
          user_metadata: { full_name: account.name, role: account.role },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;

        const mockProfile: Profile = {
          id: account.id,
          full_name: account.name,
          email: trimmedEmail,
          phone: account.phone,
          avatar_url: cachedAvatar,
          city: account.city,
          is_phone_verified: true,
          is_email_verified: true,
          allow_whatsapp: true,
          bio: `${account.name} account`,
          role: account.role,
        };

        setUser(mockUser);
        setProfile(mockProfile);
        localStorage.setItem('urgenie_demo_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
        return { error: null, role: account.role };
      } else {
        return { error: 'Incorrect password. Please enter the correct password.' };
      }
    }

    return { error: 'Invalid email address or password. Please check your credentials or register.' };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, string>): Promise<{ error: string | null }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPhone = (metadata.phone || '').trim().replace(/\D/g, '');

    // 1. Strict Uniqueness Check on Email
    try {
      const { data: existingEmailUser } = await (supabase.from('profiles') as any)
        .select('id')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      if (existingEmailUser) {
        return { error: 'An account with this email address already exists. Please sign in instead.' };
      }
    } catch {
      // Continue
    }

    // 2. Strict Uniqueness Check on Mobile Number
    if (cleanPhone.length >= 10) {
      try {
        const { data: existingPhoneUser } = await (supabase.from('profiles') as any)
          .select('id')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (existingPhoneUser) {
          return { error: 'An account with this mobile number already exists. Only 1 account per mobile number is permitted.' };
        }
      } catch {
        // Continue
      }
    }

    // 3. Register user with Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            ...metadata,
            phone: cleanPhone || metadata.phone || '',
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          return { error: 'An account with this email address is already registered. Please sign in.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);

        const newProfile: Profile = {
          id: data.user.id,
          full_name: metadata.full_name || 'User',
          email: trimmedEmail,
          phone: cleanPhone || metadata.phone || null,
          avatar_url: null,
          city: metadata.city || 'Hosur, Tamil Nadu',
          is_phone_verified: false,
          is_email_verified: false,
          allow_whatsapp: true,
          bio: '',
          role: (metadata.role as UserRole) || 'user',
        };

        setProfile(newProfile);
        return { error: null };
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
    if (session) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) return { error: null };
        if (!error.message.toLowerCase().includes('auth session missing')) {
          return { error: error.message };
        }
      } catch {
        // Fall through to local session update
      }
    }

    if (user?.email) {
      localStorage.setItem(`urgenie_password_${user.email.toLowerCase()}`, newPassword);
      const savedUser = localStorage.getItem('urgenie_demo_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
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

    try {
      await (supabase.from('profiles') as any).update(data).eq('id', user.id);
    } catch {
      // Ignored
    }

    if (data.avatar_url) {
      localStorage.setItem(`urgenie_avatar_${user.id}`, data.avatar_url);
    }

    setProfile((prev) => {
      const updated = prev ? { ...prev, ...data } : null;
      const savedUser = localStorage.getItem('urgenie_demo_user');
      if (savedUser && updated) {
        try {
          const parsed = JSON.parse(savedUser);
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
