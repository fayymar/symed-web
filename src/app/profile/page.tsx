'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Check, Loader2, AlertCircle, Link2, MessageCircle, CheckCircle2 } from 'lucide-react';
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

const CHRONIC_SUGGESTIONS  = ['Диабет', 'Гипертония', 'Астма', 'Артрит', 'Гастрит', 'Ожирение', 'Аритмия', 'Мигрень'];
const ALLERGY_SUGGESTIONS  = ['Пенициллин', 'Аспирин', 'Ибупрофен', 'Сульфаниламиды', 'Кодеин', 'Новокаин', 'Нет'];
const HEREDITARY_SUGGESTIONS = ['Диабет', 'Гипертония', 'Болезни сердца', 'Инсульт', 'Рак', 'Астма', 'Нет'];
const SMOKING_OPTIONS = [
  { value: 'no', label: 'Не курю' },
  { value: 'yes', label: 'Курю' },
  { value: 'quit', label: 'Бросил(а)' },
];
const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Сидячий' },
  { value: 'light',     label: 'Лёгкий' },
  { value: 'moderate',  label: 'Умеренный' },
  { value: 'active',    label: 'Активный' },
  { value: 'athlete',   label: 'Спортсмен' },
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {suggestions.map(s => {
        const active = hasChip(value, s);
        return (
          <button key={s} onClick={() => onChange(toggleChip(value, s))} style={{
            padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            borderColor: active ? 'var(--s-primary)' : 'var(--s-border)',
            background:  active ? 'var(--s-primary)' : 'transparent',
            color:       active ? '#fff' : 'var(--s-text-secondary)',
          }}>{s}</button>
        );
      })}
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com';

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [form,    setForm]    = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  // Telegram linking
  const [linkCode,    setLinkCode]    = useState('');
  const [linkStatus,  setLinkStatus]  = useState<'idle' | 'waiting' | 'linked'>('idle');
  const [linkLoading, setLinkLoading] = useState(false);
  const linkPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    const user = auth.getUser()!;
    api.getProfile(user.id).then((data) => {
      if (data.exists && data.profile) {
        const p = data.profile;
        setForm({
          full_name:  p.full_name  || '',
          phone:      p.phone      || '',
          birthdate:  p.birthdate  ? p.birthdate.slice(0, 10) : '',
          gender:     p.gender     || '',
          height:     p.height     ? String(p.height) : '',
          weight:     p.weight     ? String(p.weight) : '',
          chronic_diseases: Array.isArray(p.chronic_diseases) ? p.chronic_diseases.join(', ') : (p.chronic_diseases || ''),
          drug_allergies:   p.drug_allergies   || '',
          smoking:          p.smoking          || 'no',
          hereditary: Array.isArray(p.hereditary) ? p.hereditary.join(', ') : (p.hereditary || ''),
          physical_activity: p.physical_activity || '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));

    return () => { if (linkPollRef.current) clearInterval(linkPollRef.current); };
  }, [router]);

  const set    = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));
  const setVal = (key: keyof ProfileForm) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Укажите имя'); return; }
    setError(''); setSaving(true);
    const userId = auth.getUserId()!;
    try {
      await api.saveProfile(userId, {
        ...form,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('Ошибка сохранения'); }
    setSaving(false);
  };

  async function handleLinkTelegram() {
    const userId = auth.getUserId();
    if (!userId) return;
    setLinkLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/link-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!data.code) throw new Error('No code');
      setLinkCode(data.code);
      setLinkStatus('waiting');
      const poll = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/api/auth/link-status/${data.code}`);
          const s = await r.json();
          if (s.verified) { clearInterval(poll); setLinkStatus('linked'); }
        } catch (_) {}
      }, 3000);
      linkPollRef.current = poll;
    } catch (e) { console.error('Link error:', e); }
    setLinkLoading(false);
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
    border: '1px solid var(--s-border)', background: 'var(--s-fill)',
    color: 'var(--s-text)', fontSize: '15px', outline: 'none',
  };
  const lbl: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: 'var(--s-text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block',
  };
  const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };

  const saveBtn = (
    <button onClick={handleSave} disabled={saving} style={{
      padding: '7px 18px', borderRadius: '999px', fontWeight: 600, fontSize: '14px',
      color: '#fff', background: 'var(--s-primary)', border: 'none',
      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      {saving  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Сохранение…</> :
       saved   ? <><Check size={14} /> Сохранено</> : 'Сохранить'}
    </button>
  );

  if (loading) return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ color: 'var(--s-primary)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <PageHeader title="Мой профиль" action={saveBtn} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: '#ff3b3015', color: '#ff3b30' }}>
            <AlertCircle size={16} /><span style={{ fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Personal info */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <User size={16} style={{ color: 'var(--s-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Личные данные</span>
          </div>
          <div style={row}><label style={lbl}>Имя и фамилия</label>
            <input style={inp} value={form.full_name} onChange={set('full_name')} placeholder="Иван Иванов" />
          </div>
          <div style={row}><label style={lbl}>Телефон</label>
            <input style={inp} type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (999) 000-00-00" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={row}><label style={lbl}>Дата рождения</label>
              <input style={inp} type="date" value={form.birthdate} onChange={set('birthdate')} />
            </div>
            <div style={row}><label style={lbl}>Пол</label>
              <select style={inp} value={form.gender} onChange={set('gender')}>
                <option value="">—</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={row}><label style={lbl}>Рост (см)</label>
              <input style={inp} type="number" value={form.height} onChange={set('height')} placeholder="175" />
            </div>
            <div style={row}><label style={lbl}>Вес (кг)</label>
              <input style={inp} type="number" value={form.weight} onChange={set('weight')} placeholder="70" />
            </div>
          </div>
        </section>

        {/* Medical info */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Heart size={16} style={{ color: 'var(--s-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Медицинские данные</span>
          </div>
          <div style={row}><label style={lbl}>Хронические заболевания</label>
            <Chips suggestions={CHRONIC_SUGGESTIONS} value={form.chronic_diseases} onChange={setVal('chronic_diseases')} />
            <input style={{ ...inp, marginTop: 8 }} value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Другое..." />
          </div>
          <div style={row}><label style={lbl}>Аллергии на препараты</label>
            <Chips suggestions={ALLERGY_SUGGESTIONS} value={form.drug_allergies} onChange={setVal('drug_allergies')} />
            <input style={{ ...inp, marginTop: 8 }} value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Другое..." />
          </div>
          <div style={row}><label style={lbl}>Курение</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {SMOKING_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setVal('smoking')(o.value)} style={{
                  flex: 1, padding: '8px', borderRadius: 10, border: '1px solid',
                  borderColor: form.smoking === o.value ? 'var(--s-primary)' : 'var(--s-border)',
                  background:  form.smoking === o.value ? 'var(--s-primary)' : 'transparent',
                  color:       form.smoking === o.value ? '#fff' : 'var(--s-text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{o.label}</button>
              ))}
            </div>
          </div>
          <div style={row}><label style={lbl}>Наследственность</label>
            <Chips suggestions={HEREDITARY_SUGGESTIONS} value={form.hereditary} onChange={setVal('hereditary')} />
            <input style={{ ...inp, marginTop: 8 }} value={form.hereditary} onChange={set('hereditary')} placeholder="Другое..." />
          </div>
          <div style={row}><label style={lbl}>Физическая активность</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACTIVITY_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setVal('physical_activity')(o.value)} style={{
                  padding: '7px 14px', borderRadius: 10, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  borderColor: form.physical_activity === o.value ? 'var(--s-primary)' : 'var(--s-border)',
                  background:  form.physical_activity === o.value ? 'var(--s-primary)' : 'transparent',
                  color:       form.physical_activity === o.value ? '#fff' : 'var(--s-text-secondary)',
                }}>{o.label}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Telegram linking */}
        <section style={{ borderRadius: '20px', padding: '20px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MessageCircle size={18} style={{ color: 'var(--s-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--s-text)' }}>Подключить Telegram</span>
          </div>

          {linkStatus === 'idle' && (
            <>
              <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                Свяжите Telegram-аккаунт, чтобы история консультаций и профиль были общими на сайте и в боте.
              </p>
              <button onClick={handleLinkTelegram} disabled={linkLoading} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12,
                border: '1.5px solid var(--s-primary)', background: 'transparent',
                color: 'var(--s-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}>
                {linkLoading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Link2 size={16} />}
                Получить код привязки
              </button>
            </>
          )}

          {linkStatus === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', lineHeight: 1.5 }}>
                Нажмите кнопку — откроется Telegram, бот автоматически выполнит привязку.
              </p>
              <a href={`https://t.me/medgg_bot?start=link_${linkCode}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '13px 20px', borderRadius: 14,
                  background: '#229ED9', color: '#fff',
                  fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  boxShadow: '0 2px 12px rgba(34,158,217,0.35)',
                }}>
                <MessageCircle size={18} />
                Привязать через Telegram
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--s-text-secondary)', fontSize: 13 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--s-primary)' }} />
                Ожидаем подтверждения…
              </div>
            </div>
          )}

          {linkStatus === 'linked' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34c759' }}>
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Telegram успешно привязан! Данные синхронизированы.</span>
            </div>
          )}
        </section>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving} style={{
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
