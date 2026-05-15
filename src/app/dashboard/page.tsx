'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, TelegramUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/auth');
      return;
    }
    setUser(auth.getUser());
  }, [router]);

  if (!user) return null;

  const cards = [
    { icon: '🩺', title: 'Новая консультация', desc: 'Опишите симптомы', href: '/consultation', color: 'bg-blue-600 text-white' },
    { icon: '📋', title: 'История', desc: 'Прошлые консультации', href: '/history', color: 'bg-white border-2 border-gray-200 text-gray-900' },
    { icon: '👤', title: 'Профиль', desc: 'Личные данные', href: '/profile', color: 'bg-white border-2 border-gray-200 text-gray-900' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <span className="font-bold text-gray-900">СимптоМед</span>
          </div>
          <div className="flex items-center gap-3">
            {user.photo_url && (
              <img src={user.photo_url} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-600">{user.first_name}</span>
            <button
              onClick={auth.logout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Добрый день, {user.first_name}
        </h1>
        <p className="text-gray-500 mb-8">Чем могу помочь?</p>

        <div className="flex flex-col gap-4">
          {cards.map(({ icon, title, desc, href, color }) => (
            <Link
              key={href}
              href={href}
              className={`${color} rounded-2xl p-6 flex items-center gap-4 hover:opacity-90 transition shadow-sm`}
            >
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-semibold text-lg">{title}</div>
                <div className={`text-sm ${color.includes('blue-600') ? 'text-blue-100' : 'text-gray-500'}`}>
                  {desc}
                </div>
              </div>
              <span className="ml-auto text-2xl opacity-50">→</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ СимптоМед не заменяет консультацию врача. При острых симптомах вызовите скорую.
        </div>
      </div>
    </main>
  );
}
