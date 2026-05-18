'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const inputCls = "w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition";
  const inputStyle = { background: 'var(--apple-bg)', color: 'var(--apple-label)', border: '1px solid var(--apple-separator)' };
  const focusStyle = { outline: `2px solid var(--apple-blue)` };
  const labelCls = "block text-xs font-medium mb-1.5";

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--apple-bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">👤</div>
        <p style={{ color: 'var(--apple-secondary)' }}>Загружаем профиль...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--apple-bg)' }}>
      <header className="px-6 py-4 sticky top-0 z-10" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--apple-separator)', color: 'var(--apple-label)' }}>←</button>
          <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>Мой профиль</span>
          <button onClick={handleSave} disabled={saving}
            className="ml-auto text-sm font-semibold px-4 py-1.5 rounded-full text-white disabled:opacity-40"
            style={{ background: 'var(--apple-blue)' }}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
        {saved && <div className="px-4 py-3 rounded-2xl text-sm text-center font-medium" style={{ background: '#F0FFF4', color: '#166534', border: '1px solid #BBF7D0' }}>✅ Профиль сохранён</div>}
        {error && <div className="px-4 py-3 rounded-2xl text-sm text-center" style={{ background: '#FFF2F2', color: 'var(--apple-red)' }}>{error}</div>}

        {/* Основное */}
        <section className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--apple-label)' }}>👤 Основное</h2>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Полное имя *</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Иванов Иван Иванович" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Телефон</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" className={inputCls} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Дата рождения</label>
              <input type="date" value={form.birthdate} onChange={set('birthdate')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Пол</label>
              <select value={form.gender} onChange={set('gender')} className={inputCls} style={inputStyle}>
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Рост (см)</label>
              <input type="number" value={form.height} onChange={set('height')} placeholder="175" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Вес (кг)</label>
              <input type="number" value={form.weight} onChange={set('weight')} placeholder="70" className={inputCls} style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Медицинская история */}
        <section className="rounded-3xl p-6 flex flex-col gap-4" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--apple-label)' }}>🏥 Медицинская история</h2>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Диабет, гипертония (через запятую)" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Пенициллин, аспирин..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Диабет, болезни сердца (через запятую)" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--apple-secondary)' }}>Курение</label>
            <select value={form.smoking} onChange={set('smoking')} className={inputCls} style={inputStyle}>
              <option value="no">Не курю</option>
              <option value="yes">Курю</option>
              <option value="quit">Бросил(а)</option>
            </select>
          </div>
        </section>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-full font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--apple-blue)' }}>
          {saving ? 'Сохраняем...' : '💾 Сохранить профиль'}
        </button>
      </div>
    </main>
  );
}
