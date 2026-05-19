'use client';

import { useRouter, usePathname } from 'next/navigation';
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
  title?: string;         // unused visually but kept for compat
  action?: React.ReactNode;
  showSubNav?: boolean;   // kept for compat, ignored
}

export default function PageHeader({ action }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .symed-nav-scroll { scrollbar-width: none; }
        .symed-nav-scroll::-webkit-scrollbar { display: none; }
        .symed-nav-link { transition: color 0.15s; }
        .symed-nav-link:hover { color: var(--s-text) !important; }
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
        padding: '0 20px',
        gap: '0',
      }}>
        {/* Logo — left, like Apple logo */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--s-text)',
            fontWeight: 700,
            fontSize: '15px',
            letterSpacing: '-0.5px',
            padding: '0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.8 2.5 4.9C5.5 13.8 3 17 3 20.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5C21 17 18.5 13.8 15.5 12.4 17 11.3 18 9.5 18 7.5 18 4.5 15.5 2 12 2z" fill="currentColor"/>
          </svg>
          Symed
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
            padding: '0 12px',
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
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--s-text)' : 'var(--s-text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: active ? '-0.2px' : '0',
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: ThemeToggle + optional action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ThemeToggle />
          {action}
        </div>
      </header>
    </>
  );
}
