'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

export default function LoadingPage() {
  const router = useRouter();
  const { sessionId, duration, anamnesisAnswers, setResult } = useConsultation();
  const called = useRef(false);

  useEffect(() => {
    if (!auth.isLoggedIn()) { router.push('/auth'); return; }
    if (!sessionId) { router.push('/consultation'); return; }
    if (called.current) return;
    called.current = true;

    const run = async () => {
      try {
        // Send duration first
        await api.sendDuration(sessionId, duration);
        // Get result
        const data = await api.getResult(sessionId, anamnesisAnswers);
        setResult({
          recommendation: data.recommendation || '',
          specialists: data.specialists || [],
          urgency: data.urgency || 'medium',
        });
        router.push('/consultation/result');
      } catch {
        router.push('/consultation/result');
      }
    };
    run();
  }, [sessionId, duration, anamnesisAnswers, setResult, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <div className="text-6xl animate-bounce">🩺</div>
      <div className="text-xl font-semibold text-gray-700">Анализирую симптомы...</div>
      <div className="text-gray-500 text-center max-w-xs">
        Подбираем подходящего специалиста с учётом ваших данных
      </div>
      <div className="flex gap-2 mt-4">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </main>
  );
}
