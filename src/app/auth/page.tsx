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
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRef = useRef('');

  useEffect(() => {
    if (auth.isLoggedIn()) {
      router.push('/dashboard');
      return;
    }

    // Генерируем код и регистрируем на бэкенде
    const newCode = generateCode();
    setCode(newCode);
    codeRef.current = newCode;

    api.requestAuthCode(newCode)
      .then(() => setStatus('waiting'))
      .catch(() => setErrorMsg('Не удалось связаться с сервером. Попробуйте обновить страницу.'));

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  // Запускаем polling когда статус стал waiting
  useEffect(() => {
    if (status !== 'waiting') return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await api.checkAuthStatus(codeRef.current);
        if (data.verified) {
          clearInterval(pollRef.current!);
          const user: TelegramUser = {
            id: data.id,
            first_name: data.first_name || '',
            last_name: data.last_name,
            username: data.username,
            photo_url: data.photo_url,
            auth_date: data.auth_date,
            hash: '',
          };
          auth.setUser(user);
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch {
        // Тихо игнорируем сетевые ошибки, продолжаем polling
      }
    }, 2000);

    // Таймаут 10 минут
    const timeout = setTimeout(() => {
      clearInterval(pollRef.current!);
      setStatus('error');
      setErrorMsg('Время ожидания истекло. Обновите страницу и попробуйте снова.');
    }, 600_000);

    return () => {
      clearInterval(pollRef.current!);
      clearTimeout(timeout);
    };
  }, [status, router]);

  const handleRetry = () => {
    const newCode = generateCode();
    setCode(newCode);
    codeRef.current = newCode;
    setErrorMsg('');
    setStatus('idle');
    api.requestAuthCode(newCode)
      .then(() => setStatus('waiting'))
      .catch(() => setErrorMsg('Ошибка сервера. Попробуйте позже.'));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <span className="text-5xl mb-6 block">🩺</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Войти в СимптоМед</h1>
        <p className="text-gray-500 mb-8">
          Войдите через Telegram — без паролей
        </p>

        {status === 'success' ? (
          <div className="py-6">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-700 font-semibold text-lg">Вход выполнен!</p>
            <p className="text-gray-400 text-sm mt-1">Перенаправляем...</p>
          </div>
        ) : (
          <>
            {/* Инструкция */}
            <div className="bg-blue-50 rounded-xl p-5 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-800 mb-3">Как войти:</p>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Откройте <span className="font-semibold">@medgg_bot</span> в Telegram</li>
                <li>Отправьте боту этот код:</li>
              </ol>
            </div>

            {/* Код */}
            <div className="bg-gray-900 rounded-xl py-5 px-8 mb-6 inline-block w-full">
              <span className="text-4xl font-mono font-bold tracking-[0.3em] text-white">
                {code || '------'}
              </span>
            </div>

            {/* Кнопка открыть бот */}
            <a
              href={`https://t.me/medgg_bot`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-4 rounded-xl font-semibold text-base hover:bg-blue-600 transition mb-4"
            >
              <span>Открыть @medgg_bot</span>
              <span>→</span>
            </a>

            {/* Статус */}
            {status === 'waiting' && !errorMsg && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Ожидаем подтверждения...
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-200">
                {errorMsg}
                <button
                  onClick={handleRetry}
                  className="block mt-2 text-red-700 font-semibold underline"
                >
                  Получить новый код
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-6">
              Код действителен 10 минут
            </p>
          </>
        )}

        {/* Или продолжить без входа */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-400 mb-3">
            Или{' '}
            <button
              onClick={() => router.push('/consultation')}
              className="text-blue-500 hover:underline font-medium"
            >
              получить консультацию без входа
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
