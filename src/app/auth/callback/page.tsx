'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError]   = useState('');
  const [status, setStatus] = useState('Обрабатываем авторизацию…');

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); return; }

    async function handleCallback() {
      try {
        // 1. PKCE: exchange code query param
        const params  = new URLSearchParams(window.location.search);
        const code    = params.get('code');
        const urlError = params.get('error_description') || params.get('error');
        if (urlError) throw new Error(urlError);

        if (code) {
          setStatus('Обмениваем код сессии…');
          const { error: exchErr } = await supabase!.auth.exchangeCodeForSession(code);
          if (exchErr) throw exchErr;
        }

        // 2. Get session
        setStatus('Получаем сессию…');
        let { data: { session } } = await supabase!.auth.getSession();

        // Fallback: implicit / hash flow
        if (!session && window.location.hash) {
          session = await new Promise((resolve, reject) => {
            const { data: { subscription } } = supabase!.auth.onAuthStateChange((_evt, s) => {
              if (s) { subscription.unsubscribe(); resolve(s); }
            });
            setTimeout(() => { subscription.unsubscribe(); reject(new Error('Timeout ожидания сессии')); }, 10000);
          });
        }

        if (!session) throw new Error('Сессия не получена. Попробуйте ещё раз.');

        const { user } = session;
        const email    = user.email ?? '';
        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0];
        const provider = user.app_metadata?.provider ?? 'google';
        const avatar   = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

        // 3. Backend: register / find user
        setStatus('Создаём профиль…');
        let userId: number | null = null;
        let firstName = fullName.split(' ')[0] || fullName;
        let lastName  = fullName.split(' ').slice(1).join(' ') || '';
        let isNew     = false;

        try {
          const res = await fetch(`${API_BASE}/api/auth/social`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ provider, email, name: fullName, provider_id: user.id, avatar }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.id) {
              userId    = data.id;
              firstName = data.first_name ?? firstName;
              lastName  = data.last_name  ?? lastName;
              isNew     = Boolean(data.is_new);
            }
          }
        } catch (_) { /* backend unavailable */ }

        // Fallback: derive stable ID locally
        if (!userId) {
          let hash = 0;
          for (let i = 0; i < user.id.length; i++) hash = (hash * 31 + user.id.charCodeAt(i)) >>> 0;
          userId = 5_000_000_000 + (hash % 4_999_999_999);
          isNew  = true; // can't confirm from backend, treat as new
        }

        auth.setUser({
          id:         userId,
          first_name: firstName,
          last_name:  lastName || undefined,
          username:   email.split('@')[0],
          photo_url:  avatar,
          auth_date:  Math.floor(Date.now() / 1000),
          hash:       '',
        });

        // New users → onboarding; returning users → dashboard
        router.push(isNew ? '/onboarding' : '/dashboard');
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
          <p>{status}</p>
        </div>
      )}
    </main>
  );
}
