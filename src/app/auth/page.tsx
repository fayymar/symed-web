'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, TelegramUser } from '@/lib/auth';
import { api } from '@/lib/api';

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

type Status = 'idle' | 'waiting' | 'success' | 'error';

export default function AuthPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRef = useRef('');

  useEffect(() => {
    if (auth.isLoggedIn()) { router.push('/dashboard'); return; }
    const newCode = generateCode();
    setCode(newCode);
    codeRef.current = newCode;
    api.requestAuthCode(newCode)
      .then(() => setStatus('waiting'))
      .catch(() => setErrorMsg('Не удалось связаться с сервером. Обновите страницу.'));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [router]);

  useEffect(() => {
    if (status !== 'waiting') return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.checkAuthStatus(codeRef.current);
        if (data.verified) {
          clearInterval(pollRef.current!);
          const user: TelegramUser = {
            id: data.id, first_name: data.first_name || '',
            last_name: data.last_name, username: data.username,
            photo_url: data.photo_url, auth_date: data.auth_date, hash: '',
          };
          auth.setUser(user);
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch {}
    }, 2000);
    const timeout = setTimeout(() => {
      clearInterval(pollRef.current!);
      setStatus('error');
      setErrorMsg('Время ожидания истекло. Обновите страницу.');
    }, 600_000);
    return () => { clearInterval(pollRef.current!); clearTimeout(timeout); };
  }, [status, router]);

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRetry = () => {
    const newCode = generateCode();
    setCode(newCode); codeRef.current = newCode;
    setErrorMsg(''); setStatus('idle');
    api.requestAuthCode(newCode).then(() => setStatus('waiting')).catch(() => setErrorMsg('Ошибка сервера.'));
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--apple-bg)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--apple-blue)' }}>
            <span className="text-3xl">🩺</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--apple-label)' }}>СимптоМед</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--apple-secondary)' }}>Войдите через Telegram</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-semibold" style={{ color: 'var(--apple-label)' }}>Вход выполнен</p>
            <p className="text-sm mt-1" style={{ color: 'var(--apple-secondary)' }}>Перенаправляем...</p>
          </div>
        ) : (
          <div className="rounded-3xl p-8" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>

            <p className="text-sm font-medium mb-5" style={{ color: 'var(--apple-label)' }}>
              Как войти:
            </p>
            <ol className="text-sm space-y-2 mb-6" style={{ color: 'var(--apple-secondary)' }}>
              <li className="flex gap-2"><span style={{ color: 'var(--apple-blue)', fontWeight: 600 }}>1.</span> Откройте <strong style={{ color: 'var(--apple-label)' }}>@medgg_bot</strong> в Telegram</li>
              <li className="flex gap-2"><span style={{ color: 'var(--apple-blue)', fontWeight: 600 }}>2.</span> Введите этот код боту:</li>
            </ol>

            {/* Code block */}
            <div className="relative rounded-2xl py-5 px-4 mb-5 flex items-center justify-center"
              style={{ background: 'var(--apple-bg)' }}>
              <span className="text-4xl font-mono font-bold tracking-[0.25em]"
                style={{ color: 'var(--apple-label)' }}>
                {code || '------'}
              </span>
              <button onClick={copyCode}
                className="absolute right-3 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                style={{ background: copied ? 'var(--apple-green)' : 'var(--apple-separator)', color: copied ? '#fff' : 'var(--apple-label)' }}>
                {copied ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>

            <a href="https://t.me/medgg_bot" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm text-white transition hover:opacity-90 mb-4"
              style={{ background: 'var(--apple-blue)' }}>
              Открыть @medgg_bot →
            </a>

            {status === 'waiting' && !errorMsg && (
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--apple-tertiary)' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--apple-blue)' }} />
                Ожидаем подтверждения...
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 text-xs text-center p-3 rounded-xl" style={{ background: '#FFF2F2', color: 'var(--apple-red)' }}>
                {errorMsg}
                <button onClick={handleRetry} className="block mx-auto mt-1 font-semibold underline">Получить новый код</button>
              </div>
            )}

            <p className="text-xs text-center mt-4" style={{ color: 'var(--apple-tertiary)' }}>Код действителен 10 минут</p>
          </div>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--apple-secondary)' }}>
          <button onClick={() => router.push('/consultation')}
            className="font-medium" style={{ color: 'var(--apple-blue)' }}>
            Консультация без входа →
          </button>
        </p>
      </div>
    </main>
  );
}
