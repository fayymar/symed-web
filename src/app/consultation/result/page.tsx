'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { useConsultation } from '@/context/ConsultationContext';

const URGENCY: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  high:   { bg: '#FFF2F2', text: '#C00',    label: 'Срочно',              icon: '🚨' },
  medium: { bg: '#FFFAEC', text: '#7A4800', label: 'В ближайшее время',   icon: '⚠️' },
  low:    { bg: '#F0FFF4', text: '#166534', label: 'Планово',             icon: '✅' },
};

export default function ResultPage() {
  const router = useRouter();
  const { result } = useConsultation();
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const isLoggedIn = auth.isLoggedIn();

  useEffect(() => {
    if (!result) { router.push('/consultation'); return; }
  }, [result, router]);

  if (!result) return null;

  const u = URGENCY[result.urgency] || URGENCY.medium;

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--apple-bg)' }}>
      <header className="px-6 py-4 sticky top-0 z-10" style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>Результат</span>
          {isLoggedIn && (
            <button onClick={() => router.push('/dashboard')} className="text-sm" style={{ color: 'var(--apple-blue)' }}>
              Кабинет
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* Urgency */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background: u.bg, border: `1px solid ${u.text}30` }}>
          <span className="text-2xl">{u.icon}</span>
          <div>
            <div className="font-semibold" style={{ color: u.text }}>{u.label}</div>
            <div className="text-sm" style={{ color: u.text, opacity: 0.7 }}>Рекомендуем обратиться к врачу</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-3xl p-6" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--apple-label)' }}>📋 Рекомендация</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--apple-secondary)' }}>{result.recommendation}</p>
        </div>

        {/* Specialists */}
        {result.specialists?.length > 0 && (
          <div className="rounded-3xl p-6" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
            <h2 className="font-semibold mb-5" style={{ color: 'var(--apple-label)' }}>👨‍⚕️ Специалисты</h2>
            <div className="flex flex-col gap-4">
              {result.specialists.map((spec, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm" style={{ color: 'var(--apple-label)' }}>{spec.name}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--apple-blue)' }}>{spec.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--apple-bg)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${spec.percentage}%`, background: 'var(--apple-blue)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Записаться */}
            <div className="mt-5">
              {isLoggedIn ? (
                <>
                  <button onClick={() => setComingSoon(true)}
                    className="w-full py-3.5 rounded-full font-semibold text-white text-sm transition hover:opacity-90"
                    style={{ background: 'var(--apple-green)' }}>
                    📅 Записаться к врачу
                  </button>
                  {comingSoon && (
                    <p className="text-xs text-center mt-2" style={{ color: 'var(--apple-tertiary)' }}>
                      🔧 Функция в разработке — скоро появится!
                    </p>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--apple-blue-light)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--apple-blue)' }}>
                    Войдите чтобы записаться к врачу
                  </p>
                  <Link href="/auth"
                    className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'var(--apple-blue)' }}>
                    Войти и записаться
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="rounded-3xl p-5 text-center" style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
          {!feedback ? (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--apple-secondary)' }}>Была ли рекомендация полезной?</p>
              <div className="flex gap-2 justify-center">
                {[['good','👍 Помогло','#F0FFF4','#166534'],['bad','👎 Не помогло','#FFF2F2','#C00']].map(([key,label,bg,color]) => (
                  <button key={key} onClick={() => setFeedback(key as 'good'|'bad')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
                    style={{ background: bg as string, color: color as string, border: `1px solid ${color}30` }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--apple-secondary)' }}>
              {feedback === 'good' ? '👍 Спасибо! Рады помочь.' : '👎 Жаль. Попробуйте описать симптомы подробнее.'}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center px-4" style={{ color: 'var(--apple-tertiary)' }}>
          ⚠️ Это предварительная оценка, не диагноз. Обратитесь к врачу для точного обследования.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <Link href="/consultation"
            className="w-full py-4 rounded-full font-semibold text-center text-white"
            style={{ background: 'var(--apple-blue)' }}>
            Новая консультация
          </Link>
          <Link href={isLoggedIn ? '/dashboard' : '/'}
            className="w-full py-4 rounded-full font-semibold text-center"
            style={{ background: 'var(--apple-surface)', color: 'var(--apple-label)', border: '1px solid var(--apple-separator)' }}>
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
