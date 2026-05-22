'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

async function deriveUserId(uuid: string): Promise<number> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uuid));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  const h   = parseInt(hex.slice(0, 12), 16);
  return 5_000_000_000 + (h % 4_999_999_999);
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [logs, setLogs]   = useState<string[]>([]);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState('');

  const log = (msg: string) => {
    console.log('[callback]', msg);
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    async function run() {
      log('▶ Начало');

      if (!supabase) { setError('❌ supabase = null (env vars не настроены)'); return; }
      log('✓ Supabase клиент OK');

      const params   = new URLSearchParams(window.location.search);
      const urlError = params.get('error_description') || params.get('error');
      if (urlError) { setError('❌ OAuth error: ' + urlError); return; }

      const code = params.get('code');
      log(code ? `✓ code получен: ${code.slice(0,8)}…` : '⚠ code отсутствует (проверяем hash)');

      if (code) {
        log('… exchangeCodeForSession');
        const { error: exchErr } = await supabase!.auth.exchangeCodeForSession(code);
        if (exchErr) { setError('❌ exchangeCodeForSession: ' + exchErr.message); return; }
        log('✓ exchange OK');
      }

      log('… getSession');
      let { data: { session } } = await supabase!.auth.getSession();

      if (!session && window.location.hash) {
        log('… hash flow — ждём onAuthStateChange');
        session = await new Promise((resolve, reject) => {
          const { data: { subscription } } = supabase!.auth.onAuthStateChange((_evt, s) => {
            if (s) { subscription.unsubscribe(); resolve(s); }
          });
          setTimeout(() => { subscription.unsubscribe(); reject(new Error('timeout 10s')); }, 10000);
        }).catch(e => { log('❌ ' + e.message); return null; }) as any;
      }

      if (!session) { setError('❌ Session null — попробуйте ещё раз'); return; }

      const { user } = session;
      log(`✓ session OK — user: ${user.email} (${user.id.slice(0,8)}…)`);

      const userId = await deriveUserId(user.id);
      log(`✓ userId = ${userId}`);

      const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? (user.email ?? '').split('@')[0];
      const firstName = fullName.split(' ')[0];
      const lastName  = fullName.split(' ').slice(1).join(' ') || '';
      const avatar    = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

      auth.setUser({
        id: userId, first_name: firstName, last_name: lastName || undefined,
        username: (user.email ?? '').split('@')[0], photo_url: avatar,
        auth_date: Math.floor(Date.now() / 1000), hash: '',
      });
      log('✓ auth.setUser() вызван');

      const check = auth.isLoggedIn();
      log(`✓ isLoggedIn() = ${check}`);
      const storedId = auth.getUserId();
      log(`✓ getUserId() = ${storedId}`);

      if (!check) {
        setError('❌ isLoggedIn() = false после setUser! Проблема с localStorage.');
        return;
      }

      log('→ Редирект на /onboarding или /dashboard через 2 сек…');
      setDone(true);
      setTimeout(() => router.push('/onboarding'), 2000);
    }

    run().catch(e => setError('❌ Необработанная ошибка: ' + e.message));
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: 13, padding: 24 }}>
      <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 700, color: '#fff' }}>
        🔍 Auth Callback Debug
      </div>
      {logs.map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}
      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#ff3b3033', borderRadius: 8, color: '#ff6b6b', fontWeight: 600 }}>
          {error}
          <br /><br />
          <button onClick={() => router.push('/auth')} style={{ color: '#0f0', background: 'none', border: '1px solid #0f0', padding: '6px 16px', borderRadius: 6, cursor: 'pointer' }}>
            ← Назад
          </button>
        </div>
      )}
      {done && <div style={{ marginTop: 16, color: '#0f0', fontWeight: 700 }}>✅ Успех — редиректим…</div>}
    </main>
  );
}
