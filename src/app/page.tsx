import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--apple-bg)' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--apple-separator)' }}
        className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
            СимптоМед
          </span>
          <div className="flex items-center gap-3">
            <Link href="/auth"
              className="text-sm font-medium px-4 py-2 rounded-full transition"
              style={{ color: 'var(--apple-blue)' }}>
              Войти
            </Link>
            <Link href="/consultation"
              className="text-sm font-medium px-5 py-2 rounded-full text-white transition"
              style={{ background: 'var(--apple-blue)' }}>
              Начать
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: 'var(--apple-blue-light)', color: 'var(--apple-blue)' }}>
            🩺 Медицинский ИИ-помощник
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--apple-label)', lineHeight: 1.1 }}>
            Опишите симптомы.<br />
            <span style={{ color: 'var(--apple-blue)' }}>Получите ответ.</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto"
            style={{ color: 'var(--apple-secondary)', lineHeight: 1.6 }}>
            СимптоМед анализирует симптомы и подсказывает к какому специалисту обратиться.
            Быстро, точно, бесплатно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consultation"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold transition hover:opacity-90"
              style={{ background: 'var(--apple-blue)' }}>
              Начать консультацию
            </Link>
            <Link href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition"
              style={{ background: 'var(--apple-surface)', color: 'var(--apple-label)', border: '1px solid var(--apple-separator)' }}>
              Войти через Telegram
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { icon: '⚡️', title: 'За 2 минуты', desc: 'Введите симптомы и сразу получите рекомендацию специалиста' },
            { icon: '🧠', title: 'ИИ-анализ', desc: 'Система учитывает историю болезней, анамнез и актуальные данные' },
            { icon: '🔒', title: 'Приватно', desc: 'Данные хранятся в зашифрованной базе и не передаются третьим лицам' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-3xl p-8"
              style={{ background: 'var(--apple-surface)', border: '1px solid var(--apple-separator)' }}>
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--apple-label)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--apple-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-12"
          style={{ background: 'var(--apple-label)' }}>
          <h2 className="text-3xl font-bold text-white mb-4">Попробуйте прямо сейчас</h2>
          <p className="mb-8" style={{ color: '#86868B' }}>Без регистрации — просто опишите как вы себя чувствуете</p>
          <Link href="/consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition hover:opacity-90"
            style={{ background: 'var(--apple-blue)', color: '#fff' }}>
            Начать бесплатно →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm" style={{ color: 'var(--apple-tertiary)', borderTop: '1px solid var(--apple-separator)' }}>
        © 2026 СимптоМед · symed.uz · Не является заменой консультации врача
      </footer>
    </main>
  );
}
