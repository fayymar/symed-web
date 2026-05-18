'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConsultation } from '@/context/ConsultationContext';

const DURATION_OPTIONS = [
  { label: 'Сегодня', icon: '🕐' },
  { label: 'Несколько дней', icon: '📅' },
  { label: '1–2 недели', icon: '🗓' },
  { label: '2–4 недели', icon: '📆' },
  { label: 'Более месяца', icon: '🗒' },
  { label: 'Более 3 месяцев', icon: '📋' },
];

export default function DurationPage() {
  const router = useRouter();
  const { sessionId, setDuration } = useConsultation();

  useEffect(() => {
    if (!sessionId) { router.push('/consultation'); return; }
  }, [sessionId, router]);

  return (
    <main className="min-h-screen" style={{ background: 'var(--apple-bg)' }}>
      <header className="px-6 py-4 sticky top-0 z-10" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--apple-separator)', color: 'var(--apple-label)' }}>←</button>
          <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>Длительность</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>Как давно это беспокоит?</h2>
        <p className="mb-8" style={{ color: 'var(--apple-secondary)' }}>Длительность симптомов помогает поставить более точную рекомендацию</p>
        <div className="flex flex-col gap-2">
          {DURATION_OPTIONS.map(({ label, icon }) => (
            <button key={label} onClick={() => { setDuration(label); router.push('/consultation/loading'); }}
              className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl font-medium transition hover:opacity-90"
              style={{ background: 'var(--apple-surface)', color: 'var(--apple-label)', border: '1px solid var(--apple-separator)' }}>
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
              <span className="ml-auto" style={{ color: 'var(--apple-tertiary)' }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
