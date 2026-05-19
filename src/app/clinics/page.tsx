'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Phone, Search, Users } from 'lucide-react';

interface Clinic {
  name: string;
  address: string;
  phone: string;
  specializations: string[];
}

const CLINICS: Clinic[] = [
  { name: 'Akfa Medline', address: 'ул. Янги Шахар, 2А, Ташкент', phone: '+998712070101', specializations: ['Все'] },
  { name: 'Eurolab', address: 'пр. Амира Темура, 16, Ташкент', phone: '+998711204040', specializations: ['Все'] },
  { name: 'Central Clinic', address: 'ул. Мирабад, 12, Ташкент', phone: '+998712522222', specializations: ['Все'] },
  { name: 'Международная клиника Чиланзар', address: 'ул. Чиланзар, 2, Ташкент', phone: '+998712750303', specializations: ['Терапевт', 'Невролог', 'Хирург'] },
  { name: 'РСНПМЦТ', address: 'ул. Осиё, 1, Ташкент', phone: '+998712647777', specializations: ['Терапевт', 'Кардиолог'] },
  { name: 'Клиника Humomed', address: 'ул. Мустакиллик, 54, Ташкент', phone: '+998712009090', specializations: ['Все'] },
  { name: 'MedPark', address: 'пр. Бунёдкор, 5Б, Ташкент', phone: '+998712050505', specializations: ['Терапевт', 'Хирург', 'Гинеколог'] },
];

const SPECS = ['Все', 'Терапевт', 'Кардиолог', 'Невролог', 'Хирург', 'Гинеколог', 'Офтальмолог', 'Стоматолог'];

const SPECIALISTS = [
  { name: 'Терапевт', desc: 'Общая практика, простудные заболевания, направления к специалистам' },
  { name: 'Кардиолог', desc: 'Болезни сердца, давление, аритмия, ЭКГ' },
  { name: 'Невролог', desc: 'Головные боли, позвоночник, нервная система' },
  { name: 'Гастроэнтеролог', desc: 'Желудок, кишечник, печень, желчный пузырь' },
  { name: 'Эндокринолог', desc: 'Диабет, щитовидная железа, гормоны' },
  { name: 'Пульмонолог', desc: 'Лёгкие, бронхи, астма, кашель' },
  { name: 'Гинеколог', desc: 'Женское здоровье, репродуктивная система' },
  { name: 'Уролог', desc: 'Мочевыделительная система, мужское здоровье' },
  { name: 'Дерматолог', desc: 'Кожа, волосы, ногти' },
  { name: 'Офтальмолог', desc: 'Зрение, глаза, глазное давление' },
  { name: 'ЛОР', desc: 'Ухо, горло, нос, синусит' },
  { name: 'Хирург', desc: 'Хирургические вмешательства, травмы' },
];

type Tab = 'clinics' | 'specialists';

export default function ClinicsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('clinics');
  const [spec, setSpec] = useState('Все');
  const [search, setSearch] = useState('');

  const filtered = CLINICS.filter(c =>
    (spec === 'Все' || c.specializations.includes('Все') || c.specializations.includes(spec)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()))
  );

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
          <span className="font-semibold" style={{ color: 'var(--s-label)' }}>Клиники и специалисты</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'var(--s-surface)' }}>
          {(['clinics', 'specialists'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
              style={{
                background: tab === t ? 'var(--s-blue)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--s-secondary)',
              }}>
              {t === 'clinics' ? 'Клиники' : 'Специалисты'}
            </button>
          ))}
        </div>

        {tab === 'clinics' && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--s-tertiary)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск клиники..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none"
                style={{ background: 'var(--s-surface)', color: 'var(--s-label)', border: '1px solid var(--s-separator)' }} />
            </div>

            {/* Specialization filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {SPECS.map(s => (
                <button key={s} onClick={() => setSpec(s)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 transition"
                  style={{
                    background: spec === s ? 'var(--s-blue)' : 'var(--s-surface)',
                    color: spec === s ? '#fff' : 'var(--s-secondary)',
                    border: spec === s ? '1px solid var(--s-blue)' : '1px solid var(--s-separator)',
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {filtered.map((clinic, i) => (
                <div key={i} className="rounded-3xl p-5"
                  style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
                  <p className="font-semibold mb-2" style={{ color: 'var(--s-label)' }}>{clinic.name}</p>
                  <div className="flex items-start gap-2 mb-1.5">
                    <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--s-blue)' }} />
                    <span className="text-sm" style={{ color: 'var(--s-secondary)' }}>{clinic.address}</span>
                  </div>
                  <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 mt-2">
                    <Phone size={14} style={{ color: 'var(--s-blue)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--s-blue)' }}>{clinic.phone}</span>
                  </a>
                  {!clinic.specializations.includes('Все') && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {clinic.specializations.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--s-blue-light)', color: 'var(--s-blue)' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--s-tertiary)' }}>Ничего не найдено</p>
              )}
            </div>
          </>
        )}

        {tab === 'specialists' && (
          <div className="flex flex-col gap-3">
            {SPECIALISTS.map((s, i) => (
              <div key={i} className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{ background: 'var(--s-surface)', border: '1px solid var(--s-separator)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--s-blue-light)' }}>
                  <Users size={16} style={{ color: 'var(--s-blue)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--s-label)' }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--s-secondary)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
