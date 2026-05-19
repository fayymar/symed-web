'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  ClipboardList, User, Pill, BookOpen,
  Building2, FileDown, HelpCircle,
} from 'lucide-react';

const ITEMS = [
  { label: 'История',  icon: ClipboardList, href: '/history' },
  { label: 'Профиль',  icon: User,          href: '/profile' },
  { label: 'Лекарства',icon: Pill,          href: '/medications' },
  { label: 'Дневник',  icon: BookOpen,      href: '/diary' },
  { label: 'Клиники',  icon: Building2,     href: '/clinics' },
  { label: 'Экспорт',  icon: FileDown,      href: '/export' },
  { label: 'FAQ',      icon: HelpCircle,    href: '/faq' },
];

export default function SubNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      overflowX: 'auto',
      padding: '10px 16px',
      borderBottom: '1px solid var(--s-border)',
      background: 'var(--s-surface)',
      scrollbarWidth: 'none',
    }}>
      <style>{`
        .subnav-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      {ITEMS.map(({ label, icon: Icon, href }) => {
        const active = pathname === href;
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 10px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              background: active ? 'var(--s-primary)' : 'var(--s-bg)',
              color: active ? '#fff' : 'var(--s-text-muted)',
              transition: 'background 0.15s',
            }}
          >
            <Icon size={16} />
            <span style={{ fontSize: '11px', fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
