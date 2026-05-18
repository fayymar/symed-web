'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Loader2, Heart } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

interface AnamnesisForm {
  chronic_diseases: string;
  drug_allergies: string;
  hereditary: string;
  smoking: string;
  physical_activity: string;
}

const empty: AnamnesisForm = {
  chronic_diseases: '', drug_allergies: '',
  hereditary: '', smoking: 'no', physical_activity: '',
};

const CHRONIC = ['Диабет', 'Гипертония', 'Астма', 'Артрит', 'Гастрит', 'Ожирение', 'Аритмия', 'Мигрень', 'Нет'];
const ALLERGY = ['Пенициллин', 'Аспирин', 'Ибупрофен', 'Сульфаниламиды', 'Кодеин', 'Новокаин', 'Нет'];
const HEREDITARY = ['Диабет', 'Гипертония', 'Болезни сердца', 'Инсульт', 'Рак', 'Астма', 'Нет'];
const SMOKING = [
  { value: 'no', label: 'Не курю' },
  { value: 'yes', label: 'Курю' },
  { value: 'quit', label: 'Бросил(а)' },
];
const ACTIVITY = [
  { value: 'sedentary', label: 'Сидячий', desc: 'Офис, мало движения' },
  { value: 'light', label: 'Лёгкий', desc: 'Прогулки, редкий спорт' },
  { value: 'moderate', label: 'Умеренный', desc: '3–4 тренировки в неделю' },
  { value: 'active', label: 'Активный', desc: 'Почти каждый день' },
  { value: 'athlete', label: 'Спортсмен', desc: 'Профессиональный спорт' },
];

const STEPS = ['chronic', 'allergy', 'hereditary', 'smoking', 'activity'] as const;
type Step = typeof STEPS[number];

const STEP_META: Record<Step, { title: string; subtitle: string }> = {
  chronic:    { title: 'Хронические заболевания', subtitle: 'Выберите всё что есть, или «Нет»' },
  allergy:    { title: 'Аллергии на лекарства', subtitle: 'Помогает избежать опасных назначений' },
  hereditary: { title: 'Наследственные заболевания', subtitle: 'Болезни у близких родственников' },
  smoking:    { title: 'Курение', subtitle: 'Влияет на рекомендации' },
  activity:   { title: 'Физическая активность', subtitle: 'Ваш обычный уровень нагрузки' },
};

function toggleChip(current: string, chip: string): string {
  if (chip === 'Нет') return 'Нет';
  const items = current === 'Нет' ? [] : current.split(',').map(s => s.trim()).filter(Boolean);
  const idx = items.findIndex(s => s.toLowerCase() === chip.toLowerCase());
  if (idx >= 0) items.splice(idx, 1); else items.push(chip);
  return items.join(', ');
}

function hasChip(current: string, chip: string): boolean {
  return current.split(',').map(s => s.trim()).some(s => s.toLowerCase() === chip.toLowerCase());
}

