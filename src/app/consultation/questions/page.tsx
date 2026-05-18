'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, PenLine, Check } from 'lucide-react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useConsultation } from '@/context/ConsultationContext';

// Схлопываем дублирующиеся "Ничего из..." в один вариант
function deduplicateOptions(options: string[]): string[] {
  const result: string[] = [];
  let hasNone = false;
  for (const opt of options) {
    if (/^ничего/i.test(opt.trim())) {
      if (!hasNone) { result.push('Ничего из перечисленного'); hasNone = true; }
    } else {
      result.push(opt);
    }
  }
  return result;
}

// Мульти-выбор если в опциях есть "Ничего из..." — значит варианты независимы
function isMultiSelect(options: string[]): boolean {
  return options.some(o => /^ничего/i.test(o.trim()));
}

export default function QuestionsPage() {
  const router = useRouter();
  const { sessionId, questions, answers, addAnswer, setAnamnesisQuestions } = useConsultation();
  const [sending, setSending] = useState(false);
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selected, setSelected] = useState<string[]>([]); // для мульти-выбора

  const currentIndex = answers.length;
  const current = questions[currentIndex];
  const isDone = currentIndex >= questions.length;

  const options = current ? deduplicateOptions(current.options || []) : [];
  const multi = current ? isMultiSelect(options) : false;

  // Сбрасываем выбор при смене вопроса
  useEffect(() => { setSelected([]); setShowCustom(false); setCustom(''); }, [currentIndex]);

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

  // Одиночный выбор
  const handleSingle = (answer: string) => {
    addAnswer(answer);
    setShowCustom(false);
    setCustom('');
  };

  // Мульти-выбор: тоггл
  const handleToggle = (opt: string) => {
    const isNone = /^ничего/i.test(opt.trim());
    setSelected(prev => {
      if (isNone) {
        // Выбор "Ничего" снимает всё остальное
        return prev.includes(opt) ? [] : [opt];
      }
      // Выбор любого другого снимает "Ничего"
      const without = prev.filter(s => !/^ничего/i.test(s.trim()));
      return without.includes(opt)
        ? without.filter(s => s !== opt)
        : [...without, opt];
    });
  };

  // Подтверждение мульти-выбора
  const handleConfirm = () => {
    if (selected.length === 0) return;
    addAnswer(selected.join(', '));
    setSelected([]);
  };

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
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--s-bg)' }}>
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

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col flex-1 w-full">
        <h2 className="text-xl font-semibold mb-2 leading-snug" style={{ color: 'var(--s-label)' }}>
          {current.question}
        </h2>

        {multi && (
          <p className="text-sm mb-5" style={{ color: 'var(--s-secondary)' }}>
            Можно выбрать несколько вариантов
          </p>
        )}
        {!multi && <div className="mb-5" />}

        <div className="flex flex-col gap-2.5 flex-1">
          {options.map((opt, i) => {
            const isNone = /^ничего/i.test(opt.trim());

            if (multi) {
              const active = selected.includes(opt);
              return (
                <button key={i} onClick={() => handleToggle(opt)}
                  className="w-full text-left px-5 py-4 rounded-2xl transition flex items-center justify-between gap-3 active:scale-[0.99]"
                  style={{
                    background: active ? 'var(--s-blue)' : 'var(--s-surface)',
                    color: active ? '#fff' : 'var(--s-label)',
                    border: active ? '1px solid var(--s-blue)' : `1px solid ${isNone ? 'var(--s-separator)' : 'var(--s-separator)'}`,
                    opacity: isNone && selected.length > 0 && !active ? 0.5 : 1,
                  }}>
                  <span className="font-medium">{opt}</span>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--s-fill-secondary)',
                      border: active ? 'none' : '1px solid var(--s-separator)',
                    }}>
                    {active && <Check size={12} strokeWidth={3} color="white" />}
                  </div>
                </button>
              );
            }

            // Одиночный выбор
            return (
              <button key={i} onClick={() => handleSingle(opt)}
                className="w-full text-left px-5 py-4 rounded-2xl font-medium transition hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }}>
                {opt}
              </button>
            );
          })}

          {/* Свой ответ */}
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
                onKeyDown={e => {
                  if (e.key === 'Enter' && custom.trim()) {
                    multi ? setSelected(prev => [...prev.filter(s => !/^ничего/i.test(s)), custom.trim()]) : handleSingle(custom.trim());
                    setCustom(''); setShowCustom(false);
                  }
                }}
                placeholder="Ваш ответ..."
                className="flex-1 px-4 py-3 rounded-2xl focus:outline-none text-sm"
                style={{ border: '1.5px solid var(--s-blue)', background: 'var(--s-surface)', color: 'var(--s-label)' }} />
              <button onClick={() => {
                if (!custom.trim()) return;
                if (multi) { setSelected(prev => [...prev.filter(s => !/^ничего/i.test(s)), custom.trim()]); setCustom(''); setShowCustom(false); }
                else { handleSingle(custom.trim()); }
              }}
                className="px-5 py-3 rounded-2xl font-semibold text-white text-sm"
                style={{ background: 'var(--s-blue)' }}>OK</button>
            </div>
          )}
        </div>

        {/* Кнопка подтверждения для мульти-выбора */}
        {multi && (
          <div className="pt-6">
            <button onClick={handleConfirm} disabled={selected.length === 0}
              className="w-full py-4 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-30"
              style={{ background: 'var(--s-blue)' }}>
              <Check size={16} strokeWidth={2.5} />
              Подтвердить {selected.length > 0 ? `(${selected.length})` : ''}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
