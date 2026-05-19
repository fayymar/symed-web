'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown } from 'lucide-react';

const FAQ = [
  {
    q: 'Как начать консультацию?',
    a: 'Нажмите «Новая консультация» → опишите симптомы → ответьте на уточняющие вопросы → получите рекомендацию специалиста. Вход не обязателен — можно консультироваться как гость.',
  },
  {
    q: 'Заменяет ли Symed визит к врачу?',
    a: 'Нет. Symed — это предварительная оценка симптомов, которая помогает понять к какому специалисту обратиться. При острых или тяжёлых симптомах — обращайтесь к врачу или вызывайте скорую (103).',
  },
  {
    q: 'Зачем заполнять профиль и анамнез?',
    a: 'Хронические заболевания, аллергии и другие данные позволяют AI давать более точные рекомендации. Без анамнеза рекомендация будет более общей.',
  },
  {
    q: 'Безопасны ли мои данные?',
    a: 'Данные хранятся в защищённой базе Supabase. Они не передаются третьим лицам и не используются в рекламных целях.',
  },
  {
    q: 'Как войти в аккаунт?',
    a: 'Нажмите «Войти» → на сайте отобразится 6-значный код → откройте @medgg_bot в Telegram и отправьте ему этот код. Вход выполнится автоматически.',
  },
  {
    q: 'Что такое дневник здоровья?',
    a: 'Дневник здоровья — раздел для отслеживания показателей: температура, давление, пульс, вес, самочувствие. Записи можно вносить через Telegram-бота @medgg_bot.',
  },
  {
    q: 'Как добавить лекарство с напоминанием?',
    a: 'Напоминания о лекарствах настраиваются в Telegram-боте @medgg_bot: откройте бота → выберите «Лекарства» → «Добавить лекарство».',
  },
  {
    q: 'Как работает поиск клиник?',
    a: 'Раздел «Клиники» показывает список медицинских учреждений Ташкента с фильтром по специализации. В будущем появится поиск по геолокации.',
  },
  {
    q: 'Что такое экспорт анамнеза?',
    a: 'Экспорт формирует текстовый файл с вашими данными профиля, историей болезни и последними консультациями — удобно взять с собой на приём к врачу.',
  },
  {
    q: 'Можно ли использовать без Telegram?',
    a: 'Да — консультации доступны без входа. Для сохранения истории, дневника и лекарств нужна авторизация через Telegram.',
  },
];

export default function FaqPage() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--s-bg)' }}>
      <header className="px-6 py-3 sticky top-0 z-10"
        style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--s-fill-secondary)', color: 'var(--s-label)' }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Частые вопросы</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-2">
        {FAQ.map((item, i) => (
          <div key={i} className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
            <button className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-medium text-sm" style={{ color: 'var(--s-label)' }}>{item.q}</span>
              <ChevronDown size={16} strokeWidth={2}
                style={{ color: 'var(--s-tertiary)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--s-secondary)', borderTop: '1px solid var(--s-separator)', paddingTop: '12px' }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
