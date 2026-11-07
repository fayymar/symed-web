'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { CONSENT_ACCEPTED_KEY as ACCEPTED_KEY, CONSENT_REQUIRED_EVENT, CONSENT_VERSION, PRIVACY_PATH } from '@/lib/consent';
import ConsentText from './ConsentText';

/**
 * Окно согласия для вошедших пользователей. Пока согласие на текущую версию
 * текста не дано, сайт не даёт работать с данными о здоровье: бэкенд в любом
 * случае отклонит запись (403 consent_required), а это окно объясняет почему.
 */
export default function ConsentGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Страницы, где окно не показываем: политика (её нужно иметь возможность прочитать) и вход
  const exempt = pathname === PRIVACY_PATH || pathname.startsWith('/auth');

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(CONSENT_REQUIRED_EVENT, show);
    return () => window.removeEventListener(CONSENT_REQUIRED_EVENT, show);
  }, []);

  useEffect(() => {
    if (exempt || !auth.isLoggedIn()) return;
    let known: string | null = null;
    try { known = localStorage.getItem(ACCEPTED_KEY); } catch { /* storage недоступен */ }
    if (known === CONSENT_VERSION) return;
    let cancelled = false;
    api.getConsent()
      .then((d: { accepted?: boolean }) => {
        if (cancelled) return;
        if (d?.accepted) {
          try { localStorage.setItem(ACCEPTED_KEY, CONSENT_VERSION); } catch { /* storage недоступен */ }
        } else {
          setOpen(true);
        }
      })
      .catch(() => { /* сеть/бэкенд недоступны — бэкенд всё равно не примет данные без согласия */ });
    return () => { cancelled = true; };
  }, [pathname, exempt]);

  if (!open || exempt) return null;

  const accept = async () => {
    setSaving(true); setError('');
    try {
      await api.acceptConsent('web');
      try { localStorage.setItem(ACCEPTED_KEY, CONSENT_VERSION); } catch { /* storage недоступен */ }
      setOpen(false);
    } catch {
      setError('Не удалось сохранить согласие. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="consent-title" style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--s-surface)', color: 'var(--s-text, var(--s-label))', borderRadius: 24,
        maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24,
        border: '1px solid var(--s-border, var(--s-separator))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <ShieldCheck size={22} style={{ color: 'var(--s-primary, var(--s-blue))' }} />
          <h2 id="consent-title" style={{ fontSize: 18, fontWeight: 700 }}>Согласие на обработку данных</h2>
        </div>
        <ConsentText />
        {error && <p style={{ color: '#ff3b30', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
          <button onClick={accept} disabled={saving} style={{
            padding: '13px', borderRadius: 999, border: 'none', fontWeight: 600, fontSize: 15,
            background: 'var(--s-primary, var(--s-blue))', color: 'var(--s-on-primary, #fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.6 : 1,
          }}>
            {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            Согласен
          </button>
          <button onClick={() => { auth.logout(); }} style={{
            padding: '11px', borderRadius: 999, border: '1px solid var(--s-border, var(--s-separator))',
            background: 'transparent', color: 'var(--s-text-secondary, var(--s-secondary))', fontSize: 14,
          }}>
            Не согласен — выйти
          </button>
        </div>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    </div>
  );
}
