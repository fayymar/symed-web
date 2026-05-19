'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { FileDown, ArrowLeft, Loader2, AlertCircle, User, Pill, BookOpen, Activity, FileText } from 'lucide-react';

interface Profile {
  full_name?: string;
  birth_date?: string;
  gender?: string;
  height?: number;
  weight?: number;
  blood_type?: string;
  chronic_diseases?: string;
  allergies?: string;
  hereditary_diseases?: string;
  smoking?: string;
  physical_activity?: string;
  current_medications?: string;
}

export default function ExportPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [consultations, setConsultations] = useState<unknown[]>([]);
  const [medications, setMedications] = useState<unknown[]>([]);
  const [diary, setDiary] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('symed_user_id');
    if (stored) {
      const id = parseInt(stored);
      setUserId(id);
      loadAll(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadAll(id: number) {
    setLoading(true);
    setError('');
    try {
      const [profData, consData, medData, diarData] = await Promise.allSettled([
        api.getProfile(id),
        api.getConsultations(id),
        api.getMedications(id),
        api.getDiary(id),
      ]);
      if (profData.status === 'fulfilled') setProfile(profData.value?.profile ?? profData.value);
      if (consData.status === 'fulfilled') setConsultations(Array.isArray(consData.value) ? consData.value : consData.value?.consultations ?? []);
      if (medData.status === 'fulfilled') setMedications(Array.isArray(medData.value) ? medData.value : medData.value?.medications ?? []);
      if (diarData.status === 'fulfilled') setDiary(Array.isArray(diarData.value) ? diarData.value : diarData.value?.entries ?? []);
    } catch {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function formatDate(s: string) {
    try { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return s; }
  }

  const genderLabel = (g?: string) => ({ male: 'Мужской', female: 'Женский', other: 'Другой' }[g ?? ''] ?? g ?? '—');
  const smokingLabel = (s?: string) => ({ never: 'Никогда', former: 'Бывший курильщик', current: 'Курит' }[s ?? ''] ?? s ?? '—');
  const activityLabel = (a?: string) => ({ sedentary: 'Малоподвижный', light: 'Лёгкая активность', moderate: 'Умеренная', active: 'Высокая', athlete: 'Спортсмен' }[a ?? ''] ?? a ?? '—');

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      {/* Screen header — hidden in print */}
      <header className="no-print" style={{ background: 'var(--s-surface)', borderBottom: '1px solid var(--s-border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text-muted)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <FileDown size={22} color="var(--s-primary)" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, flex: 1 }}>Экспорт анамнеза</h1>
        <ThemeToggle />
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
        {!userId && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--s-text-muted)' }}>
            <FileDown size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ marginBottom: '16px' }}>Войдите, чтобы экспортировать данные</p>
            <button onClick={() => router.push('/auth')} style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Войти</button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} color="var(--s-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && userId && (
          <>
            {/* Print button */}
            <div className="no-print" style={{ marginBottom: '24px' }}>
              <button onClick={handlePrint} style={{
                background: 'var(--s-primary)', color: '#fff', border: 'none',
                borderRadius: '12px', padding: '14px 28px', cursor: 'pointer',
                fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <FileDown size={20} /> Скачать PDF
              </button>
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                В диалоге печати выберите «Сохранить как PDF»
              </p>
            </div>

            {/* ===== PRINTABLE CONTENT ===== */}
            <div id="print-area">
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '2px solid var(--s-border)', paddingBottom: '16px' }}>
                <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Symed — Медицинский анамнез</div>
                <div style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                  Дата экспорта: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Profile */}
              <section style={{ marginBottom: '28px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--s-primary)' }}>
                  <User size={18} /> Личные данные
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    ['ФИО', profile?.full_name],
                    ['Дата рождения', profile?.birth_date ? formatDate(profile.birth_date) : undefined],
                    ['Пол', genderLabel(profile?.gender)],
                    ['Рост', profile?.height ? `${profile.height} см` : undefined],
                    ['Вес', profile?.weight ? `${profile.weight} кг` : undefined],
                    ['Группа крови', profile?.blood_type],
                    ['Курение', smokingLabel(profile?.smoking)],
                    ['Физ. активность', activityLabel(profile?.physical_activity)],
                  ].map(([label, value]) => value ? (
                    <div key={label as string} style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--s-text-muted)', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{value}</div>
                    </div>
                  ) : null)}
                </div>
              </section>

              {/* Medical history */}
              {(profile?.chronic_diseases || profile?.allergies || profile?.hereditary_diseases || profile?.current_medications) && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--s-primary)' }}>
                    <Activity size={18} /> Медицинский анамнез
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profile?.chronic_diseases && (
                      <div style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Хронические заболевания</div>
                        <div style={{ fontSize: '14px' }}>{profile.chronic_diseases}</div>
                      </div>
                    )}
                    {profile?.allergies && (
                      <div style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Аллергии</div>
                        <div style={{ fontSize: '14px' }}>{profile.allergies}</div>
                      </div>
                    )}
                    {profile?.hereditary_diseases && (
                      <div style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Наследственные заболевания</div>
                        <div style={{ fontSize: '14px' }}>{profile.hereditary_diseases}</div>
                      </div>
                    )}
                    {profile?.current_medications && (
                      <div style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>Текущие препараты (профиль)</div>
                        <div style={{ fontSize: '14px' }}>{profile.current_medications}</div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Medications */}
              {medications.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--s-primary)' }}>
                    <Pill size={18} /> Лекарства ({medications.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(medications as Record<string, unknown>[]).map((m, i) => (
                      <div key={i} style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{String(m.name ?? '—')}</div>
                          {!!m.dosage && <div style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>{String(m.dosage)}</div>}
                          {!!m.frequency && <div style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>{String(m.frequency)}</div>}
                        </div>
                        {!!m.start_date && (
                          <div style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>с {formatDate(String(m.start_date))}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Diary */}
              {diary.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--s-primary)' }}>
                    <BookOpen size={18} /> Дневник здоровья (последние {Math.min(diary.length, 10)} записей)
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(diary.slice(0, 10) as Record<string, unknown>[]).map((e, i) => (
                      <div key={i} style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '6px' }}>{formatDate(String(e.created_at ?? ''))}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '13px' }}>
                          {e.temperature && <span>Температура: {String(e.temperature)}°C</span>}
                          {e.blood_pressure_sys && e.blood_pressure_dia && <span>Давление: {String(e.blood_pressure_sys)}/{String(e.blood_pressure_dia)}</span>}
                          {e.pulse && <span>Пульс: {String(e.pulse)}</span>}
                          {e.weight && <span>Вес: {String(e.weight)} кг</span>}
                          {e.mood && <span>Самочувствие: {String(e.mood)}</span>}
                        </div>
                        {!!e.symptoms && <div style={{ fontSize: '13px', marginTop: '4px' }}>Симптомы: {String(e.symptoms)}</div>}
                        {!!e.notes && <div style={{ fontSize: '13px', marginTop: '4px', color: 'var(--s-text-muted)' }}>{String(e.notes)}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Consultations */}
              {consultations.length > 0 && (
                <section style={{ marginBottom: '28px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--s-primary)' }}>
                    <FileText size={18} /> История консультаций ({consultations.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(consultations.slice(0, 10) as Record<string, unknown>[]).map((c, i) => {
                      let sympText = '—';
                      try {
                        const raw = c.symptoms_summary ?? c.symptoms ?? '';
                        if (typeof raw === 'string' && raw.startsWith('{')) {
                          const parsed = JSON.parse(raw);
                          sympText = parsed.text ?? (parsed.history?.[0]?.answer ?? raw);
                        } else { sympText = String(raw); }
                      } catch { sympText = String(c.symptoms_summary ?? c.symptoms ?? '—'); }
                      return (
                        <div key={i} style={{ background: 'var(--s-surface)', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginBottom: '4px' }}>{formatDate(String(c.created_at ?? ''))}</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>{sympText}</div>
                          {!!c.urgency_level && <div style={{ fontSize: '12px', color: 'var(--s-text-muted)', marginTop: '4px' }}>Уровень: {String(c.urgency_level)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--s-text-muted)', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--s-border)' }}>
                Сформировано приложением Symed · {new Date().toLocaleDateString('ru-RU')}
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          header { display: none !important; }
          #print-area { padding: 0; max-width: 100%; }
          [data-theme] { --s-bg: #fff; --s-surface: #f8f8f8; --s-text: #111; --s-text-muted: #555; --s-border: #ddd; --s-primary: #0891b2; }
        }
      `}</style>
    </div>
  );
}
