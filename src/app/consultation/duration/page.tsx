'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useConsultation } from '@/context/ConsultationContext';

const DURATION_OPTIONS = [
  { label: 'Сегодня' },
  { label: 'Несколько дней' },
  { label: '1–2 недели' },
  { label: '2–4 недели' },
  { label: 'Более месяца' },
  { label: 'Более 3 месяцев' },
];

export default function DurationPage() {
  const router = useRouter();
  const { sessionId, setDuration } = useConsultation();

  useEffect(() => {
    if (!sessionId) { router.push('/consultation'); return; }
  }, [sessionId, router]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Длительность</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--s-blue-light)' }}>
            <Clock size={20} style={{ color: 'var(--s-blue)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--s-label)' }}>Как давно беспокоит?</h2>
            <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Длительность уточняет рекомендацию</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {DURATION_OPTIONS.map(({ label }) => (
            <button key={label} onClick={() => { setDuration(label); router.push('/consultation/loading'); }}
              className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl font-medium transition hover:opacity-90 active:scale-[0.99]"
              style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }}>
              <span className="flex-1">{label}</span>
              <ChevronRight size={16} style={{ color: 'var(--s-tertiary)' }} />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
