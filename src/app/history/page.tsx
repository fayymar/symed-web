'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ClipboardList, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Consultation {
  id: string;
  symptoms: string;
  recommended_doctor: string;
  urgency_level: string;
  created_at: string;
}

function formatDate(s: string) {
  const d = new Date(s.endsWith('Z') ? s : s + 'Z');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function UrgencyBadge({ level }: { level: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    high:   { icon: <AlertTriangle size={12} />, label: 'Срочно',         color: 'var(--s-red)',    bg: 'rgba(255,59,48,0.1)' },
    medium: { icon: <Clock size={12} />,         label: 'Скоро',          color: 'var(--s-orange)', bg: 'rgba(255,149,0,0.1)' },
    low:    { icon: <CheckCircle size={12} />,   label: 'Планово',        color: 'var(--s-green)',  bg: 'rgba(52,199,89,0.1)' },
  };
  const u = map[level] ?? map.medium;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: u.color, background: u.bg }}>
      {u.icon}{u.label}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;
    api.getConsultations(user.id)
      .then(d => setItems(d.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>История консультаций</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
            <p style={{ color: 'var(--s-secondary)' }}>Загружаем историю...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'var(--s-surface)' }}>
              <ClipboardList size={28} style={{ color: 'var(--s-tertiary)' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--s-label)' }}>История пуста</p>
              <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Ваши консультации появятся здесь</p>
            </div>
            <button onClick={() => router.push('/consultation')}
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: 'var(--s-blue)' }}>
              Начать консультацию
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="rounded-3xl p-5"
                style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-medium line-clamp-2 flex-1" style={{ color: 'var(--s-label)' }}>
                    {item.symptoms}
                  </p>
                  <UrgencyBadge level={item.urgency_level} />
                </div>
                {item.recommended_doctor && (
                  <p className="text-sm mb-2" style={{ color: 'var(--s-blue)' }}>
                    → {item.recommended_doctor}
                  </p>
                )}
                <p className="text-xs" style={{ color: 'var(--s-tertiary)' }}>{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
