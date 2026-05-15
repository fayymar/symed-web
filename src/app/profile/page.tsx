'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface ProfileForm {
  full_name: string;
  phone: string;
  birthdate: string;
  gender: string;
  height: string;
  weight: string;
  chronic_diseases: string;
  drug_allergies: string;
  smoking: string;
  hereditary: string;
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
          full_name: p.full_name || '',
          phone: p.phone || '',
          birthdate: p.birthdate ? p.birthdate.slice(0, 10) : '',
          gender: p.gender || '',
          height: p.height ? String(p.height) : '',
          weight: p.weight ? String(p.weight) : '',
          chronic_diseases: Array.isArray(p.chronic_diseases) ? p.chronic_diseases.join(', ') : (p.chronic_diseases || ''),
          drug_allergies: p.drug_allergies || '',
          smoking: p.smoking || 'no',
          hereditary: Array.isArray(p.hereditary) ? p.hereditary.join(', ') : (p.hereditary || ''),
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const set = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Укажите имя'); return; }
    setError('');
    setSaving(true);
    try {
      const user = auth.getUser()!;
      const payload = {
        ...form,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        chronic_diseases: form.chronic_diseases ? form.chronic_diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
        hereditary: form.hereditary ? form.hereditary.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      await api.saveProfile(user.id, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Ошибка сохранения. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">👤</div>
          <p className="text-gray-500">Загружаем профиль...</p>
        </div>
      </main>
    );
  }

  const inputCls = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <span className="font-semibold text-gray-900">Мой профиль</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto bg-blue-600 text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium text-center">
            ✅ Профиль сохранён
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
            {error}
          </div>
        )}

        {/* Основное */}
        <section className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-gray-900">👤 Основное</h2>

          <div>
            <label className={labelCls}>Полное имя *</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Иванов Иван Иванович" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Телефон</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Дата рождения</label>
              <input type="date" value={form.birthdate} onChange={set('birthdate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Пол</label>
              <select value={form.gender} onChange={set('gender')} className={inputCls}>
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Рост (см)</label>
              <input type="number" value={form.height} onChange={set('height')} placeholder="175" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Вес (кг)</label>
              <input type="number" value={form.weight} onChange={set('weight')} placeholder="70" className={inputCls} />
            </div>
          </div>
        </section>

        {/* Медицинская история */}
        <section className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-gray-900">🏥 Медицинская история</h2>

          <div>
            <label className={labelCls}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Диабет, гипертония (через запятую)" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Пенициллин, аспирин..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Диабет, болезни сердца (через запятую)" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Курение</label>
            <select value={form.smoking} onChange={set('smoking')} className={inputCls}>
              <option value="no">Не курю</option>
              <option value="yes">Курю</option>
              <option value="quit">Бросил(а)</option>
            </select>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Сохраняем...' : '💾 Сохранить профиль'}
        </button>
      </div>
    </main>
  );
}
