'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import PageHeader from '@/components/PageHeader';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = [
  { q: 'Как работает диагностика?', a: 'Вы описываете симптомы, AI задаёт уточняющие вопросы и формирует рекомендацию на основе вашего анамнеза.' },
  { q: 'Заменяет ли Symed врача?', a: 'Нет. Symed — вспомогательный инструмент. Всегда консультируйтесь с врачом для постановки диагноза и лечения.' },
  { q: 'Как авторизоваться?', a: 'Откройте раздел «Войти», скопируйте 6-значный код и отправьте его в Telegram-бот @SyMed_Bot. Код действует 24 часа.' },
  { q: 'Мои данные в безопасности?', a: 'Да. Данные хранятся в зашифрованной базе Supabase. Мы не передаём их третьим лицам.' },
  { q: 'Что такое анамнез?', a: 'Анамнез — это история вашего здоровья: хронические болезни, аллергии, наследственность, образ жизни. Он помогает AI давать точные рекомендации.' },
  { q: 'Как добавить лекарство?', a: 'Перейдите в раздел «Лекарства» и нажмите «+ Добавить». Укажите название, дозировку, частоту и время приёма.' },
  { q: 'Как экспортировать данные?', a: 'В разделе «Экспорт» нажмите «Скачать PDF» — браузер откроет диалог печати, выберите «Сохранить как PDF».' },
  { q: 'Что такое дневник здоровья?', a: 'Дневник позволяет фиксировать ежедневные показатели: температуру, давление, пульс, вес и самочувствие.' },
  { q: 'Как найти ближайшую клинику?', a: 'Откройте раздел «Клиники» — сайт запросит геолокацию и отсортирует учреждения по расстоянию от вас.' },
  { q: 'Можно без регистрации?', a: 'Да, консультация доступна без авторизации. Но для сохранения истории и анамнеза нужна привязка к Telegram.' },
];

export default function FAQPage() {
  const { theme } = useTheme();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <PageHeader title="Частые вопросы" />

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{
              background: 'var(--s-surface)', borderRadius: '14px',
              border: '1px solid var(--s-border)', overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px',
                  padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--s-text)', textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: '1.4' }}>{item.q}</span>
                {open === i
                  ? <ChevronUp size={16} color="var(--s-text-muted)" style={{ flexShrink: 0 }} />
                  : <ChevronDown size={16} color="var(--s-text-muted)" style={{ flexShrink: 0 }} />}
              </button>
              {open === i && (
                <div style={{
                  padding: '0 16px 14px',
                  fontSize: '14px', lineHeight: '1.6',
                  color: 'var(--s-text-muted)',
                  borderTop: '1px solid var(--s-border)',
                  paddingTop: '12px',
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
