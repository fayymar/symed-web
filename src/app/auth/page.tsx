'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Send, Loader2, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';
import { auth, TelegramUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import SymedLogo from '@/components/SymedLogo';

const BOT_USERNAME = 'medgg_bot';
const CALLBACK_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/callback`
  : '';

function generateCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

type Tab    = 'telegram' | 'email' | 'google' | 'apple';
type Status = 'idle' | 'waiting' | 'success' | 'error';
type EmailMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<Tab>('telegram');
  const [status, setStatus]     = useState<Status>('idle');
  const [code, setCode]         = useState('');
  const [copied, setCopied]     = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const codeRef  = useRef('');

  // Email state
  const [emailMode, setEmailMode]       = useState<EmailMode>('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [name, setName]                 = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError]     = useState('');

  // ── Telegram code ──────────────────────────────────────────────────
  useEffect(() => {
    if (auth.isLoggedIn()) { router.push('/dashboard'); return; }
    if (tab !== 'telegram') return;
    const newCode = generateCode();
    setCode(newCode); codeRef.current = newCode;
    api.requestAuthCode(newCode)
      .then(() => setTimeout(() => setStatus('waiting'), 8000))
      .catch(() => setErrorMsg('Не удалось связаться с сервером.'));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [router, tab]);

  useEffect(() => {
    if (status !== 'waiting') return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.checkAuthStatus(codeRef.current);
        if (data.verified && data.id) {
          clearInterval(pollRef.current!);
          auth.setUser({ id: data.id, first_name: data.first_name || '', last_name: data.last_name,
            username: data.username, photo_url: data.photo_url, auth_date: data.auth_date, hash: '' });
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch {}
    }, 2000);
    const t = setTimeout(() => { clearInterval(pollRef.current!); setStatus('error'); setErrorMsg('Время вышло.'); }, 600_000);
    return () => { clearInterval(pollRef.current!); clearTimeout(t); };
  }, [status, router]);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const deepLink = code ? `https://t.me/${BOT_USERNAME}?start=auth_${code}` : '#';

  // ── Google OAuth ───────────────────────────────────────────────────
  const handleGoogle = async () => {
    if (!supabase) return;
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: CALLBACK_URL },
    });
    if (error) setErrorMsg(error.message);
  };

  // ── Apple OAuth ────────────────────────────────────────────────────
  const handleApple = async () => {
    if (!supabase) return;
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: CALLBACK_URL },
    });
    if (error) setErrorMsg(error.message);
  };

  // ── Email auth ─────────────────────────────────────────────────────
  const handleEmail = async () => {
    if (!supabase) return;
    setEmailError(''); setEmailLoading(true);
    try {
      if (emailMode === 'register') {
        if (!name.trim()) { setEmailError('Введите имя'); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: CALLBACK_URL },
        });
        if (error) { setEmailError(error.message); return; }
        setEmailError('✅ Подтвердите почту — письмо отправлено.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setEmailError(error.message); return; }
        if (data.session) {
          // Redirect to callback to complete registration
          window.location.href = '/auth/callback';
        }
      }
    } finally { setEmailLoading(false); }
  };

  // ── Styles ─────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--s-surface)', border: '1px solid var(--s-border)',
    borderRadius: '24px', padding: '28px',
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid var(--s-border)', background: 'var(--s-fill)',
    color: 'var(--s-text)', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  };
  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '13px', borderRadius: '999px', border: 'none',
    background: 'var(--s-primary)', color: '#fff', fontSize: '15px',
    fontWeight: 600, cursor: 'pointer',
  };
  const btnOutline: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid var(--s-border)', background: 'var(--s-fill)',
    color: 'var(--s-text)', fontSize: '14px', fontWeight: 500,
    cursor: SUPABASE_CONFIGURED ? 'pointer' : 'not-allowed',
    opacity: SUPABASE_CONFIGURED ? 1 : 0.45,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'telegram', label: 'Telegram' },
    { id: 'google',   label: 'Google'   },
    { id: 'apple',    label: 'Apple'    },
    { id: 'email',    label: 'Email'    },
  ];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--s-bg)' }}>
      {/* Nav */}
      <nav style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--s-border)',
        background: 'rgba(var(--s-surface-raw,255,255,255),0.82)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <SymedLogo size={26} />
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--s-text)', letterSpacing: '-0.3px' }}>Symed</span>
        </button>
        <ThemeToggle />
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <SymedLogo size={52} />
            <h1 style={{ fontWeight: 700, fontSize: '24px', color: 'var(--s-text)', margin: '12px 0 4px', letterSpacing: '-0.5px' }}>
              Войти в Symed
            </h1>
            <p style={{ color: 'var(--s-text-secondary)', fontSize: '14px' }}>Выберите удобный способ</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px',
            background: 'var(--s-fill)', padding: '4px', borderRadius: '14px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setErrorMsg(''); setEmailError(''); }}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                  background: tab === t.id ? 'var(--s-surface)' : 'transparent',
                  color: tab === t.id ? 'var(--s-text)' : 'var(--s-text-secondary)',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Success ── */}
          {status === 'success' ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 28px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Check size={28} color="white" />
              </div>
              <p style={{ fontWeight: 600, fontSize: '17px', color: 'var(--s-text)' }}>Вход выполнен</p>
              <p style={{ color: 'var(--s-text-secondary)', fontSize: '14px', marginTop: 4 }}>Перенаправляем…</p>
            </div>
          ) : (
            <>
              {/* ── Telegram tab ── */}
              {tab === 'telegram' && (
                <div style={card}>
                  <p style={{ fontSize: '14px', color: 'var(--s-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    Нажмите кнопку — Telegram откроется и вы войдёте автоматически. Либо скопируйте код и отправьте боту вручную.
                  </p>

                  <a href={deepLink} target="_blank" rel="noopener noreferrer"
                    style={{ ...btnPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      textDecoration: 'none', marginBottom: '16px', opacity: code ? 1 : 0.5, pointerEvents: code ? 'auto' : 'none' }}>
                    <Send size={15} />
                    Войти через Telegram
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--s-border)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>или код вручную</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--s-border)' }} />
                  </div>

                  <div style={{ background: 'var(--s-fill)', borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '6px', color: 'var(--s-text)' }}>
                      {code || '------'}
                    </div>
                    <button onClick={copyCode} style={{ marginTop: '10px', background: copied ? '#34c759' : 'var(--s-surface)',
                      color: copied ? '#fff' : 'var(--s-text)', border: '1px solid var(--s-border)',
                      borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                  </div>

                  {status === 'waiting' && !errorMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--s-text-muted)' }}>
                      <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: 'var(--s-primary)' }} />
                      Ожидаем подтверждения…
                    </div>
                  )}
                  {errorMsg && (
                    <div style={{ fontSize: '13px', color: '#ff3b30', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                      <AlertCircle size={13} /> {errorMsg}
                    </div>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--s-text-muted)', textAlign: 'center', marginTop: '12px' }}>
                    Код действителен 10 минут
                  </p>
                </div>
              )}

              {/* ── Google tab ── */}
              {tab === 'google' && (
                <div style={card}>
                  <p style={{ fontSize: '14px', color: 'var(--s-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                    Войдите через аккаунт Google одним нажатием.
                  </p>
                  <button onClick={handleGoogle} disabled={!SUPABASE_CONFIGURED} style={btnOutline}>
                    {/* Google G */}
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Продолжить с Google
                  </button>
                  {!SUPABASE_CONFIGURED && (
                    <p style={{ fontSize: '11px', color: 'var(--s-text-muted)', textAlign: 'center', marginTop: '10px' }}>
                      Требуются переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </p>
                  )}
                  {errorMsg && (
                    <div style={{ fontSize: '13px', color: '#ff3b30', marginTop: '12px', display: 'flex', gap: '6px' }}>
                      <AlertCircle size={13} /> {errorMsg}
                    </div>
                  )}
                </div>
              )}

              {/* ── Apple tab ── */}
              {tab === 'apple' && (
                <div style={card}>
                  <p style={{ fontSize: '14px', color: 'var(--s-text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                    Войдите через Apple ID.
                  </p>
                  <button onClick={handleApple} disabled={!SUPABASE_CONFIGURED} style={{ ...btnOutline, background: 'var(--s-text)', color: 'var(--s-bg)' }}>
                    {/* Apple  */}
                    <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-156.4-108.6C46 588.4 0 484.7 0 385.3C0 214.2 108.2 123.7 214.3 123.7c63.5 0 116.6 42.1 154.5 42.1 36.7 0 94.9-44.6 165.3-44.6 25.7 0 108.2 2.6 164 96.3zm-224.8-100.8C539 190.8 559 128 559 68c0-4.1-.2-8.2-.5-11.8C497.5 58.1 429.3 98.9 385.5 157.1c-37.6 51.6-66 126.2-66 200.1 0 5.7.5 11.3.7 13.2 3.9.4 10.2.8 16.4.8 54.1 0 117.5-37.7 147.7-100z"/>
                    </svg>
                    Продолжить с Apple
                  </button>
                  {!SUPABASE_CONFIGURED && (
                    <p style={{ fontSize: '11px', color: 'var(--s-text-muted)', textAlign: 'center', marginTop: '10px' }}>
                      Требуются ключи Supabase + Apple Developer аккаунт
                    </p>
                  )}
                  {errorMsg && (
                    <div style={{ fontSize: '13px', color: '#ff3b30', marginTop: '12px', display: 'flex', gap: '6px' }}>
                      <AlertCircle size={13} /> {errorMsg}
                    </div>
                  )}
                </div>
              )}

              {/* ── Email tab ── */}
              {tab === 'email' && (
                <div style={card}>
                  {/* Login / Register toggle */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px',
                    background: 'var(--s-fill)', padding: '3px', borderRadius: '10px' }}>
                    {(['login','register'] as EmailMode[]).map(m => (
                      <button key={m} onClick={() => { setEmailMode(m); setEmailError(''); }}
                        style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '13px', fontWeight: 600,
                          background: emailMode === m ? 'var(--s-surface)' : 'transparent',
                          color: emailMode === m ? 'var(--s-text)' : 'var(--s-text-secondary)',
                          boxShadow: emailMode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                        {m === 'login' ? 'Войти' : 'Регистрация'}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {emailMode === 'register' && (
                      <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ваше имя" style={inp} />
                    )}
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email" style={inp} />
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Пароль" style={{ ...inp, paddingRight: '44px' }} />
                      <button onClick={() => setShowPass(p => !p)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text-secondary)', padding: 0 }}>
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>

                  {emailError && (
                    <p style={{ fontSize: '13px', color: emailError.startsWith('✅') ? '#34c759' : '#ff3b30',
                      marginTop: '10px', display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                      {!emailError.startsWith('✅') && <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />}
                      {emailError}
                    </p>
                  )}

                  <button onClick={handleEmail} disabled={emailLoading || !SUPABASE_CONFIGURED}
                    style={{ ...btnPrimary, marginTop: '16px', opacity: (!SUPABASE_CONFIGURED || emailLoading) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {emailLoading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    <Mail size={15} />
                    {emailMode === 'login' ? 'Войти' : 'Создать аккаунт'}
                  </button>

                  {!SUPABASE_CONFIGURED && (
                    <p style={{ fontSize: '11px', color: 'var(--s-text-muted)', textAlign: 'center', marginTop: '10px' }}>
                      Требуются переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '20px' }}>
            <button onClick={() => router.push('/consultation')}
              style={{ color: 'var(--s-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Консультация без входа →
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
