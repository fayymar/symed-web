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
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    if (!sessionId) { router.push('/consultation'); return; }
  }, [sessionId, router]);

  useEffect(() => {
    if (isDone && sessionId) {
      // All answered — send to backend
      const send = async () => {
        setSending(true);
        try {
          const user = auth.getUser()!;
          await api.sendAnswers(sessionId, user.id, answers);
          // Get duration question
          const data = await api.sendDuration(sessionId, '');
          setAnamnesisQuestions(data.anamnesis_questions || []);
          router.push('/consultation/duration');
        } catch {
          router.push('/consultation/duration');
        } finally {
          setSending(false);
        }
      };
      send();
    }
  }, [isDone, sessionId, answers, router, setAnamnesisQuestions]);

  const handleAnswer = (answer: string) => {
    addAnswer(answer);
    setShowCustom(false);
    setCustom('');
  };

  const handleCustomSubmit = () => {
    if (custom.trim()) handleAnswer(custom.trim());
  };

  if (!current || sending) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🩺</div>
          <p className="text-gray-600">Обрабатываю ответы...</p>
        </div>
      </main>
    );
  }

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.push('/consultation')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
            <span className="font-semibold text-gray-900">Уточняющие вопросы</span>
            <span className="ml-auto text-sm text-gray-400">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">❓ {current.question}</h2>

        <div className="flex flex-col gap-3">
          {current.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left bg-white border-2 border-gray-200 rounded-xl px-5 py-4 font-medium text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition"
            >
              {opt}
            </button>
          ))}

          {/* Custom answer */}
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full text-left border-2 border-dashed border-gray-300 rounded-xl px-5 py-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
            >
              ✏️ Написать свой ответ
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="Ваш ответ..."
                className="flex-1 border-2 border-blue-400 rounded-xl px-4 py-3 focus:outline-none"
              />
              <button
                onClick={handleCustomSubmit}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
