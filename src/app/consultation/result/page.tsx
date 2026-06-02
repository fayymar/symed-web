'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle, ClipboardList, Users, ThumbsUp, ThumbsDown, CalendarPlus, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

interface UrgencyConfig {
  bg: string; border: string; text: string; label: string;
  icon: React.ReactNode;
}

function getUrgency(level: string): UrgencyConfig {
  if (level === 'high') return {
    bg: 'rgba(255,59,48,0.08)', border: 'rgba(255,59,48,0.2)',
    text: 'var(--s-red)', label: 'Срочно',
    icon: <AlertTriangle size={18} />,
  };
  if (level === 'low') return {
    bg: 'rgba(52,199,89,0.08)', border: 'rgba(52,199,89,0.2)',
    text: 'var(--s-green)', label: 'Планово',
    icon: <CheckCircle size={18} />,
  };
  return {
    bg: 'rgba(255,149,0,0.08)', border: 'rgba(255,149,0,0.2)',
    text: 'var(--s-orange)', label: 'В ближайшее время',
    icon: <Clock size={18} />,
  };
}

export default function ResultPage() {
  const router = useRouter();
  const { result, sessionId } = useConsultation();
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const isLoggedIn = auth.isLoggedIn();

  useEffect(() => {
    if (!result) { router.push('/consultation'); return; }
  }, [result, router]);

  if (!result) return null;

  const u = getUrgency(result.urgency);

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Результат консультации</span>
          {isLoggedIn && (
            <button onClick={() => router.push('/dashboard')} className="text-sm font-medium" style={{ color: 'var(--s-blue)' }}>
              Кабинет
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* Urgency */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{ background: u.bg, border: `1px solid ${u.border}` }}>
          <span style={{ color: u.text }}>{u.icon}</span>
          <div>
            <div className="font-semibold" style={{ color: u.text }}>{u.label}</div>
            <div className="text-sm" style={{ color: u.text, opacity: 0.75 }}>Рекомендуем обратиться к врачу</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-3xl p-6" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} style={{ color: 'var(--s-blue)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--s-label)' }}>Рекомендация</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--s-secondary)' }}>{result.recommendation}</p>
        </div>

        {/* Specialists */}
        {result.specialists?.length > 0 && (
          <div className="rounded-3xl p-6" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
            <div className="flex items-center gap-2 mb-5">
              <Users size={16} style={{ color: 'var(--s-blue)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--s-label)' }}>Специалисты</h2>
            </div>
            <div className="flex flex-col gap-4">
              {result.specialists.map((spec: { name: string; percentage: number; reason: string }, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: i === 0 ? 'var(--s-blue)' : i === 1 ? 'var(--s-secondary)' : 'var(--s-fill-secondary)', color: i > 1 ? 'var(--s-label)' : undefined }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm" style={{ color: 'var(--s-label)' }}>{spec.name}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--s-blue)' }}>{spec.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--s-fill-secondary)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${spec.percentage}%`, background: 'var(--s-blue)' }} />
                    </div>
                    {spec.reason && (
                      <p className="text-xs mt-1" style={{ color: 'var(--s-secondary)' }}>{spec.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              {isLoggedIn ? (
                <>
                  <button onClick={() => setComingSoon(true)}
                    className="w-full py-3.5 rounded-full font-semibold text-white text-sm transition hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: 'var(--s-green)' }}>
                    <CalendarPlus size={16} />
                    Записаться к врачу
                  </button>
                  {comingSoon && (
                    <p className="text-xs text-center mt-2" style={{ color: 'var(--s-tertiary)' }}>
                      Функция в разработке — скоро появится!
                    </p>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--s-blue-light)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--s-blue)' }}>
                    Войдите, чтобы записаться к врачу
                  </p>
                  <Link href="/auth"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'var(--s-blue)' }}>
                    Войти и записаться <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="rounded-3xl p-5 text-center" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
          {!feedback ? (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--s-secondary)' }}>Была ли рекомендация полезной?</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setFeedback('good'); if (sessionId) api.saveFeedback(sessionId, 'good').catch(() => {}); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
                  style={{ background: 'rgba(52,199,89,0.1)', color: 'var(--s-green)', border: '1px solid rgba(52,199,89,0.25)' }}>
                  <ThumbsUp size={14} /> Помогло
                </button>
                <button onClick={() => { setFeedback('bad'); if (sessionId) api.saveFeedback(sessionId, 'bad').catch(() => {}); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition"
                  style={{ background: 'rgba(255,59,48,0.08)', color: 'var(--s-red)', border: '1px solid rgba(255,59,48,0.2)' }}>
                  <ThumbsDown size={14} /> Не помогло
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--s-secondary)' }}>
              {feedback === 'good' ? 'Спасибо! Рады помочь.' : 'Жаль. Попробуйте описать симптомы подробнее.'}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center px-4" style={{ color: 'var(--s-tertiary)' }}>
          Это предварительная оценка, не диагноз. Обратитесь к врачу для точного обследования.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <Link href="/consultation"
            className="w-full py-4 rounded-full font-semibold text-center text-white"
            style={{ background: 'var(--s-blue)' }}>
            Новая консультация
          </Link>
          <Link href={isLoggedIn ? '/dashboard' : '/'}
            className="w-full py-4 rounded-full font-semibold text-center"
            style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }}>
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
