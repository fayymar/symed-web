'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'История',   href: '/history' },
  { label: 'Профиль',   href: '/profile' },
  { label: 'Лекарства', href: '/medications' },
  { label: 'Дневник',   href: '/diary' },
  { label: 'Клиники',   href: '/clinics' },
  { label: 'Экспорт',   href: '/export' },
  { label: 'FAQ',        href: '/faq' },
];

interface PageHeaderProps {
  title?: string;
  action?: React.ReactNode;
  showSubNav?: boolean;
}

export default function PageHeader({ action }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .symed-nav-scroll { scrollbar-width: none; }
        .symed-nav-scroll::-webkit-scrollbar { display: none; }
        .symed-nav-link:hover { color: var(--s-text) !important; }
        .symed-consult-btn:hover { opacity: 0.85; }
      `}</style>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(var(--s-surface-raw, 255,255,255), 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--s-border)',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
      }}>

        {/* Back arrow — left */}
        <button
          onClick={() => router.push('/dashboard')}
          title="На главную"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--s-primary)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Nav items — center, scrollable */}
        <nav
          className="symed-nav-scroll"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            overflowX: 'auto',
            padding: '0 4px',
          }}
        >
          {NAV_ITEMS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                className="symed-nav-link"
                onClick={() => router.push(href)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 9px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--s-text)' : 'var(--s-text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: active ? '-0.2px' : '0',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: ThemeToggle + консультация + optional action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ThemeToggle />
          <button
            className="symed-consult-btn"
            onClick={() => router.push('/consultation')}
            style={{
              background: 'var(--s-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              padding: '5px 13px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.15s',
            }}
          >
            Консультация
          </button>
          {action}
        </div>
      </header>
    </>
  );
}
