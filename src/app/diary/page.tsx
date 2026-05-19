'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  BookOpen, Plus, X, Thermometer, Heart, Activity,
  Scale, Smile, FileText, ArrowLeft, Loader2, AlertCircle,
  ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';

const MOODS = [
  { label: '😄 Отлично', value: 'great' },
  { label: '🙂 Хорошо', value: 'good' },
  { label: '😐 Нормально', value: 'ok' },
  { label: '😕 Плохо', value: 'bad' },
  { label: '😣 Очень плохо', value: 'terrible' },
];

interface DiaryEntry {
  id: number;
  created_at: string;
  temperature?: number;
  blood_pressure_sys?: number;
  blood_pressure_dia?: number;
  pulse?: number;
  weight?: number;
  mood?: string;
  symptoms?: string;
  notes?: string;
}

export default function DiaryPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [temperature, setTemperature] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('symed_user_id');
    if (stored) {
      const id = parseInt(stored);
      setUserId(id);
      loadEntries(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadEntries(id: number) {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDiary(id);
      setEntries(Array.isArray(data) ? data : data.entries ?? []);
    } catch {
      setError('Не удалось загрузить дневник');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTemperature(''); setBpSys(''); setBpDia(''); setPulse('');
    setWeight(''); setMood(''); setSymptoms(''); setNotes('');
    setSaved(false);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (temperature) payload.temperature = parseFloat(temperature);
      if (bpSys) payload.blood_pressure_sys = parseInt(bpSys);
      if (bpDia) payload.blood_pressure_dia = parseInt(bpDia);
      if (pulse) payload.pulse = parseInt(pulse);
      if (weight) payload.weight = parseFloat(weight);
      if (mood) payload.mood = mood;
      if (symptoms) payload.symptoms = symptoms;
      if (notes) payload.notes = notes;
      await api.addDiaryEntry(userId, payload);
      setSaved(true);
      resetForm();
      setShowForm(false);
      await loadEntries(userId);
    } catch {
      setError('Ошибка при сохранении записи');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(s: string) {
    return new Date(s).toLocaleString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function moodLabel(value: string) {
    return MOODS.find(m => m.value === value)?.label ?? value;
  }

  const hasAnyInput = !!(temperature || bpSys || pulse || weight || mood || symptoms || notes);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <header style={{
        background: 'var(--s-surface)', borderBottom: '1px solid var(--s-border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text-muted)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </button>
        <BookOpen size={22} color="var(--s-primary)" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, flex: 1 }}>Дневник здоровья</h1>
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
          {showForm ? <><X size={16} /> Закрыть</> : <><Plus size={16} /> Запись</>}
        </button>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>
        {showForm && (
          <div style={{ background: 'var(--s-surface)', borderRadius: '16px', border: '1px solid var(--s-border)', padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Новая запись</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={14} /> Температура (°C)</span>
                <input type="number" step="0.1" min="35" max="42" placeholder="36.6" value={temperature} onChange={e => setTemperature(e.target.value)}
                  style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> Пульс (уд/мин)</span>
                <input type="number" min="30" max="250" placeholder="72" value={pulse} onChange={e => setPulse(e.target.value)}
                  style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px' }} />
              </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={14} /> Давление (мм рт.ст.)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" min="60" max="250" placeholder="120" value={bpSys} onChange={e => setBpSys(e.target.value)}
                  style={{ flex: 1, background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px' }} />
                <span style={{ color: 'var(--s-text-muted)', fontWeight: 600 }}>/</span>
                <input type="number" min="40" max="150" placeholder="80" value={bpDia} onChange={e => setBpDia(e.target.value)}
                  style={{ flex: 1, background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px' }} />
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Scale size={14} /> Вес (кг)</span>
              <input type="number" step="0.1" min="20" max="300" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '15px' }} />
            </label>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Smile size={14} /> Самочувствие
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(mood === m.value ? '' : m.value)} style={{
                    background: mood === m.value ? 'var(--s-primary)' : 'var(--s-bg)',
                    color: mood === m.value ? '#fff' : 'var(--s-text)',
                    border: `1px solid ${mood === m.value ? 'var(--s-primary)' : 'var(--s-border)'}`,
                    borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '12px' }}>
              Симптомы (если есть)
              <textarea placeholder="Головная боль, усталость…" value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> Заметки</span>
              <textarea placeholder="Принял лекарство, плохо спал…" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '8px 10px', color: 'var(--s-text)', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
            </label>

            <button onClick={handleSave} disabled={saving || !hasAnyInput} style={{
              width: '100%', background: 'var(--s-primary)', color: '#fff',
              border: 'none', borderRadius: '10px', padding: '12px',
              cursor: 'pointer', fontWeight: 700, fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: (saving || !hasAnyInput) ? 0.6 : 1,
            }}>
              {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Сохранение…</> : 'Сохранить запись'}
            </button>
          </div>
        )}

        {saved && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46' }}>
            <CheckCircle size={18} /> Запись сохранена
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!userId && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--s-text-muted)' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ marginBottom: '16px' }}>Войдите, чтобы видеть дневник</p>
            <button onClick={() => router.push('/auth')} style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Войти</button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} color="var(--s-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && userId && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--s-text-muted)' }}>
            <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>Записей пока нет.</p>
            <p style={{ fontSize: '14px' }}>Нажмите «Запись», чтобы добавить первую.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map(entry => {
            const isExpanded = expandedId === entry.id;
            const hasBP = entry.blood_pressure_sys && entry.blood_pressure_dia;
            return (
              <div key={entry.id} style={{ background: 'var(--s-surface)', borderRadius: '14px', border: '1px solid var(--s-border)', overflow: 'hidden' }}>
                <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 16px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', color: 'var(--s-text)', textAlign: 'left',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{formatDate(entry.created_at)}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                      {entry.temperature && <span>🌡 {entry.temperature}°C</span>}
                      {hasBP && <span>❤️ {entry.blood_pressure_sys}/{entry.blood_pressure_dia}</span>}
                      {entry.pulse && <span>💓 {entry.pulse} уд/мин</span>}
                      {entry.weight && <span>⚖️ {entry.weight} кг</span>}
                      {entry.mood && <span>{moodLabel(entry.mood)}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="var(--s-text-muted)" /> : <ChevronDown size={18} color="var(--s-text-muted)" />}
                </button>

                {isExpanded && (entry.symptoms || entry.notes) && (
                  <div style={{ padding: '12px 16px 14px', borderTop: '1px solid var(--s-border)' }}>
                    {entry.symptoms && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Симптомы</div>
                        <div style={{ fontSize: '14px' }}>{entry.symptoms}</div>
                      </div>
                    )}
                    {entry.notes && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Заметки</div>
                        <div style={{ fontSize: '14px' }}>{entry.notes}</div>
                      </div>
                    )}
                  </div>
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
