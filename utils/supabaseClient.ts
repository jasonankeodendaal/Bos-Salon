import { createClient } from '@supabase/supabase-js';

// Access environment variables. 
// Vercel exposes these as process.env in Node environments or via Vite's import.meta.env if configured.
// Since we are likely in a build environment that might inject these:
const rawSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL;
const supabaseUrl = rawSupabaseUrl ? String(rawSupabaseUrl).replace(/\/rest\/v1\/?$/, '') : undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey)
  : null;