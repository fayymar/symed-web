import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Client is null-safe: buttons will be disabled if env vars are missing
// flowType 'pkce': после входа через Google/Apple/email в ссылке приходит только
// одноразовый code, обменять его можно лишь в том браузере, где вход начинался.
// В режиме implicit (по умолчанию) готовые токены приходили бы в #hash ссылки, и
// злоумышленник мог бы прислать ссылку со СВОИМИ токенами и незаметно залогинить
// жертву в свой аккаунт (login CSRF). detectSessionInUrl: false — код обменивается
// только явно на странице /auth/callback.
export const supabase = url && key
  ? createClient(url, key, {
      // autoRefreshToken: false — сессия Supabase нужна только на /auth/callback,
      // чтобы один раз обменять её на токен бэкенда. Фоновое обновление не нужно
      // и могло бы записать сессию обратно в localStorage уже после выхода.
      auth: { flowType: 'pkce', detectSessionInUrl: false, autoRefreshToken: false },
    })
  : null;

export const SUPABASE_CONFIGURED = Boolean(url && key);
