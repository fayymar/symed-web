'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

export default function SymptomsPage() {
  const router = useRouter();
  const { setSessionId, setSymptoms, setQuestions, reset } = useConsultation();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { reset(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (text.trim().length < 5) { setError('Опишите симптомы подробнее'); return; }
    setError(''); setLoading(true);
    try {
      const user = auth.getUser();
      const data = await api.startConsultation(user?.id ?? null, text.trim());
      if (data.red_flag) {
        router.push(`/consultation/emergency?msg=${encodeURIComponent(data.red_flag.text)}`);
        return;
      }
      setSessionId(data.session_id);
      setSymptoms(text.trim());
      setQuestions(data.questions || []);
      router.push('/consultation/questions');
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--apple-bg)' }}>
      <header className="px-6 py-4 sticky top-0 z-10" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push(auth.isLoggedIn() ? '/dashboard' : '/')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ background: 'var(--apple-separator)', color: 'var(--apple-label)' }}>
            ←
          </button>
          <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>Новая консультация</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>Опишите симптомы</h1>
        <p className="mb-8" style={{ color: 'var(--apple-secondary)' }}>
          Расскажите что вас беспокоит — чем подробнее, тем точнее рекомендация
        </p>

        <div className="rounded-3xl p-1 mb-3" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Например: болит голова с утра, температура 37.5, слабость..."
            rows={6}
            className="w-full px-5 py-4 text-base resize-none focus:outline-none rounded-3xl"
            style={{ background: 'transparent', color: 'var(--apple-label)' }}
          />
          <div className="px-5 pb-3 text-xs text-right" style={{ color: 'var(--apple-tertiary)' }}>{text.length} символов</div>
        </div>

        {error && <p className="text-sm mb-4" style={{ color: 'var(--apple-red)' }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading || text.trim().length < 5}
          className="w-full py-4 rounded-full font-semibold text-base text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--apple-blue)' }}>
          {loading ? 'Анализирую...' : 'Продолжить →'}
        </button>

        <div className="mt-6 p-4 rounded-2xl text-sm" style={{ background: '#FFF8EC', color: '#7A4800', border: '1px solid #FFD9A0' }}>
          ⚠️ При острой боли в груди или потере сознания — немедленно вызовите скорую: <strong>103</strong>
        </div>
      </div>
    </main>
  );
}
