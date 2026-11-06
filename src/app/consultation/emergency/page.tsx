'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Phone } from 'lucide-react';

/**
 * Показывается, когда в симптомах найдены «красные флаги» (признаки
 * состояния, требующего экстренной помощи). Консультация не продолжается.
 */
export default function EmergencyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--s-bg)' }}>
      <div className="max-w-md w-full rounded-3xl p-6 text-center"
        style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.35)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--s-red)' }}>
          <AlertTriangle size={30} color="white" />
        </div>
        <h1 className="text-xl font-semibold mb-3" style={{ color: 'var(--s-red)' }}>
          Немедленно вызовите скорую помощь
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--s-label)' }}>
          Описанные симптомы могут указывать на состояние, которое требует срочной
          медицинской помощи. Не ждите и не занимайтесь самолечением.
        </p>
        <a href="tel:103"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold mb-3"
          style={{ background: 'var(--s-red)', color: 'white' }}>
          <Phone size={18} /> Позвонить 103
        </a>
        <a href="tel:112"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-medium mb-5"
          style={{ border: '1px solid var(--s-red)', color: 'var(--s-red)' }}>
          <Phone size={16} /> Единый номер 112
        </a>
        <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--s-secondary)' }}>
          На главную
        </button>
      </div>
    </main>
  );
}
