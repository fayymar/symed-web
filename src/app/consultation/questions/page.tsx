'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

export default function QuestionsPage() {
  const router = useRouter();
  const { sessionId, questions, answers, addAnswer, setAnamnesisQuestions } = useConsultation();
  const [sending, setSending] = useState(false);
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const currentIndex = answers.length;
  const current = questions[currentIndex];
  const isDone = currentIndex >= questions.length;

  useEffect(() => {
    if (!sessionId) { router.push('/consultation'); return; }
  }, [sessionId, router]);

  useEffect(() => {
    if (isDone && sessionId) {
      const send = async () => {
        setSending(true);
        try {
          const user = auth.getUser();
          await api.sendAnswers(sessionId, user?.id ?? null, answers);
          const data = await api.sendDuration(sessionId, '');
          setAnamnesisQuestions(data.anamnesis_questions || []);
          router.push('/consultation/duration');
        } catch { router.push('/consultation/duration'); }
        finally { setSending(false); }
      };
      send();
    }
  }, [isDone, sessionId, answers, router, setAnamnesisQuestions]);

  const handleAnswer = (answer: string) => { addAnswer(answer); setShowCustom(false); setCustom(''); };

  if (!current || sending) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--apple-bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🩺</div>
          <p style={{ color: 'var(--apple-secondary)' }}>Обрабатываю ответы...</p>
        </div>
      </main>
    );
  }

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <main className="min-h-screen" style={{ background: 'var(--apple-bg)' }}>
      <header className="px-6 py-4 sticky top-0 z-10" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.push('/consultation')}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'var(--apple-separator)', color: 'var(--apple-label)' }}>←</button>
            <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>Уточняющие вопросы</span>
            <span className="ml-auto text-sm" style={{ color: 'var(--apple-tertiary)' }}>{currentIndex + 1} / {questions.length}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full" style={{ background: 'var(--apple-separator)' }}>
            <div className="h-1 rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--apple-blue)' }} />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-8" style={{ color: 'var(--apple-label)' }}>
          {current.question}
        </h2>

        <div className="flex flex-col gap-2">
          {current.options?.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}
              className="w-full text-left px-5 py-4 rounded-2xl font-medium transition hover:opacity-90"
              style={{ background: 'var(--apple-surface)', color: 'var(--apple-label)', border: '1px solid var(--apple-separator)' }}>
              {opt}
            </button>
          ))}

          {!showCustom ? (
            <button onClick={() => setShowCustom(true)}
              className="w-full text-left px-5 py-4 rounded-2xl transition"
              style={{ border: '1.5px dashed var(--apple-separator)', color: 'var(--apple-secondary)', background: 'transparent' }}>
              ✏️ Написать свой ответ
            </button>
          ) : (
            <div className="flex gap-2">
              <input autoFocus value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && custom.trim() && handleAnswer(custom.trim())}
                placeholder="Ваш ответ..."
                className="flex-1 px-4 py-3 rounded-2xl focus:outline-none"
                style={{ border: '1.5px solid var(--apple-blue)', background: 'var(--apple-surface)', color: 'var(--apple-label)' }} />
              <button onClick={() => custom.trim() && handleAnswer(custom.trim())}
                className="px-5 py-3 rounded-2xl font-semibold text-white"
                style={{ background: 'var(--apple-blue)' }}>OK</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
