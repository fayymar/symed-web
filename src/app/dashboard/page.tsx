'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope, ClipboardList, User, LogOut, ChevronRight,
  AlertTriangle, BookOpen, Pill, HelpCircle, MapPin, FileText
} from 'lucide-react';
import { auth, TelegramUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavCard {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  href: string;
}

const CARDS: NavCard[] = [
  { icon: <ClipboardList size={20} />, iconColor: 'var(--s-blue)',   iconBg: 'var(--s-blue-light)',            title: 'История',              desc: 'Прошлые консультации',         href: '/history' },
  { icon: <User size={20} />,          iconColor: 'var(--s-blue)',   iconBg: 'var(--s-blue-light)',            title: 'Профиль',              desc: 'Личные данные и анамнез',      href: '/profile' },
  { icon: <Pill size={20} />,          iconColor: 'var(--s-green)',  iconBg: 'rgba(52,199,89,0.12)',           title: 'Лекарства',            desc: 'Напоминания о приёме',         href: '/medications' },
  { icon: <BookOpen size={20} />,      iconColor: 'var(--s-orange)', iconBg: 'rgba(255,149,0,0.12)',           title: 'Дневник',              desc: 'Показатели здоровья',          href: '/diary' },
  { icon: <MapPin size={20} />,        iconColor: 'var(--s-red)',    iconBg: 'rgba(255,59,48,0.1)',            title: 'Клиники',              desc: 'Найти врача рядом',            href: '/clinics' },
  { icon: <FileText size={20} />,      iconColor: '#8E44AD',         iconBg: 'rgba(142,68,173,0.1)',           title: 'Экспорт анамнеза',     desc: 'Файл для визита к врачу',      href: '/export' },
  { icon: <HelpCircle size={20} />,    iconColor: 'var(--s-secondary)', iconBg: 'var(--s-fill-secondary)',    title: 'FAQ',                  desc: 'Частые вопросы',               href: '/faq' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    setUser(auth.getUser());
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-50"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--s-blue)' }}>
              <Stethoscope size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight" style={{ color: 'var(--s-label)' }}>Symed</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user.photo_url && <img src={user.photo_url} alt="" className="w-7 h-7 rounded-full" />}
            <span className="text-sm font-medium" style={{ color: 'var(--s-secondary)' }}>{user.first_name}</span>
            <button onClick={auth.logout}
              className="w-7 h-7 flex items-center justify-center rounded-full transition"
              style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-secondary)' }}
              title="Выйти">
              <LogOut size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--s-label)' }}>
          Привет, {user.first_name}
        </h1>
        <p className="text-sm mb-7" style={{ color: 'var(--s-secondary)' }}>Чем могу помочь сегодня?</p>

        {/* Primary CTA */}
        <Link href="/consultation"
          className="flex items-center gap-4 p-5 rounded-3xl mb-5 transition hover:opacity-95"
          style={{ background: 'var(--s-blue)' }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.18)' }}>
            <Stethoscope size={22} color="white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-white">Новая консультация</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>Опишите симптомы — получите рекомендацию</div>
          </div>
          <ChevronRight size={18} color="white" opacity={0.6} />
        </Link>

        {/* Section grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {CARDS.map(({ icon, iconColor, iconBg, title, desc, href }) => (
            <Link key={href} href={href}
              className="flex flex-col gap-3 p-4 rounded-3xl transition hover:opacity-95"
              style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: iconBg, color: iconColor }}>
                {icon}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--s-label)' }}>{title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--s-secondary)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl text-sm"
          style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)', color: 'var(--s-secondary)' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--s-orange)' }} />
          <span>Symed не заменяет врача. При острых симптомах вызовите скорую: <strong style={{ color: 'var(--s-label)' }}>103</strong></span>
        </div>
      </div>
    </main>
  );
}
