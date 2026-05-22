'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

/** SHA-256 → same algo as Python server */
async function deriveUserId(uuid: string): Promise<number> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uuid));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const h   = parseInt(hex.slice(0, 12), 16);
  return 5_000_000_000 + (h % 4_999_999_999);
}

/** Fire-and-forget backend sync — runs after user is already logged in */
async function syncWithBackend(provider: string, email: string, fullName: string, supabaseId: string, avatar: string | null) {
  try {
    await fetch(`${API_BASE}/api/auth/social`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ provider, email, name: fullName, provider_id: supabaseId, avatar }),
    });
  } catch (_) { /* backend unavailable — will sync next login */ }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); return; }

    async function handleCallback() {
      try {
        // 1. Check for OAuth errors
        const params   = new URLSearchParams(window.location.search);
        const urlError = params.get('error_description') || params.get('error');
        if (urlError) throw new Error(urlError);

        // 2. PKCE code exchange
        const code = params.get('code');
        if (code) {
          const { error: exchErr } = await supabase!.auth.exchangeCodeForSession(code);
          if (exchErr) throw exchErr;
        }

        // 3. Get session
        let { data: { session } } = await supabase!.auth.getSession();

        if (!session && window.location.hash) {
          session = await new Promise((resolve, reject) => {
            const { data: { subscription } } = supabase!.auth.onAuthStateChange((_evt, s) => {
              if (s) { subscription.unsubscribe(); resolve(s); }
            });
            setTimeout(() => { subscription.unsubscribe(); reject(new Error('Timeout сессии')); }, 10000);
          });
        }
        if (!session) throw new Error('Сессия не получена. Попробуйте ещё раз.');

        const { user } = session;
        const email    = user.email ?? '';
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0];
        const provider = user.app_metadata?.provider ?? 'google';
        const avatar   = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

        // 4. Derive user ID via SHA-256 (same as server) — instant, no network
        const userId    = await deriveUserId(user.id);
        const firstName = fullName.split(' ')[0] || fullName;
        const lastName  = fullName.split(' ').slice(1).join(' ') || '';

        // 5. Check if this is a known user (already has profile in localStorage with same ID)
        const existingId = auth.getUserId();
        const isReturning = existingId === userId;

        // 6. Log user in IMMEDIATELY — no waiting for backend
        auth.setUser({
          id:         userId,
          first_name: firstName,
          last_name:  lastName || undefined,
          username:   email.split('@')[0],
          photo_url:  avatar,
          auth_date:  Math.floor(Date.now() / 1000),
          hash:       '',
        });

        // 7. Sync profile with backend in the background (non-blocking)
        syncWithBackend(provider, email, fullName, user.id, avatar);

        // 8. Redirect: new users → onboarding, returning → dashboard
        router.push(isReturning ? '/dashboard' : '/onboarding');
      } catch (e: any) {
        console.error('OAuth callback error:', e);
        setError(e?.message ?? 'Неизвестная ошибка авторизации');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-bg)' }}>
      {error ? (
        <div style={{ textAlign: 'center', color: 'var(--s-text)', maxWidth: 360, padding: '0 24px' }}>
          <AlertCircle size={32} style={{ color: '#ff3b30', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Ошибка авторизации</p>
          <p style={{ color: 'var(--s-text-secondary)', fontSize: 14, marginBottom: 16 }}>{error}</p>
          <button onClick={() => router.push('/auth')}
            style={{ color: 'var(--s-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            ← Попробовать снова
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--s-text-secondary)' }}>
          <Loader2 size={32} style={{ color: 'var(--s-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>Входим в Symed…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </main>
  );
}
