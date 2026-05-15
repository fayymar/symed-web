'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { useConsultation } from '@/context/ConsultationContext';

const URGENCY_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  high:   { color: 'bg-red-50 border-red-300 text-red-800',              label: 'Срочно',              icon: '🚨' },
  medium: { color: 'bg-yellow-50 border-yellow-300 text-yellow-800',     label: 'В ближайшее время',   icon: '⚠️' },
  low:    { color: 'bg-green-50 border-green-300 text-green-800',        label: 'Планово',             icon: '✅' },
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

  const urgency = URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.medium;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <span className="font-semibold text-gray-900">Результат консультации</span>
          {isLoggedIn && (
            <button
              onClick={() => router.push('/dashboard')}
              className="ml-auto text-sm text-gray-400 hover:text-gray-600"
            >
              Личный кабинет
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">

        {/* Urgency badge */}
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${urgency.color}`}>
          <span className="text-2xl">{urgency.icon}</span>
          <div>
            <div className="font-semibold">{urgency.label}</div>
            <div className="text-sm opacity-80">Рекомендуем обратиться к врачу</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">📋 Рекомендация</h2>
          <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
        </div>

        {/* Specialists */}
        {result.specialists?.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">👨‍⚕️ Специалисты</h2>
            <div className="flex flex-col gap-3">
              {result.specialists.map((spec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{spec.name}</span>
                      <span className="text-sm font-medium text-blue-600">{spec.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${spec.percentage}%` }} />
                    </div>
                    {spec.description && (
                      <p className="text-sm text-gray-500">{spec.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Записаться к врачу — требует авторизацию */}
            {isLoggedIn ? (
              <div className="mt-5">
                <button
                  onClick={() => setComingSoon(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  📅 Записаться к врачу
                </button>
                {comingSoon && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 text-center">
                    🔧 Функция в разработке — скоро появится!
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-700 mb-3">
                  Чтобы записаться к врачу, войдите через Telegram
                </p>
                <Link
                  href="/auth"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
                >
                  Войти и записаться
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          ⚠️ Это предварительная оценка, не диагноз. Обратитесь к врачу для точного обследования.
        </div>

        {/* Feedback */}
        {!feedback ? (
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-600 mb-4">Была ли рекомендация полезной?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setFeedback('good')}
                className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-100 transition"
              >
                👍 Да, помогло
              </button>
              <button
                onClick={() => setFeedback('bad')}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-100 transition"
              >
                👎 Не помогло
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-gray-600">
              {feedback === 'good' ? '👍 Спасибо! Рады помочь.' : '👎 Жаль. Попробуйте описать симптомы подробнее.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/consultation"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-center hover:bg-blue-700 transition"
          >
            Новая консультация
          </Link>
          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
