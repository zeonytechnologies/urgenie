import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseUrl = rawUrl ? rawUrl.trim().replace(/\/+$/, '') : '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Create a .env file in /frontend with:\n' +
    '  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
