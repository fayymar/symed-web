'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useConsultation } from '@/context/ConsultationContext';

const DURATION_OPTIONS = [
  'Сегодня', 'Несколько дней', '1–2 недели', '2–4 недели', 'Более месяца', 'Более 3 месяцев',
];

export default function DurationPage() {
  const router = useRouter();
  const { sessionId, setDuration } = useConsultation();

  useEffect(() => {
    if (!sessionId) { router.push('/consultation'); return; }
  }, [sessionId, router]);

  const handleSelect = (dur: string) => {
    setDuration(dur);
    router.push('/consultation/loading');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-2xl">←</button>
          <span className="font-semibold text-gray-900">Как давно это беспокоит?</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🗓 Как давно появились симптомы?</h2>
        <div className="flex flex-col gap-3">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="w-full text-left bg-white border-2 border-gray-200 rounded-xl px-5 py-4 font-medium text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
