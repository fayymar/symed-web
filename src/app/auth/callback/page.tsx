'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

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

        // PKCE: обмениваем одноразовый code на сессию. Токены из #hash ссылки
        // не принимаем — так нельзя подсунуть чужую сессию готовой ссылкой.
        const code = params.get('code');
        if (code) {
          const { error: e } = await supabase!.auth.exchangeCodeForSession(code);
          if (e) throw e;
        }
        if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);

        const { data: { session } } = await supabase!.auth.getSession();
        if (!session) throw new Error('Сессия не получена. Попробуйте ещё раз.');

        // Бэкенд сам проверяет access_token у Supabase и выдаёт свой токен сессии
        const data = await api.socialLogin(session.access_token);
        if (!data?.token || !data?.id) throw new Error('Сервер не подтвердил вход. Попробуйте ещё раз.');

        auth.setUser({
          id:         data.id,
          first_name: data.first_name || '',
          last_name:  data.last_name || undefined,
          username:   (data.email || '').split('@')[0] || undefined,
          photo_url:  data.photo_url || undefined,
          auth_date:  Math.floor(Date.now() / 1000),
          hash:       '',
        }, data.token);

        router.push(data.is_new ? '/onboarding' : '/dashboard');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : undefined;
        setError(message ?? 'Ошибка авторизации');
      }
    }

    run();
  }, [router]);

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
