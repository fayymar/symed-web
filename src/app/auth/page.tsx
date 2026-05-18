'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, Copy, Check, Send, Loader2, AlertCircle } from 'lucide-react';
import { auth, TelegramUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--s-bg)' }}>
      <nav className="px-6 py-3 flex items-center justify-between sticky top-0 z-50"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--s-blue)' }}>
            <Stethoscope size={14} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--s-label)' }}>Symed</span>
        </button>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'var(--s-blue)' }}>
              <Stethoscope size={26} color="white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--s-label)' }}>Войти в Symed</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--s-secondary)' }}>Через Telegram — быстро и безопасно</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-10 rounded-3xl" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--s-green)' }}>
                <Check size={28} color="white" strokeWidth={2.5} />
              </div>
              <p className="font-semibold text-lg" style={{ color: 'var(--s-label)' }}>Вход выполнен</p>
              <p className="text-sm mt-1" style={{ color: 'var(--s-secondary)' }}>Перенаправляем...</p>
            </div>
          ) : (
            <div className="rounded-3xl p-7" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--s-label)' }}>Как войти:</p>
              <ol className="text-sm space-y-2.5 mb-6" style={{ color: 'var(--s-secondary)' }}>
                <li className="flex gap-2.5">
                  <span className="font-bold flex-shrink-0" style={{ color: 'var(--s-blue)' }}>1.</span>
                  <span>Откройте <strong style={{ color: 'var(--s-label)' }}>@medgg_bot</strong> в Telegram</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-bold flex-shrink-0" style={{ color: 'var(--s-blue)' }}>2.</span>
                  <span>Отправьте боту этот код:</span>
                </li>
              </ol>

              <div className="rounded-2xl px-5 pt-5 pb-4 mb-5 flex flex-col items-center gap-4"
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-separator)' }}>
                <span className="text-4xl font-mono font-bold tracking-[0.25em]" style={{ color: 'var(--s-label)' }}>
                  {code || '------'}
                </span>
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition w-full justify-center"
                  style={{ background: copied ? 'var(--s-green)' : 'var(--s-fill-secondary)', color: copied ? '#fff' : 'var(--s-label)' }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Скопировано' : 'Копировать код'}
                </button>
              </div>

              <a href="https://t.me/medgg_bot" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm text-white transition hover:opacity-90 mb-4"
                style={{ background: 'var(--s-blue)' }}>
                <Send size={15} strokeWidth={2} />
                Открыть @medgg_bot
              </a>

              {status === 'waiting' && !errorMsg && (
                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--s-tertiary)' }}>
                  <Loader2 size={13} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
                  Ожидаем подтверждения...
                </div>
              )}

              {errorMsg && (
                <div className="mt-3 text-xs text-center p-3 rounded-xl flex flex-col items-center gap-2"
                  style={{ background: 'var(--s-blue-light)', color: 'var(--s-red)' }}>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    {errorMsg}
                  </div>
                  <button onClick={handleRetry} className="font-semibold underline" style={{ color: 'var(--s-blue)' }}>
                    Получить новый код
                  </button>
                </div>
              )}

              <p className="text-xs text-center mt-4" style={{ color: 'var(--s-tertiary)' }}>Код действителен 10 минут</p>
            </div>
          )}

          <p className="text-center text-sm mt-6">
            <button onClick={() => router.push('/consultation')} className="font-medium" style={{ color: 'var(--s-blue)' }}>
              Консультация без входа →
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
