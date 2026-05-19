'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Check, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import PageHeader from '@/components/PageHeader';

interface ProfileForm {
  full_name: string; phone: string; birthdate: string; gender: string;
  height: string; weight: string; chronic_diseases: string;
  drug_allergies: string; smoking: string; hereditary: string;
  physical_activity: string;
}

const empty: ProfileForm = {
  full_name: '', phone: '', birthdate: '', gender: '',
  height: '', weight: '', chronic_diseases: '', drug_allergies: '',
  smoking: 'no', hereditary: '', physical_activity: '',
};

const CHRONIC_SUGGESTIONS = ['Диабет', 'Гипертония', 'Астма', 'Артрит', 'Гастрит', 'Ожирение', 'Аритмия', 'Мигрень'];
const ALLERGY_SUGGESTIONS = ['Пенициллин', 'Аспирин', 'Ибупрофен', 'Сульфаниламиды', 'Кодеин', 'Новокаин', 'Нет'];
const HEREDITARY_SUGGESTIONS = ['Диабет', 'Гипертония', 'Болезни сердца', 'Инсульт', 'Рак', 'Астма', 'Нет'];
const SMOKING_OPTIONS = [
  { value: 'no', label: 'Не курю' },
  { value: 'yes', label: 'Курю' },
  { value: 'quit', label: 'Бросил(а)' },
];
const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Сидячий' },
  { value: 'light', label: 'Лёгкий' },
  { value: 'moderate', label: 'Умеренный' },
  { value: 'active', label: 'Активный' },
  { value: 'athlete', label: 'Спортсмен' },
];

function toggleChip(current: string, chip: string): string {
  const items = current.split(',').map(s => s.trim()).filter(Boolean);
  const idx = items.findIndex(s => s.toLowerCase() === chip.toLowerCase());
  if (idx >= 0) items.splice(idx, 1); else items.push(chip);
  return items.join(', ');
}

function hasChip(current: string, chip: string): boolean {
  return current.split(',').map(s => s.trim()).some(s => s.toLowerCase() === chip.toLowerCase());
}

function Chips({ suggestions, value, onChange }: { suggestions: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
      {suggestions.map(chip => {
        const active = hasChip(value, chip);
        return (
          <button key={chip} type="button" onClick={() => onChange(toggleChip(value, chip))}
            style={{
              fontSize: '12px', padding: '6px 12px', borderRadius: '999px',
              fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              background: active ? 'var(--s-primary)' : 'var(--s-fill)',
              color: active ? '#fff' : 'var(--s-text-secondary)',
              border: active ? '1px solid var(--s-primary)' : '1px solid var(--s-border)',
              transition: 'all 0.15s',
            }}>
            {active && <Check size={10} strokeWidth={3} />}{chip}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;
    api.getProfile(user.id).then((data) => {
      if (data.exists && data.profile) {
        const p = data.profile;
        setForm({
          full_name: p.full_name || '', phone: p.phone || '',
          birthdate: p.birthdate ? p.birthdate.slice(0, 10) : '',
          gender: p.gender || '',
          height: p.height ? String(p.height) : '',
          weight: p.weight ? String(p.weight) : '',
          chronic_diseases: Array.isArray(p.chronic_diseases) ? p.chronic_diseases.join(', ') : (p.chronic_diseases || ''),
          drug_allergies: p.drug_allergies || '', smoking: p.smoking || 'no',
          hereditary: Array.isArray(p.hereditary) ? p.hereditary.join(', ') : (p.hereditary || ''),
          physical_activity: p.physical_activity || '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const set = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));
  const setVal = (key: keyof ProfileForm) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Укажите имя'); return; }
    setError(''); setSaving(true);
    try {
      const user = auth.getUser()!;
      await api.saveProfile(user.id, {
        ...form,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        chronic_diseases: form.chronic_diseases ? form.chronic_diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
        hereditary: form.hereditary ? form.hereditary.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { setError('Ошибка сохранения.'); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--s-fill)',
    color: 'var(--s-text)',
    border: '1px solid var(--s-border)',
    outline: 'none',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const saveBtn = (
    <button
      onClick={handleSave}
      disabled={saving}
      style={{
        background: 'var(--s-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        padding: '6px 16px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      {saving && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
      {saving ? 'Сохранение...' : 'Сохранить'}
    </button>
  );

  if (loading) return (
    <div data-theme={theme} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-primary-light)' }}>
          <User size={22} style={{ color: 'var(--s-primary)' }} />
        </div>
        <Loader2 size={20} style={{ color: 'var(--s-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--s-text-secondary)' }}>Загружаем профиль...</p>
      </div>
    </div>
  );

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <PageHeader title="Мой профиль" action={saveBtn} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {saved && (
          <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '14px', textAlign: 'center', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#34c759', color: '#fff' }}>
            <Check size={16} /> Профиль сохранён
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--s-fill)', color: '#ff3b30' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Основное */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--s-primary)' }} />
            <h2 style={{ fontWeight: 600, color: 'var(--s-text)', margin: 0, fontSize: '15px' }}>Основное</h2>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Полное имя *</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Иванов Иван Иванович" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Телефон</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Дата рождения</label>
              <input type="date" value={form.birthdate} onChange={set('birthdate')} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Пол</label>
              <select value={form.gender} onChange={set('gender')} style={inputStyle}>
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Рост (см)</label>
              <input type="number" value={form.height} onChange={set('height')} placeholder="175" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Вес (кг)</label>
              <input type="number" value={form.weight} onChange={set('weight')} placeholder="70" style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Медицинская история */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={16} style={{ color: '#ff3b30' }} />
            <h2 style={{ fontWeight: 600, color: 'var(--s-text)', margin: 0, fontSize: '15px' }}>Медицинская история</h2>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={CHRONIC_SUGGESTIONS} value={form.chronic_diseases} onChange={setVal('chronic_diseases')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={ALLERGY_SUGGESTIONS} value={form.drug_allergies} onChange={setVal('drug_allergies')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={HEREDITARY_SUGGESTIONS} value={form.hereditary} onChange={setVal('hereditary')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: 'var(--s-text-secondary)' }}>Курение</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SMOKING_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, smoking: value }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.smoking === value ? 'var(--s-primary)' : 'var(--s-fill)',
                    color: form.smoking === value ? '#fff' : 'var(--s-text-secondary)',
                    border: form.smoking === value ? '1px solid var(--s-primary)' : '1px solid var(--s-border)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: 'var(--s-text-secondary)' }}>Физическая активность</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, physical_activity: value }))}
                  style={{
                    flex: '1 1 30%', padding: '10px', borderRadius: '12px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.physical_activity === value ? 'var(--s-primary)' : 'var(--s-fill)',
                    color: form.physical_activity === value ? '#fff' : 'var(--s-text-secondary)',
                    border: form.physical_activity === value ? '1px solid var(--s-primary)' : '1px solid var(--s-border)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '16px', borderRadius: '999px',
            fontWeight: 600, fontSize: '15px', color: '#fff',
            background: 'var(--s-primary)', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.5 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
          {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {saving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </div>
    </div>
  );
}
