'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoggedIn()) {
      router.push('/dashboard');
      return;
    }

    window.onTelegramAuth = (user) => {
      auth.setUser(user);
      router.push('/dashboard');
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'medgg_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    document.getElementById('telegram-widget')?.appendChild(script);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <span className="text-5xl mb-6 block">🩺</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Войти в СимптоМед</h1>
        <p className="text-gray-500 mb-8">
          Используйте ваш Telegram аккаунт — без паролей и регистрации
        </p>

        <div id="telegram-widget" className="flex justify-center mb-6" />

        <p className="text-xs text-gray-400">
          Нажимая кнопку вы соглашаетесь с{' '}
          <a href="#" className="underline">условиями использования</a>
        </p>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 mb-3">Или откройте в Telegram:</p>
          <a
            href="https://t.me/medgg_bot"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition"
          >
            <span>Открыть @medgg_bot</span>
          </a>
        </div>
      </div>
    </main>
  );
}
