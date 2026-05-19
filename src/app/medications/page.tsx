'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pill, Clock, Calendar, Plus, X, Loader2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

interface Medication {
  id: string;
  name?: string;
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  times?: string[];
  start_date?: string;
  end_date?: string;
  notes?: string;
}

const FREQ_OPTIONS = ['1 раз в день', '2 раза в день', '3 раза в день', 'По необходимости'];
function formatDate(s: string) {
  if (!s) return '';
  try {
    const d = new Date(s.includes('T') ? s : s + 'T00:00:00Z');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return s; }
}

export default function MedicationsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [items, setItems] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const id = auth.getUserId();
    if (id !== null) {
      setUserId(id);
      loadMeds(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadMeds(id: number) {
    setLoading(true);
    setError('');
    try {
      const d = await api.getMedications(id);
      setItems(Array.isArray(d) ? d : d.records ?? d.medications ?? []);
    } catch {
      setError('Не удалось загрузить список лекарств');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName(''); setDosage(''); setFrequency(''); setSelectedTimes([]); setNewTime('');
    setStartDate(''); setEndDate(''); setNotes(''); setSaved(false);
  }

  async function handleSave() {
    if (!userId || !name.trim()) return;
    setSaving(true);
    try {
      await api.addMedication(userId, {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency || undefined,
        times: selectedTimes.length > 0 ? selectedTimes : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      });
      setSaved(true);
      resetForm();
      setShowForm(false);
      await loadMeds(userId);
    } catch {
      setError('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <header style={{
        background: 'var(--s-surface)', borderBottom: '1px solid var(--s-border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text-muted)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <Pill size={22} color="var(--s-primary)" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, flex: 1 }}>Лекарства</h1>
        <ThemeToggle />
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          style={{
            background: showForm ? 'var(--s-surface-2)' : 'var(--s-primary)',
            color: showForm ? 'var(--s-text-muted)' : '#fff',
            border: 'none', borderRadius: '8px', padding: '8px 14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontWeight: 600, fontSize: '14px',
          }}
        >
          {showForm ? <><X size={16} /> Закрыть</> : <><Plus size={16} /> Добавить</>}
        </button>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Add Form */}
        {showForm && (
          <div style={{ background: 'var(--s-surface)', borderRadius: '16px', border: '1px solid var(--s-border)', padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Новое лекарство</h2>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '12px' }}>
              Название препарата *
              <input type="text" placeholder="Например: Ибупрофен 400 мг" value={name} onChange={e => setName(e.target.value)}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--s-text)', fontSize: '15px' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '12px' }}>
              Дозировка
              <input type="text" placeholder="Например: 1 таблетка" value={dosage} onChange={e => setDosage(e.target.value)}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--s-text)', fontSize: '15px' }} />
            </label>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '8px' }}>Частота приёма</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FREQ_OPTIONS.map(f => (
                  <button key={f} onClick={() => setFrequency(frequency === f ? '' : f)} style={{
                    background: frequency === f ? 'var(--s-primary)' : 'var(--s-bg)',
                    color: frequency === f ? '#fff' : 'var(--s-text)',
                    border: `1px solid ${frequency === f ? 'var(--s-primary)' : 'var(--s-border)'}`,
                    borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Время приёма
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    flex: 1, background: 'var(--s-bg)', border: '1px solid var(--s-border)',
                    borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px',
                  }}
                />
                <button
                  onClick={() => {
                    if (newTime && !selectedTimes.includes(newTime)) {
                      setSelectedTimes(prev => [...prev, newTime].sort());
                    }
                    setNewTime('');
                  }}
                  disabled={!newTime}
                  style={{
                    background: 'var(--s-primary)', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '14px', opacity: newTime ? 1 : 0.5,
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              {selectedTimes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedTimes.map(t => (
                    <span key={t} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'var(--s-primary)', color: '#fff',
                      borderRadius: '8px', padding: '5px 10px', fontSize: '13px', fontWeight: 500,
                    }}>
                      {t}
                      <button
                        onClick={() => setSelectedTimes(prev => prev.filter(x => x !== t))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '0', lineHeight: 1, marginLeft: '2px' }}
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Начало</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '14px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Конец</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '14px' }} />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> Заметки</span>
              <textarea placeholder="Принимать во время еды…" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </label>

            <button onClick={handleSave} disabled={saving || !name.trim()} style={{
              width: '100%', background: 'var(--s-primary)', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '12px',
              cursor: 'pointer', fontWeight: 700, fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: (saving || !name.trim()) ? 0.6 : 1,
            }}>
              {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Сохранение…</> : 'Сохранить'}
            </button>
          </div>
        )}

        {saved && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46' }}>
            <CheckCircle size={18} /> Лекарство добавлено
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!userId && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--s-text-muted)' }}>
            <Pill size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ marginBottom: '16px' }}>Войдите, чтобы видеть лекарства</p>
            <button onClick={() => router.push('/auth')} style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Войти</button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} color="var(--s-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && userId && items.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--s-text-muted)' }}>
            <Pill size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Нет добавленных лекарств</p>
            <p style={{ fontSize: '14px' }}>Нажмите «Добавить», чтобы внести препарат</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, i) => {
            const displayName = item.name ?? item.medication_name ?? '—';
            return (
              <div key={item.id ?? i} style={{ background: 'var(--s-surface)', borderRadius: '14px', border: '1px solid var(--s-border)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{displayName}</div>
                    {item.dosage && <div style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>{item.dosage}</div>}
                  </div>
                  <Pill size={18} color="var(--s-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                </div>

                {item.frequency && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>
                    <Clock size={13} /> {item.frequency}
                  </div>
                )}

                {item.times && item.times.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
                    {item.times.map(t => (
                      <span key={t} style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px' }}>{t}</span>
                    ))}
                  </div>
                )}

                {(item.start_date || item.end_date) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginTop: '4px' }}>
                    <Calendar size={13} />
                    {item.start_date && `с ${formatDate(item.start_date)}`}
                    {item.start_date && item.end_date && ' — '}
                    {item.end_date && `по ${formatDate(item.end_date)}`}
                  </div>
                )}

                {item.notes && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--s-text-muted)', fontStyle: 'italic' }}>{item.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
