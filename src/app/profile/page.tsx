'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Heart, Check, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface ProfileForm {
  full_name: string; phone: string; birthdate: string; gender: string;
  height: string; weight: string; chronic_diseases: string;
  drug_allergies: string; smoking: string; hereditary: string;
}

const empty: ProfileForm = {
  full_name: '', phone: '', birthdate: '', gender: '',
  height: '', weight: '', chronic_diseases: '', drug_allergies: '',
  smoking: 'no', hereditary: '',
};

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
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const set = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

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
    background: 'var(--s-bg)', color: 'var(--s-label)',
    border: '1px solid var(--s-separator)', outline: 'none',
  };
  const inputCls = "w-full px-4 py-3 rounded-2xl text-sm transition";
  const labelStyle: React.CSSProperties = { color: 'var(--s-secondary)' };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--s-bg)' }}>
      <div className="text-center flex flex-col items-center gap-4">
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
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </header>

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
        <section className="rounded-3xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
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
        <section className="rounded-3xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} style={{ color: 'var(--s-red)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--s-label)' }}>Медицинская история</h2>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Диабет, гипертония (через запятую)" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Пенициллин, аспирин..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Диабет, болезни сердца (через запятую)" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Курение</label>
            <select value={form.smoking} onChange={set('smoking')} className={inputCls} style={inputStyle}>
              <option value="no">Не курю</option>
              <option value="yes">Курю</option>
              <option value="quit">Бросил(а)</option>
            </select>
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-full font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ background: 'var(--s-blue)' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </div>
    </main>
  );
}
