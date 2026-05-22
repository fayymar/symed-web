'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); return; }

    async function handleCallback() {
      try {
        // PKCE flow: exchange the `code` query param for a session
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');

        if (code) {
          const { error: exchErr } = await supabase!.auth.exchangeCodeForSession(code);
          if (exchErr) throw exchErr;
        }

        // Now fetch the session (also covers implicit / hash flow)
        let { data: { session }, error: sessErr } = await supabase!.auth.getSession();
        if (sessErr) throw sessErr;

        // If still no session, wait for onAuthStateChange (hash-based flow)
        if (!session) {
          session = await new Promise((resolve, reject) => {
            const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, s) => {
              if (s) { subscription.unsubscribe(); resolve(s); }
            });
            setTimeout(() => { subscription.unsubscribe(); reject(new Error('Session timeout')); }, 10000);
          });
        }

        if (!session) throw new Error('No session after exchange');

        const { user }  = session;
        const email     = user.email ?? '';
        const name      = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0];
        const provider  = user.app_metadata?.provider ?? 'email';
        const avatar    = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

        // Register / find user on our backend
        const res  = await fetch(`${API_BASE}/api/auth/social`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ provider, email, name, provider_id: user.id, avatar }),
        });
        const data = await res.json();
        if (!data.id) throw new Error('No user id returned');

        auth.setUser({
          id:         data.id,
          first_name: data.first_name ?? name,
          last_name:  data.last_name  ?? undefined,
          username:   data.username   ?? undefined,
          photo_url:  avatar,
          auth_date:  Math.floor(Date.now() / 1000),
          hash:       '',
        });

        router.push('/dashboard');
      } catch (e: any) {
        console.error('Auth callback error:', e);
        setError(e?.message ?? 'Ошибка авторизации. Попробуйте ещё раз.');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-bg)' }}>
      {error ? (
        <div style={{ textAlign: 'center', color: 'var(--s-text)' }}>
          <AlertCircle size={32} style={{ color: '#ff3b30', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={() => router.push('/auth')}
            style={{ marginTop: 16, color: 'var(--s-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            ← Вернуться
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--s-text-secondary)' }}>
          <Loader2 size={32} style={{ color: 'var(--s-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>Входим в Symed…</p>
        </div>
      )}
    </main>
  );
}
