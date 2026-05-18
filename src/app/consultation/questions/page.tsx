'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, PenLine } from 'lucide-react';
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
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--s-bg)' }}>
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--s-blue)' }} />
          <p style={{ color: 'var(--s-secondary)' }}>Обрабатываю ответы...</p>
        </div>
      </main>
    );
  }

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <main className="min-h-screen" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.push('/consultation')}
              className="w-8 h-8 flex items-center justify-center rounded-full transition"
              style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Уточняющие вопросы</span>
            <span className="ml-auto text-sm" style={{ color: 'var(--s-tertiary)' }}>{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--s-fill-secondary)' }}>
            <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--s-blue)' }} />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-8 leading-snug" style={{ color: 'var(--s-label)' }}>
          {current.question}
        </h2>

        <div className="flex flex-col gap-2.5">
          {current.options?.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}
              className="w-full text-left px-5 py-4 rounded-2xl font-medium transition hover:opacity-90 active:scale-[0.99]"
              style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }}>
              {opt}
            </button>
          ))}

          {!showCustom ? (
            <button onClick={() => setShowCustom(true)}
              className="w-full text-left px-5 py-4 rounded-2xl transition flex items-center gap-2"
              style={{ border: '1.5px dashed var(--s-separator)', color: 'var(--s-secondary)', background: 'transparent' }}>
              <PenLine size={15} />
              Написать свой ответ
            </button>
          ) : (
            <div className="flex gap-2">
              <input autoFocus value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && custom.trim() && handleAnswer(custom.trim())}
                placeholder="Ваш ответ..."
                className="flex-1 px-4 py-3 rounded-2xl focus:outline-none text-sm"
                style={{ border: '1.5px solid var(--s-blue)', background: 'var(--s-surface)', color: 'var(--s-label)' }} />
              <button onClick={() => custom.trim() && handleAnswer(custom.trim())}
                className="px-5 py-3 rounded-2xl font-semibold text-white text-sm"
                style={{ background: 'var(--s-blue)' }}>OK</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
