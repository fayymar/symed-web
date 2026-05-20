'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Stethoscope, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
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

      // Запускаем консультацию и параллельно проверяем профиль (если залогинен)
      const [data, profileData] = await Promise.all([
        api.startConsultation(user?.id ?? null, text.trim()),
        user ? api.getProfile(user.id) : Promise.resolve(null),
      ]);

      if (data.red_flag) {
        router.push(`/consultation/emergency?msg=${encodeURIComponent(data.red_flag.text)}`);
        return;
      }

      setSessionId(data.session_id);
      setSymptoms(text.trim());
      setQuestions(data.questions || []);

      // Если профиль не заполнен → сначала собираем анамнез
      const profileEmpty = user && (!profileData?.exists || !profileData?.profile?.chronic_diseases);
      if (profileEmpty) {
        router.push('/consultation/anamnesis');
      } else {
        router.push('/consultation/questions');
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push(auth.isLoggedIn() ? '/dashboard' : '/')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition"
            style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Новая консультация</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--s-blue-light)' }}>
            <Stethoscope size={20} style={{ color: 'var(--s-blue)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--s-label)' }}>Опишите симптомы</h1>
            <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Чем подробнее — тем точнее рекомендация</p>
          </div>
        </div>

        <div className="rounded-3xl mb-3 overflow-hidden"
          style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Например: болит голова с утра, температура 37.5, слабость..."
            rows={7}
            className="w-full px-5 py-4 text-base resize-none focus:outline-none"
            style={{ background: 'transparent', color: 'var(--s-label)' }}
          />
          <div className="px-5 pb-3 text-xs text-right" style={{ color: 'var(--s-tertiary)' }}>{text.length} символов</div>
        </div>

        {error && (
          <p className="text-sm mb-4 flex items-center gap-1.5" style={{ color: 'var(--s-red)' }}>
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading || text.trim().length < 5}
          className="w-full py-4 rounded-full font-semibold text-base text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'var(--s-blue)' }}>
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> Анализирую...</>
            : <>Продолжить <ArrowRight size={18} /></>}
        </button>

        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl text-sm"
          style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)', color: 'var(--s-secondary)' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--s-orange)' }} />
          <span>При острой боли в груди или потере сознания — вызовите скорую: <strong style={{ color: 'var(--s-label)' }}>103</strong></span>
        </div>
      </div>
    </main>
  );
}
