'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, FileText, Loader2, Check } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Сидячий образ жизни',
  light: 'Лёгкая активность',
  moderate: 'Умеренная активность',
  active: 'Активный',
  athlete: 'Профессиональный спорт',
};

const SMOKING_LABELS: Record<string, string> = {
  no: 'Не курит',
  yes: 'Курит',
  quit: 'Бросил(а)',
};

export default function ExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;

    Promise.all([
      api.getProfile(user.id),
      api.getConsultations(user.id),
    ]).then(([profileData, histData]) => {
      const p = profileData?.profile || {};
      const consultations: Array<{ created_at: string; symptoms: string; recommended_doctor: string }> = histData?.records?.slice(0, 5) || [];

      const lines: string[] = [
        '═══════════════════════════════════',
        '        МЕДИЦИНСКАЯ СВОДКА',
        `        Symed — symed.uz`,
        `        ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        '═══════════════════════════════════',
        '',
        '── ЛИЧНЫЕ ДАННЫЕ ──────────────────',
        p.full_name ? `Имя:            ${p.full_name}` : '',
        p.birthdate   ? `Дата рождения:  ${p.birthdate.slice(0, 10)}` : '',
        p.gender      ? `Пол:            ${p.gender === 'male' ? 'Мужской' : 'Женский'}` : '',
        p.phone       ? `Телефон:        ${p.phone}` : '',
        p.height      ? `Рост:           ${p.height} см` : '',
        p.weight      ? `Вес:            ${p.weight} кг` : '',
        '',
        '── МЕДИЦИНСКАЯ ИСТОРИЯ ─────────────',
        p.chronic_diseases?.length
          ? `Хронические:    ${Array.isArray(p.chronic_diseases) ? p.chronic_diseases.join(', ') : p.chronic_diseases}`
          : 'Хронические:    Не указано',
        p.drug_allergies
          ? `Аллергии:       ${p.drug_allergies}`
          : 'Аллергии:       Не указано',
        p.hereditary?.length
          ? `Наследственные: ${Array.isArray(p.hereditary) ? p.hereditary.join(', ') : p.hereditary}`
          : 'Наследственные: Не указано',
        `Курение:        ${SMOKING_LABELS[p.smoking] || 'Не указано'}`,
        p.physical_activity
          ? `Активность:     ${ACTIVITY_LABELS[p.physical_activity] || p.physical_activity}`
          : 'Активность:     Не указано',
        '',
      ];

      if (consultations.length > 0) {
        lines.push('── ПОСЛЕДНИЕ КОНСУЛЬТАЦИИ ──────────');
        consultations.forEach((c, i) => {
          const d = new Date(c.created_at.endsWith('Z') ? c.created_at : c.created_at + 'Z');
          lines.push(`${i + 1}. ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`);
          lines.push(`   Симптомы:  ${c.symptoms?.slice(0, 80) || '—'}`);
          if (c.recommended_doctor) lines.push(`   Врач:      ${c.recommended_doctor}`);
          lines.push('');
        });
      }

      lines.push('───────────────────────────────────');
      lines.push('Документ сформирован Symed (symed.uz)');
      lines.push('Не является официальным медицинским документом.');

      setPreview(lines.filter(Boolean).join('\n'));
    }).catch(() => {
      setPreview('Ошибка загрузки данных.');
    }).finally(() => setLoading(false));
  }, [router]);

  const handleDownload = () => {
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symed-anamnez-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

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
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Экспорт анамнеза</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--s-blue-light)' }}>
            <FileText size={20} style={{ color: 'var(--s-blue)' }} />
          </div>
          <div>
            <h1 className="font-bold text-lg" style={{ color: 'var(--s-label)' }}>Медицинская сводка</h1>
            <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Скачайте файл для визита к врачу</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
            <p style={{ color: 'var(--s-secondary)' }}>Формируем сводку...</p>
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="rounded-3xl p-5 mb-5 overflow-auto"
              style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)', maxHeight: '420px' }}>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono"
                style={{ color: 'var(--s-label)' }}>
                {preview}
              </pre>
            </div>

            <button onClick={handleDownload}
              className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
              style={{ background: exported ? 'var(--s-green)' : 'var(--s-blue)' }}>
              {exported
                ? <><Check size={18} /> Скачано</>
                : <><Download size={18} /> Скачать .txt</>}
            </button>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--s-tertiary)' }}>
              Документ не является официальным медицинским заключением
            </p>
          </>
        )}
      </div>
    </main>
  );
}
