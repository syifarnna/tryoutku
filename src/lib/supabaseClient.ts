import { createClient } from '@supabase/supabase-js';

const cleanSupabaseUrl = (url: string) => {
  if (!url) return 'https://placeholder.supabase.co';
  let clean = url.trim();
  if (clean.endsWith('/rest/v1')) clean = clean.replace('/rest/v1', '');
  if (clean.endsWith('/rest/v1/')) clean = clean.replace('/rest/v1/', '');
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  if (!clean.startsWith('http')) clean = `https://${clean}`;
  return clean;
};

const getStoredUrl = () => {
  try { return localStorage.getItem('supabase_url') || ''; } catch { return ''; }
};

const getStoredKey = () => {
  try { return localStorage.getItem('supabase_anon_key') || ''; } catch { return ''; }
};

const supabaseUrl = cleanSupabaseUrl(getStoredUrl() || import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = (getStoredKey() || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

