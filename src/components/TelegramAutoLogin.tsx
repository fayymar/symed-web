'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: { user?: { id: number } };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

/**
 * Если сайт открыт внутри Telegram (как Mini App из бота), входим автоматически:
 * отправляем подписанную Telegram строку initData на бэкенд и получаем токен.
 * Пользователю не нужно вводить код. В обычном браузере компонент ничего не делает.
 */
export function TelegramAutoLogin() {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) return;
    tg.ready();
    tg.expand();

    const tgUserId = tg.initDataUnsafe?.user?.id;
    // Уже вошли этим же Telegram-аккаунтом — ничего не делаем
    if (auth.isLoggedIn() && tgUserId && auth.getUserId() === tgUserId) return;

    let cancelled = false;
    setBusy(true); // eslint-disable-line react-hooks/set-state-in-effect
    api.telegramWebAppLogin(tg.initData)
      .then((data) => {
        if (cancelled || !data?.token) return;
        auth.setUser({
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || undefined,
          username: data.username || undefined,
          photo_url: data.photo_url || undefined,
          auth_date: Math.floor(Date.now() / 1000),
          hash: '',
        }, data.token);
        if (pathname === '/' || pathname.startsWith('/auth')) router.replace('/dashboard');
        else router.refresh();
      })
      .catch(() => { /* не удалось — пользователь сможет войти по коду */ })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
    // Выполняем один раз при открытии Mini App
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!busy) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--s-bg)',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--s-text-secondary)' }}>
        <Loader2 size={32} style={{ color: 'var(--s-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p>Входим через Telegram…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
