'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SubNav from '@/components/SubNav';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;   // кнопка справа (напр. «Сохранить» или «+ Добавить»)
  showSubNav?: boolean;       // показывать SubNav (по умолчанию true)
}

export default function PageHeader({ title, action, showSubNav = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Apple-style frosted glass bar */}
      <header style={{
        background: 'rgba(var(--s-surface-raw, 28,28,30), 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--s-border)',
        padding: '0 16px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none',
            border: 'none', borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--s-primary)',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Title — centered */}
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--s-text)',
          letterSpacing: '-0.3px',
        }}>
          {title}
        </span>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <ThemeToggle />
          {action}
        </div>
      </header>

      {/* Sub-navigation */}
      {showSubNav && <SubNav />}
    </div>
  );
}
