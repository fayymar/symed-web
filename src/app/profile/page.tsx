'use client';

import { useEffect, useState } from 'react';
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

  async function handleLinkTelegram() {
    const userId = auth.getUserId();
    if (!userId) return;
    setLinkLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com'}/api/auth/link-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!data.code) throw new Error('No code');
      setLinkCode(data.code);
      setLinkStatus('waiting');
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://telegram-doctor-bot.onrender.com'}/api/auth/link-status/${data.code}`);
          const s = await r.json();
          if (s.verified) {
            clearInterval(poll);
            setLinkStatus('linked');
          }
        } catch (_) {}
      }, 3000);
      setLinkPollRef(poll);
    } catch (e) {
      console.error('Link error:', e);
    }
    setLinkLoading(false);
  }

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <PageHeader title="Мой профиль" action={saveBtn} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {saved && (
          <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '14px', textAlign: 'center', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#34c759', color: '#fff' }}>
            <Check size={16} /> Профиль сохранён
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '16px', fontSize: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--s-fill)', color: '#ff3b30' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Основное */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: 'var(--s-primary)' }} />
            <h2 style={{ fontWeight: 600, color: 'var(--s-text)', margin: 0, fontSize: '15px' }}>Основное</h2>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Полное имя *</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Иванов Иван Иванович" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Телефон</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+998 90 000 00 00" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Дата рождения</label>
              <input type="date" value={form.birthdate} onChange={set('birthdate')} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Пол</label>
              <select value={form.gender} onChange={set('gender')} style={inputStyle}>
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Рост (см)</label>
              <input type="number" value={form.height} onChange={set('height')} placeholder="175" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Вес (кг)</label>
              <input type="number" value={form.weight} onChange={set('weight')} placeholder="70" style={inputStyle} />
            </div>
          </div>
        </section>

        {/* Медицинская история */}
        <section style={{ borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={16} style={{ color: '#ff3b30' }} />
            <h2 style={{ fontWeight: 600, color: 'var(--s-text)', margin: 0, fontSize: '15px' }}>Медицинская история</h2>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Хронические заболевания</label>
            <input value={form.chronic_diseases} onChange={set('chronic_diseases')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={CHRONIC_SUGGESTIONS} value={form.chronic_diseases} onChange={setVal('chronic_diseases')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Аллергии на лекарства</label>
            <input value={form.drug_allergies} onChange={set('drug_allergies')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={ALLERGY_SUGGESTIONS} value={form.drug_allergies} onChange={setVal('drug_allergies')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'var(--s-text-secondary)' }}>Наследственные заболевания</label>
            <input value={form.hereditary} onChange={set('hereditary')} placeholder="Или выберите ниже..." style={inputStyle} />
            <Chips suggestions={HEREDITARY_SUGGESTIONS} value={form.hereditary} onChange={setVal('hereditary')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: 'var(--s-text-secondary)' }}>Курение</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SMOKING_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, smoking: value }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.smoking === value ? 'var(--s-primary)' : 'var(--s-fill)',
                    color: form.smoking === value ? '#fff' : 'var(--s-text-secondary)',
                    border: form.smoking === value ? '1px solid var(--s-primary)' : '1px solid var(--s-border)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: 'var(--s-text-secondary)' }}>Физическая активность</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setForm(f => ({ ...f, physical_activity: value }))}
                  style={{
                    flex: '1 1 30%', padding: '10px', borderRadius: '12px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.physical_activity === value ? 'var(--s-primary)' : 'var(--s-fill)',
                    color: form.physical_activity === value ? '#fff' : 'var(--s-text-secondary)',
                    border: form.physical_activity === value ? '1px solid var(--s-primary)' : '1px solid var(--s-border)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Telegram linking ── */}
        <section style={{ borderRadius: '20px', padding: '20px', background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <MessageCircle size={18} style={{ color: 'var(--s-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--s-text)' }}>Подключить Telegram</span>
          </div>

          {linkStatus === 'idle' && (
            <>
              <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                Свяжите ваш Telegram-аккаунт, чтобы данные профиля и история консультаций были общими в боте и на сайте.
              </p>
              <button onClick={handleLinkTelegram} disabled={linkLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                  borderRadius: 12, border: '1.5px solid var(--s-primary)', background: 'transparent',
                  color: 'var(--s-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                {linkLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={16} />}
                Получить код привязки
              </button>
            </>
          )}

          {linkStatus === 'waiting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--s-text-secondary)', lineHeight: 1.5 }}>
                Нажмите кнопку — откроется Telegram, бот автоматически выполнит привязку.
              </p>
              <a
                href={`https://t.me/medgg_bot?start=link_${linkCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '13px 20px', borderRadius: 14,
                  background: '#229ED9', color: '#fff',
                  fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  boxShadow: '0 2px 12px rgba(34,158,217,0.35)',
                }}
              >
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

        <button onClick={handleSave} disabled={saving}
          style={{
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
    </div>
  );
}
