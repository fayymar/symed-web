'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

export default function LoadingPage() {
  const router = useRouter();
  const { sessionId, duration, anamnesisAnswers, setResult } = useConsultation();
  const called = useRef(false);

  useEffect(() => {
    if (!sessionId) { router.push('/consultation'); return; }
    if (called.current) return;
    called.current = true;
    const run = async () => {
      try {
        await api.sendDuration(sessionId, duration);
        const data = await api.getResult(sessionId, anamnesisAnswers);
        setResult({ recommendation: data.recommendation || '', specialists: data.specialists || [], urgency: data.urgency || 'medium' });
        router.push('/consultation/result');
      } catch { router.push('/consultation/result'); }
    };
    run();
  }, [sessionId, duration, anamnesisAnswers, setResult, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8" style={{ background: 'var(--s-bg)' }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--s-blue)' }}>
        <Stethoscope size={36} color="white" strokeWidth={1.5} className="animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--s-label)' }}>Анализирую симптомы</p>
        <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>Подбираем подходящего специалиста...</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--s-blue)', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </main>
  );
}
