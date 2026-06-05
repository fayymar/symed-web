'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, Ruler, Calendar, User, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import SymedLogo from '@/components/SymedLogo';

type Step = 'name' | 'bio' | 'body';



export default function OnboardingPage() {
  const router    = useRouter();
  const { theme } = useTheme();

  const [step,    setStep]    = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [fullName,  setFullName]  = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender,    setGender]    = useState('');
  const [height,    setHeight]    = useState('');
  const [weight,    setWeight]    = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser();
    if (user) setFullName([user.first_name, user.last_name].filter(Boolean).join(' '));
  }, [router]);

  const steps: Step[]  = ['name', 'bio', 'body'];
  const stepIndex      = steps.indexOf(step);
  const progress       = (stepIndex / steps.length) * 100;

  async function handleFinish() {
    setLoading(true);
    setError('');
    const userId = auth.getUserId();
    if (!userId) { router.push('/dashboard'); return; }

    try {
      await api.saveProfile(userId, {
        full_name: fullName || undefined,
        birthdate: birthdate || null,
        gender:    gender    || null,
        height:    height    ? Number(height) : null,
        weight:    weight    ? Number(weight) : null,
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError('Не удалось сохранить профиль. Проверьте соединение и попробуйте ещё раз.');
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12, boxSizing: 'border-box',
    border: '1.5px solid var(--s-border)', background: 'var(--s-surface)',
    color: 'var(--s-text)', fontSize: 16, outline: 'none',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--s-text-secondary)', marginBottom: 6,
  };
  const primaryBtn: React.CSSProperties = {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'var(--s-primary)', color: 'var(--s-on-primary)',
    fontSize: 16, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: loading ? 0.7 : 1,
  };
  const gBtn = (val: string): React.CSSProperties => ({
    flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid',
    borderColor: gender === val ? 'var(--s-primary)' : 'var(--s-border)',
    background:  gender === val ? 'var(--s-primary)' : 'var(--s-surface)',
    color: gender === val ? '#fff' : 'var(--s-text)',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  });

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <SymedLogo size={44} />
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text)' }}>Давайте знакомиться</span>
      </div>

      <div style={{ width: '100%', maxWidth: 420, background: 'var(--s-surface)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
        {/* Progress */}
        <div style={{ height: 4, background: 'var(--s-fill)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--s-primary)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>

        {/* Step: name */}
        {step === 'name' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <User size={18} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>Как вас зовут?</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', marginBottom: 20 }}>Будет отображаться в профиле</p>
            <label style={lbl}>Полное имя</label>
            <input style={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Иван Иванов" autoFocus />
          </div>
        )}

        {/* Step: bio */}
        {step === 'bio' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Calendar size={18} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>О вас</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', marginBottom: 20 }}>Помогает врачам точнее поставить диагноз</p>
            <label style={lbl}>Дата рождения</label>
            <input type="date" style={{ ...inp, marginBottom: 16 }} value={birthdate} onChange={e => setBirthdate(e.target.value)} />
            <label style={lbl}>Пол</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={gBtn('male')}   onClick={() => setGender('male')}>Мужской</button>
              <button style={gBtn('female')} onClick={() => setGender('female')}>Женский</button>
            </div>
          </div>
        )}

        {/* Step: body */}
        {step === 'body' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Ruler size={18} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>Параметры тела</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', marginBottom: 20 }}>Можно пропустить и заполнить в профиле позже</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Рост (см)</label>
                <input type="number" style={inp} placeholder="175" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Вес (кг)</label>
                <input type="number" style={inp} placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: '12px', borderRadius: 10, background: '#ff3b3015', color: '#ff3b30' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step !== 'body' ? (
            <button style={primaryBtn} disabled={step === 'name' && !fullName.trim()}
              onClick={() => setStep(step === 'name' ? 'bio' : 'body')}>
              Далее <ChevronRight size={18} />
            </button>
          ) : (
            <button style={primaryBtn} onClick={handleFinish} disabled={loading}>
              {loading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Сохраняем…</>
                : 'Начать работу с Symed'}
            </button>
          )}

          {step !== 'name' && (
            <button onClick={() => setStep(step === 'body' ? 'bio' : 'name')} disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--s-text-secondary)', cursor: 'pointer', fontSize: 14, padding: '6px 0' }}>
              ← Назад
            </button>
          )}

          {step === 'body' && !loading && (
            <button onClick={() => router.push('/dashboard')}
              style={{ background: 'none', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer', fontSize: 13, padding: '4px 0' }}>
              Пропустить
            </button>
          )}
        </div>
      </div>

      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--s-text-muted)' }}>
        Шаг {stepIndex + 1} из {steps.length}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
