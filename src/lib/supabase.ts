import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Client is null-safe: buttons will be disabled if env vars are missing
export const supabase = url && key ? createClient(url, key) : null;

export const SUPABASE_CONFIGURED = Boolean(url && key);
