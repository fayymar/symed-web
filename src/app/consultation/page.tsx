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

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    reset();
  }, [router, reset]);

  const handleSubmit = async () => {
    if (text.trim().length < 5) {
      setError('Опишите симптомы подробнее');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = auth.getUser()!;
      const data = await api.startConsultation(user.id, text.trim());

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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <span className="font-semibold text-gray-900">Новая консультация</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Опишите симптомы</h1>
        <p className="text-gray-500 mb-6">
          Расскажите что вас беспокоит — чем подробнее, тем точнее рекомендация
        </p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Например: болит голова с утра, температура 37.5, слабость..."
          rows={5}
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none text-base"
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-2 mb-6 text-xs text-gray-400">
          {text.length} символов
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || text.trim().length < 5}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Анализирую...' : 'Продолжить →'}
        </button>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ При острой боли в груди, потере сознания или других экстренных симптомах — немедленно вызовите скорую: <strong>103</strong>
        </div>
      </div>
    </main>
  );
}
