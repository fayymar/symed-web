'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, User, Calendar, Weight, Ruler } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import SymedLogo from '@/components/SymedLogo';

type Step = 'name' | 'bio' | 'body' | 'done';

export default function OnboardingPage() {
  const router   = useRouter();
  const { theme } = useTheme();

  const [step, setStep]       = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Fields
  const [fullName,  setFullName]  = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender,    setGender]    = useState('');
  const [height,    setHeight]    = useState('');
  const [weight,    setWeight]    = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser();
    if (user) {
      const full = [user.first_name, user.last_name].filter(Boolean).join(' ');
      setFullName(full);
    }
  }, [router]);

  const steps: Step[] = ['name', 'bio', 'body'];
  const stepIndex = steps.indexOf(step);
  const progress  = ((stepIndex) / steps.length) * 100;

  async function handleFinish() {
    setLoading(true);
    setError('');
    const userId = auth.getUserId();
    if (!userId) { router.push('/dashboard'); return; }

    try {
      await api.saveProfile(userId, {
        full_name: fullName,
        birthdate: birthdate || null,
        gender:    gender    || null,
        height:    height    ? Number(height)  : null,
        weight:    weight    ? Number(weight)  : null,
      });
    } catch (e) {
      // Non-critical — still move on
    }
    router.push('/dashboard');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: '1.5px solid var(--s-border)', background: 'var(--s-surface)',
    color: 'var(--s-text)', fontSize: 16, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--s-text-secondary)', marginBottom: 6, letterSpacing: 0.2,
  };
  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'var(--s-primary)', color: '#fff',
    fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'opacity 0.15s',
  };
  const genderBtn = (val: string): React.CSSProperties => ({
    flex: 1, padding: '13px 0', borderRadius: 12, border: '1.5px solid',
    borderColor: gender === val ? 'var(--s-primary)' : 'var(--s-border)',
    background: gender === val ? 'var(--s-primary)' : 'var(--s-surface)',
    color: gender === val ? '#fff' : 'var(--s-text)',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <SymedLogo size={48} />
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text)', letterSpacing: -0.5 }}>Symed</span>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--s-surface)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--s-fill)', borderRadius: 4, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--s-primary)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>

        {/* Step: name */}
        {step === 'name' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <User size={20} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>Как вас зовут?</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--s-text-secondary)', marginBottom: 24 }}>Это имя будет отображаться в вашем профиле</p>
            <label style={labelStyle}>Полное имя</label>
            <input
              style={inputStyle}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Иван Иванов"
              autoFocus
            />
          </div>
        )}

        {/* Step: bio */}
        {step === 'bio' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Calendar size={20} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>О вас</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--s-text-secondary)', marginBottom: 24 }}>Помогает врачам лучше понять ваше состояние</p>

            <label style={labelStyle}>Дата рождения</label>
            <input
              type="date" style={{ ...inputStyle, marginBottom: 20 }}
              value={birthdate} onChange={e => setBirthdate(e.target.value)}
            />

            <label style={labelStyle}>Пол</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={genderBtn('male')}   onClick={() => setGender('male')}>Мужской</button>
              <button style={genderBtn('female')} onClick={() => setGender('female')}>Женский</button>
            </div>
          </div>
        )}

        {/* Step: body */}
        {step === 'body' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Ruler size={20} style={{ color: 'var(--s-primary)' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--s-text)', margin: 0 }}>Параметры тела</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--s-text-secondary)', marginBottom: 24 }}>Можно пропустить и заполнить позже</p>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Рост (см)</label>
                <input
                  type="number" style={inputStyle} placeholder="175"
                  value={height} onChange={e => setHeight(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Вес (кг)</label>
                <input
                  type="number" style={inputStyle} placeholder="70"
                  value={weight} onChange={e => setWeight(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {error && <p style={{ color: '#ff3b30', fontSize: 13, marginTop: 12 }}>{error}</p>}

        {/* Navigation */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step !== 'body' ? (
            <button
              style={btnPrimary}
              onClick={() => setStep(step === 'name' ? 'bio' : 'body')}
              disabled={step === 'name' && !fullName.trim()}
            >
              Далее <ChevronRight size={18} />
            </button>
          ) : (
            <button style={btnPrimary} onClick={handleFinish} disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              Начать работу с Symed
            </button>
          )}

          {step !== 'name' && (
            <button
              onClick={() => setStep(step === 'body' ? 'bio' : 'name')}
              style={{ background: 'none', border: 'none', color: 'var(--s-text-secondary)', cursor: 'pointer', fontSize: 14, padding: '8px 0' }}
            >
              ← Назад
            </button>
          )}

          {step === 'body' && (
            <button
              onClick={handleFinish}
              style={{ background: 'none', border: 'none', color: 'var(--s-text-secondary)', cursor: 'pointer', fontSize: 14, padding: '4px 0' }}
            >
              Пропустить
            </button>
          )}
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--s-text-muted)' }}>Шаг {stepIndex + 1} из {steps.length}</p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
