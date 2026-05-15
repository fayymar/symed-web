import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩺</span>
          <span className="font-bold text-xl text-gray-900">СимптоМед</span>
        </div>
        <div className="flex gap-3">
          <a
            href="https://t.me/medgg_bot"
            className="text-blue-600 font-medium hover:underline"
          >
            Открыть в Telegram
          </a>
          <Link
            href="/auth"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Войти
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Опишите симптомы —<br />
          <span className="text-blue-600">получите рекомендацию</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          СимптоМед помогает понять к какому врачу обратиться.
          Быстро, точно и без очередей.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Начать бесплатно
          </Link>
          <a
            href="https://t.me/medgg_bot"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition"
          >
            Открыть в Telegram
          </a>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Вход через Telegram — без паролей
        </p>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Как это работает
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '💬', title: 'Опишите симптомы', desc: 'Напишите что вас беспокоит — боль, температура, недомогание' },
            { step: '2', icon: '🔍', title: 'Ответьте на вопросы', desc: 'Уточняющие вопросы помогут точнее определить проблему' },
            { step: '3', icon: '👨‍⚕️', title: 'Получите рекомендацию', desc: 'Узнайте к какому специалисту обратиться и почему' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Возможности
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🩺', title: 'Умная диагностика', desc: 'Анализ симптомов с учётом вашего возраста, пола и истории болезней' },
              { icon: '📋', title: 'Медицинская история', desc: 'Хронические заболевания и аллергии учитываются при каждой консультации' },
              { icon: '📊', title: 'История консультаций', desc: 'Все рекомендации сохраняются и доступны в любой момент' },
              { icon: '🔒', title: 'Безопасность', desc: 'Авторизация через Telegram, данные хранятся в зашифрованной базе' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 bg-gray-50 rounded-xl">
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Готовы начать?
        </h2>
        <p className="text-gray-600 mb-8">Это бесплатно и занимает 2 минуты</p>
        <Link
          href="/auth"
          className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg inline-block"
        >
          Войти через Telegram
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-400">
        <p>© 2026 СимптоМед · symed.uz</p>
        <p className="mt-1">Не является заменой консультации врача</p>
      </footer>
    </main>
  );
}
