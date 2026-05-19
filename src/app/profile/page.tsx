'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Heart, Check, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import SubNav from '@/components/SubNav';

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
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map(chip => {
        const active = hasChip(value, chip);
        return (
          <button key={chip} type="button" onClick={() => onChange(toggleChip(value, chip))}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1"
            style={{
              background: active ? 'var(--s-blue)' : 'var(--s-fill-secondary)',
              color: active ? '#fff' : 'var(--s-secondary)',
              border: active ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
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

  const inputStyle: React.CSSProperties = { background: 'var(--s-bg)', color: 'var(--s-label)', border: '1px solid var(--s-separator)', outline: 'none' };
  const inputCls = "w-full px-4 py-3 rounded-2xl text-sm transition";
  const labelStyle: React.CSSProperties = { color: 'var(--s-secondary)' };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--s-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--s-blue-light)' }}>
          <User size={22} style={{ color: 'var(--s-blue)' }} />
        </div>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
        <p style={{ color: 'var(--s-secondary)' }}>Загружаем профиль...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Мой профиль</span>
          <button onClick={handleSave} disabled={saving}
            className="ml-auto text-sm font-semibold px-4 py-1.5 rounded-full text-white disabled:opacity-40 flex items-center gap-1.5 transition hover:opacity-90"
            style={{ background: 'var(--s-blue)' }}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </header>
      <SubNav />

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
        {saved && (
          <div className="px-4 py-3 rounded-2xl text-sm text-center font-medium flex items-center justify-center gap-2"
            style={{ background: 'var(--s-green)', color: '#fff' }}>
            <Check size={16} /> Профиль сохранён
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-2xl text-sm text-center flex items-center justify-center gap-2"
            style={{ background: 'var(--s-blue-light)', color: 'var(--s-red)' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Основное */}
        <section className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          <div className="flex items-center gap-2 mb-1">
            <User size={16} style={{ color: 'var(--s-blue)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--s-label)' }}>Основное</h2>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Полное имя *</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Иванов Иван Иванович" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Телефон</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" className={inputCls} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Дата рождения</label>
              <input type="date" value={form.birthdate} onChange={set('birthdate')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Пол</label>
              <select value={form.gender} onChange={set('gender')} className={inputCls} style={inputStyle}>
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Рост (см)</label>
              <input type="number" value={form.height} onChange={set('height')} placeholder="175" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Вес (кг)</label>
              <input type="number" value={form.weight} onChange={set('weight')} placeholder="70" className={inputCls} style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Медицинская история */}
        <section className="rounded-3xl p-6 flex flex-col gap-5" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          <div className="flex items-center gap-2">
            <Heart size={16} style={{ color: 'var(--s-red)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--s-label)' }}>Медицинская история</h2>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Или выберите ниже..." className={inputCls} style={inputStyle} />
            <Chips suggestions={CHRONIC_SUGGESTIONS} value={form.chronic_diseases} onChange={setVal('chronic_diseases')} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Или выберите ниже..." className={inputCls} style={inputStyle} />
            <Chips suggestions={ALLERGY_SUGGESTIONS} value={form.drug_allergies} onChange={setVal('drug_allergies')} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Или выберите ниже..." className={inputCls} style={inputStyle} />
            <Chips suggestions={HEREDITARY_SUGGESTIONS} value={form.hereditary} onChange={setVal('hereditary')} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={labelStyle}>Курение</label>
            <div className="flex gap-2">
              {SMOKING_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, smoking: value }))}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-medium transition"
                  style={{
                    background: form.smoking === value ? 'var(--s-blue)' : 'var(--s-bg)',
                    color: form.smoking === value ? '#fff' : 'var(--s-secondary)',
                    border: form.smoking === value ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={labelStyle}>Физическая активность</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, physical_activity: value }))}
                  className="flex-1 min-w-[30%] py-2.5 rounded-2xl text-sm font-medium transition"
                  style={{
                    background: form.physical_activity === value ? 'var(--s-blue)' : 'var(--s-bg)',
                    color: form.physical_activity === value ? '#fff' : 'var(--s-secondary)',
                    border: form.physical_activity === value ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-full font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ background: 'var(--s-blue)' }}>
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </div>
    </main>
  );
}
