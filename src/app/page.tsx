import Link from 'next/link';
import { Stethoscope, Zap, Brain, Shield, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--s-bg)', color: 'var(--s-label)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-3" style={{ background: 'var(--s-nav-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--s-separator)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--s-blue)' }}>
              <Stethoscope size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-base tracking-tight">Symed</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth" className="text-sm font-medium px-4 py-1.5 rounded-full transition" style={{ color: 'var(--s-blue)' }}>Войти</Link>
            <Link href="/consultation" className="text-sm font-semibold px-5 py-1.5 rounded-full text-white transition" style={{ background: 'var(--s-blue)' }}>Начать</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center anim-fade-up">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8" style={{ background: 'var(--s-blue-light)', color: 'var(--s-blue)' }}>
            <Stethoscope size={12} strokeWidth={2.5} /> AI медицинский помощник
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Опишите симптомы.<br />
            <span style={{ color: 'var(--s-blue)' }}>Получите ответ.</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: 'var(--s-secondary)', lineHeight: 1.6 }}>
            Symed анализирует симптомы и подсказывает к какому специалисту обратиться. Быстро, точно, бесплатно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consultation" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold transition hover:opacity-90" style={{ background: 'var(--s-blue)' }}>
              Начать консультацию <ArrowRight size={16} />
            </Link>
            <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold transition" style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }}>
              Войти через Telegram
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Zap size={22} />, title: 'За 2 минуты', desc: 'Введите симптомы и сразу получите рекомендацию специалиста' },
            { icon: <Brain size={22} />, title: 'AI-анализ', desc: 'Система учитывает историю болезней, анамнез и актуальные данные' },
            { icon: <Shield size={22} />, title: 'Приватно', desc: 'Данные хранятся в зашифрованной базе и не передаются третьим лицам' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-3xl p-7" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--s-blue-light)', color: 'var(--s-blue)' }}>{icon}</div>
              <h3 className="text-base font-semibold mb-1.5">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--s-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-12" style={{ background: 'var(--s-label)' }}>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--s-bg)' }}>Попробуйте прямо сейчас</h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--s-tertiary)' }}>Без регистрации — просто опишите как вы себя чувствуете</p>
          <Link href="/consultation" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white transition hover:opacity-90" style={{ background: 'var(--s-blue)' }}>
            Начать бесплатно <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs" style={{ color: 'var(--s-tertiary)', borderTop: '1px solid var(--s-separator)' }}>
        © 2026 Symed · symed.uz · Не является заменой консультации врача
      </footer>
    </main>
  );
}
