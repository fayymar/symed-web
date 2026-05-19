'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, Thermometer, Heart, Weight, Smile, ExternalLink, Loader2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface DiaryEntry {
  id: string;
  entry_date: string;
  entry_time?: string;
  temperature?: number;
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  pulse?: number;
  weight?: number;
  mood?: string;
  symptoms?: string;
  notes?: string;
}

function formatDate(s: string) {
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00Z');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

const MOOD_MAP: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Отлично', color: 'var(--s-green)' },
  good:      { label: 'Хорошо',  color: 'var(--s-green)' },
  ok:        { label: 'Норм',    color: 'var(--s-orange)' },
  bad:       { label: 'Плохо',   color: 'var(--s-red)' },
  terrible:  { label: 'Ужасно',  color: 'var(--s-red)' },
};

export default function DiaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;
    api.getDiary(user.id)
      .then(d => setEntries(d.records || []))
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
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Дневник здоровья</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
            <p style={{ color: 'var(--s-secondary)' }}>Загружаем записи...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'var(--s-surface)' }}>
              <BookOpen size={28} style={{ color: 'var(--s-tertiary)' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--s-label)' }}>Дневник пуст</p>
              <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Ведите записи через Telegram-бот</p>
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
              {entries.map(e => (
                <div key={e.id} className="rounded-3xl p-5"
                  style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm" style={{ color: 'var(--s-label)' }}>
                      {formatDate(e.entry_date)}{e.entry_time ? ` в ${e.entry_time.slice(0, 5)}` : ''}
                    </span>
                    {e.mood && MOOD_MAP[e.mood] && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ color: MOOD_MAP[e.mood].color, background: `${MOOD_MAP[e.mood].color}18` }}>
                        <Smile size={11} className="inline mr-1" />{MOOD_MAP[e.mood].label}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {e.temperature && (
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--s-secondary)' }}>
                        <Thermometer size={14} style={{ color: 'var(--s-orange)' }} />{e.temperature}°C
                      </div>
                    )}
                    {e.blood_pressure_sys && (
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--s-secondary)' }}>
                        <Heart size={14} style={{ color: 'var(--s-red)' }} />{e.blood_pressure_sys}/{e.blood_pressure_dia}
                      </div>
                    )}
                    {e.pulse && (
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--s-secondary)' }}>
                        <Heart size={14} style={{ color: 'var(--s-red)' }} />{e.pulse} уд/мин
                      </div>
                    )}
                    {e.weight && (
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--s-secondary)' }}>
                        <Weight size={14} style={{ color: 'var(--s-blue)' }} />{e.weight} кг
                      </div>
                    )}
                  </div>
                  {e.symptoms && <p className="text-sm mt-2" style={{ color: 'var(--s-secondary)' }}>{e.symptoms}</p>}
                  {e.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--s-tertiary)' }}>{e.notes}</p>}
                </div>
              ))}
            </div>
            <a href="https://t.me/medgg_bot" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-sm font-semibold"
              style={{ background: 'var(--s-surface)', color: 'var(--s-blue)', border: '1px solid var(--s-separator)' }}>
              Добавить запись в @medgg_bot <ExternalLink size={14} />
            </a>
          </>
        )}
      </div>
    </main>
  );
}
