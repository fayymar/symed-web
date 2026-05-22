'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

async function deriveUserId(uuid: string): Promise<number> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uuid));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return 5_000_000_000 + (parseInt(hex.slice(0, 12), 16) % 4_999_999_999);
}

async function syncWithBackend(provider: string, email: string, fullName: string, supabaseId: string, avatar: string | null) {
  try {
    await fetch(`${API_BASE}/api/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name: fullName, provider_id: supabaseId, avatar }),
    });
  } catch (_) {}
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); return; }

    async function run() {
      try {
        const params   = new URLSearchParams(window.location.search);
        const urlError = params.get('error_description') || params.get('error');
        if (urlError) throw new Error(urlError);

        // PKCE exchange
        const code = params.get('code');
        if (code) {
          const { error: e } = await supabase!.auth.exchangeCodeForSession(code);
          if (e) throw e;
        }

        // Get session
        let { data: { session } } = await supabase!.auth.getSession();

        if (!session && window.location.hash) {
          session = await new Promise((resolve, reject) => {
            const { data: { subscription } } = supabase!.auth.onAuthStateChange((_evt, s) => {
              if (s) { subscription.unsubscribe(); resolve(s); }
            });
            setTimeout(() => { subscription.unsubscribe(); reject(new Error('Timeout')); }, 8000);
          });
        }
        if (!session) throw new Error('Сессия не получена. Попробуйте ещё раз.');

        const { user }  = session;
        const email     = user.email ?? '';
        const fullName  = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0];
        const provider  = user.app_metadata?.provider ?? 'google';
        const avatar    = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;
        const userId    = await deriveUserId(user.id);
        const isNew     = auth.getUserId() !== userId;

        auth.setUser({
          id:         userId,
          first_name: fullName.split(' ')[0] || fullName,
          last_name:  fullName.split(' ').slice(1).join(' ') || undefined,
          username:   email.split('@')[0],
          photo_url:  avatar,
          auth_date:  Math.floor(Date.now() / 1000),
          hash:       '',
        });

        // Sync with backend in background — don't block login
        syncWithBackend(provider, email, fullName, user.id, avatar);

        router.push(isNew ? '/onboarding' : '/dashboard');
      } catch (e: any) {
        setError(e?.message ?? 'Ошибка авторизации');
      }
    }

    run();
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-bg)' }}>
      {error ? (
        <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 24px' }}>
          <AlertCircle size={32} style={{ color: '#ff3b30', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: 'var(--s-text)', marginBottom: 8 }}>Ошибка авторизации</p>
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
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </main>
  );
}
