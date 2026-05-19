'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pill, Clock, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  notes?: string;
}

function formatDate(s: string) {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00Z');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MedicationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;
    api.getMedications(user.id)
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
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Лекарства</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
            <p style={{ color: 'var(--s-secondary)' }}>Загружаем...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'var(--s-surface)' }}>
              <Pill size={28} style={{ color: 'var(--s-tertiary)' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--s-label)' }}>Нет активных лекарств</p>
              <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Добавляйте лекарства через Telegram-бот</p>
            </div>
            <a href="https://t.me/medgg_bot" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: 'var(--s-blue)' }}>
              Открыть @medgg_bot <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {items.map(med => (
                <div key={med.id} className="rounded-3xl p-5"
                  style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--s-blue-light)' }}>
                      <Pill size={18} style={{ color: 'var(--s-blue)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: 'var(--s-label)' }}>{med.medication_name}</p>
                      {med.dosage && <p className="text-sm mt-0.5" style={{ color: 'var(--s-secondary)' }}>{med.dosage}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {med.times?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--s-secondary)' }}>
                        <Clock size={13} style={{ color: 'var(--s-blue)' }} />
                        {med.times.join(', ')}
                      </div>
                    )}
                    {med.start_date && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--s-secondary)' }}>
                        <Calendar size={13} style={{ color: 'var(--s-blue)' }} />
                        с {formatDate(med.start_date)}
                        {med.end_date && ` по ${formatDate(med.end_date)}`}
                      </div>
                    )}
                  </div>
                  {med.notes && (
                    <p className="text-xs mt-2 italic" style={{ color: 'var(--s-tertiary)' }}>{med.notes}</p>
                  )}
                </div>
              ))}
            </div>
            <a href="https://t.me/medgg_bot" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--s-surface)', color: 'var(--s-blue)', border: '1px solid var(--s-separator)' }}>
              Добавить через @medgg_bot <ExternalLink size={14} />
            </a>
          </>
        )}
      </div>
    </main>
  );
}