export default function AnamnesisPage() {
  const router = useRouter();
  const [form, setForm] = useState<AnamnesisForm>(empty);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const step = STEPS[stepIdx];
  const meta = STEP_META[step];
  const isLast = stepIdx === STEPS.length - 1;
  const progress = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  const setChips = (key: keyof AnamnesisForm) => (chip: string) =>
    setForm(f => ({ ...f, [key]: toggleChip(f[key], chip) }));

  const handleNext = async () => {
    if (!isLast) { setStepIdx(i => i + 1); return; }
    // Last step → save & continue
    const user = auth.getUser();
    if (user) {
      setSaving(true);
      try {
        await api.saveProfile(user.id, {
          chronic_diseases: form.chronic_diseases ? form.chronic_diseases.split(',').map(s => s.trim()).filter(Boolean) : [],
          drug_allergies: form.drug_allergies || '',
          hereditary: form.hereditary ? form.hereditary.split(',').map(s => s.trim()).filter(Boolean) : [],
          smoking: form.smoking,
          physical_activity: form.physical_activity,
        });
      } catch {}
      finally { setSaving(false); }
    }
    router.push('/consultation/questions');
  };

  const handleSkip = () => router.push('/consultation/questions');

  const chipBtn = (chip: string, value: string, onChange: (c: string) => void) => {
    const active = hasChip(value, chip);
    return (
      <button key={chip} type="button" onClick={() => onChange(chip)}
        className="text-sm px-4 py-2.5 rounded-2xl font-medium transition flex items-center gap-1.5"
        style={{
          background: active ? 'var(--s-blue)' : 'var(--s-surface)',
          color: active ? '#fff' : 'var(--s-label)',
          border: active ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
        }}>
        {active && <Check size={12} strokeWidth={3} />}{chip}
      </button>
    );
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--s-bg)' }}>
      {/* Header */}
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            {stepIdx > 0 ? (
              <button onClick={() => setStepIdx(i => i - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition"
                style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
            ) : <div className="w-8" />}
            <span className="font-semibold" style={{ color: 'var(--s-label)' }}>О вашем здоровье</span>
            <span className="ml-auto text-sm" style={{ color: 'var(--s-tertiary)' }}>{stepIdx + 1} / {STEPS.length}</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--s-fill-secondary)' }}>
            <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--s-blue)' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--s-blue-light)' }}>
            <Heart size={18} style={{ color: 'var(--s-blue)' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--s-label)' }}>{meta.title}</h2>
            <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>{meta.subtitle}</p>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1">
          {/* Chips-based steps */}
          {step === 'chronic' && (
            <div className="flex flex-wrap gap-2">
              {CHRONIC.map(c => chipBtn(c, form.chronic_diseases, setChips('chronic_diseases')))}
            </div>
          )}
          {step === 'allergy' && (
            <div className="flex flex-wrap gap-2">
              {ALLERGY.map(c => chipBtn(c, form.drug_allergies, setChips('drug_allergies')))}
            </div>
          )}
          {step === 'hereditary' && (
            <div className="flex flex-wrap gap-2">
              {HEREDITARY.map(c => chipBtn(c, form.hereditary, setChips('hereditary')))}
            </div>
          )}

          {/* Smoking */}
          {step === 'smoking' && (
            <div className="flex flex-col gap-3">
              {SMOKING.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, smoking: value }))}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl font-medium transition"
                  style={{
                    background: form.smoking === value ? 'var(--s-blue)' : 'var(--s-surface)',
                    color: form.smoking === value ? '#fff' : 'var(--s-label)',
                    border: form.smoking === value ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
                  }}>
                  <span>{label}</span>
                  {form.smoking === value && <Check size={16} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}

          {/* Activity */}
          {step === 'activity' && (
            <div className="flex flex-col gap-3">
              {ACTIVITY.map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, physical_activity: value }))}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl transition"
                  style={{
                    background: form.physical_activity === value ? 'var(--s-blue)' : 'var(--s-surface)',
                    color: form.physical_activity === value ? '#fff' : 'var(--s-label)',
                    border: form.physical_activity === value ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
                  }}>
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: form.physical_activity === value ? 'rgba(255,255,255,0.72)' : 'var(--s-secondary)' }}>{desc}</div>
                  </div>
                  {form.physical_activity === value && <Check size={16} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-8">
          <button onClick={handleNext} disabled={saving}
            className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--s-blue)' }}>
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Сохраняем...</>
              : isLast
              ? <>Продолжить <ChevronRight size={16} /></>
              : <>Далее <ChevronRight size={16} /></>}
          </button>
          <button onClick={handleSkip}
            className="w-full py-3 rounded-full text-sm font-medium transition"
            style={{ color: 'var(--s-secondary)' }}>
            Пропустить
          </button>
        </div>
      </div>
    </main>
  );
}
