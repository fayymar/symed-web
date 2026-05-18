'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, TelegramUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    setUser(auth.getUser());
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: 'var(--apple-bg)' }}>

      {/* Header */}
      <header className="px-6 py-4" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>СимптоМед</span>
          <div className="flex items-center gap-3">
            {user.photo_url && <img src={user.photo_url} alt="" className="w-7 h-7 rounded-full" />}
            <span className="text-sm" style={{ color: 'var(--apple-secondary)' }}>{user.first_name}</span>
            <button onClick={auth.logout} className="text-sm" style={{ color: 'var(--apple-blue)' }}>Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--apple-label)' }}>
          Привет, {user.first_name} 👋
        </h1>
        <p className="mb-10 text-base" style={{ color: 'var(--apple-secondary)' }}>Чем могу помочь сегодня?</p>

        {/* Primary action */}
        <Link href="/consultation"
          className="flex items-center gap-5 p-6 rounded-3xl mb-4 transition hover:opacity-95"
          style={{ background: 'var(--apple-blue)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <span className="text-2xl">🩺</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg text-white">Новая консультация</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Опишите симптомы и получите рекомендацию</div>
          </div>
          <span className="text-2xl text-white opacity-50">→</span>
        </Link>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '📋', title: 'История', desc: 'Прошлые консультации', href: '/history' },
            { icon: '👤', title: 'Профиль', desc: 'Личные данные', href: '/profile' },
          ].map(({ icon, title, desc, href }) => (
            <Link key={href} href={href}
              className="flex flex-col gap-3 p-5 rounded-3xl transition hover:opacity-95"
              style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--apple-label)' }}>{title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--apple-secondary)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl text-sm" style={{ background: '#FFF8EC', color: '#7A4800', border: '1px solid #FFD9A0' }}>
          ⚠️ СимптоМед не заменяет врача. При острых симптомах вызовите скорую: <strong>103</strong>
        </div>
      </div>
    </main>
  );
}
