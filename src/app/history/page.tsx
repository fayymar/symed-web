'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTheme } from '@/context/ThemeContext';
import PageHeader from '@/components/PageHeader';

interface Consultation {
  id: string;
  symptoms: string;
  symptoms_summary?: string;
  recommended_doctor: string;
  urgency_level: string;
  created_at: string;
}

function parseSymptoms(raw: string): string {
  if (!raw) return '—';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.text) return parsed.text;
    if (Array.isArray(parsed.history) && parsed.history.length > 0) {
      const first = parsed.history.find((h: Record<string, unknown>) => !h.question) ?? parsed.history[0];
      if (first?.answer) return String(first.answer);
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed.find((h: Record<string, unknown>) => !h.question) ?? parsed[0];
      if (first?.answer) return String(first.answer);
    }
    return trimmed;
  } catch { return trimmed; }
}

function formatDate(s: string) {
  if (!s) return '';
  const normalized = (s.endsWith('Z') || s.includes('+') || /\d{2}:\d{2}$/.test(s.slice(-6))) ? s : s + 'Z';
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function UrgencyBadge({ level }: { level: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    high:   { icon: <AlertTriangle size={12} />, label: 'Срочно',  color: '#ef4444', bg: '#fee2e2' },
    medium: { icon: <Clock size={12} />,         label: 'Скоро',   color: '#f59e0b', bg: '#fef3c7' },
    low:    { icon: <CheckCircle size={12} />,   label: 'Планово', color: '#10b981', bg: '#d1fae5' },
  };
  const u = map[level] ?? map.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
      color: u.color, background: u.bg, whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {u.icon}{u.label}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const userId = auth.getUserId();
    if (!userId) { router.push('/auth'); return; }
    api.getConsultations(userId)
      .then(d => setItems(d.records ?? d.consultations ?? (Array.isArray(d) ? d : [])))
      .catch((e) => { console.error('History fetch error:', e); setFetchError('Не удалось загрузить историю.'); })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <PageHeader title="История консультаций" />

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', gap: '12px' }}>
            <Loader2 size={28} color="var(--s-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--s-text-muted)' }}>Загружаем историю…</p>
          </div>
        )}
        {fetchError && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--s-red)' }}>
            {fetchError}
          </div>
        )}
        {!loading && !fetchError && items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '16px', textAlign: 'center' }}>
            <ClipboardList size={48} style={{ color: 'var(--s-text-muted)', opacity: 0.4 }} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>История пуста</p>
              <p style={{ fontSize: '14px', color: 'var(--s-text-muted)' }}>Ваши консультации появятся здесь</p>
            </div>
            <button onClick={() => router.push('/consultation')} style={{
              background: 'var(--s-primary)', color: 'var(--s-on-primary)', border: 'none',
              borderRadius: '20px', padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
            }}>Начать консультацию</button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: 'var(--s-surface)', borderRadius: '14px',
              border: '1px solid var(--s-border)', padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, flex: 1, lineHeight: '1.4' }}>
                  {parseSymptoms(item.symptoms_summary ?? item.symptoms ?? '')}
                </p>
                <UrgencyBadge level={item.urgency_level} />
              </div>
              {item.recommended_doctor && (
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--s-primary)' }}>→ {item.recommended_doctor}</p>
              )}
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--s-text-muted)' }}>{formatDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
