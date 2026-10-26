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

let lastFailureTime = 0;
const OFFLINE_COOLDOWN_MS = 20000; // 20s fast-fail if remote endpoint is unreachable

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options) => {
      // If remote host is known unreachable, fast-fail immediately in 0ms without network hang
      if (Date.now() - lastFailureTime < OFFLINE_COOLDOWN_MS) {
        return Promise.reject(new TypeError('Network fast-circuit'));
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 800);
      return fetch(url, {
        ...options,
        signal: options?.signal || controller.signal,
      })
        .then((res) => {
          lastFailureTime = 0; // Success resets cooldown
          return res;
        })
        .catch((err) => {
          lastFailureTime = Date.now();
          throw err;
        })
        .finally(() => clearTimeout(timer));
    },
  },
});
