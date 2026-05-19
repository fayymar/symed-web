'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { MapPin, Phone, Clock, Navigation, Loader2, AlertCircle, ArrowLeft, Building2, Search } from 'lucide-react';

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  type: string;
  specializations?: string[];
  lat: number;
  lng: number;
  distance?: number;
}

const CLINICS: Clinic[] = [
  { id: 1, name: 'Городская клиническая больница №1', address: 'ул. Ленина, 23', phone: '+7 (495) 123-45-67', hours: 'Пн–Пт: 8:00–20:00, Сб: 9:00–15:00', type: 'hospital', specializations: ['Терапевт', 'Хирург', 'Кардиолог', 'Невролог'], lat: 55.7558, lng: 37.6173 },
  { id: 2, name: 'Поликлиника №5', address: 'пр. Мира, 45', phone: '+7 (495) 234-56-78', hours: 'Пн–Пт: 7:30–20:00, Сб: 8:00–14:00', type: 'polyclinic', specializations: ['Терапевт', 'Педиатр', 'Гинеколог', 'Офтальмолог'], lat: 55.760, lng: 37.630 },
  { id: 3, name: 'Медицинский центр «Здоровье»', address: 'ул. Садовая, 12', phone: '+7 (495) 345-67-89', hours: 'Ежедневно: 9:00–21:00', type: 'clinic', specializations: ['Дерматолог', 'Эндокринолог', 'УЗИ', 'Лабораторная диагностика'], lat: 55.750, lng: 37.610 },
  { id: 4, name: 'Аптека «Фармация»', address: 'ул. Тверская, 8', phone: '+7 (495) 456-78-90', hours: 'Ежедневно: 8:00–22:00', type: 'pharmacy', lat: 55.765, lng: 37.605 },
  { id: 5, name: 'Скорая медицинская помощь', address: 'ул. Профсоюзная, 78', phone: '+7 (495) 567-89-01', hours: 'Круглосуточно', type: 'emergency', lat: 55.748, lng: 37.640 },
  { id: 6, name: 'Диагностический центр «МРТ-Плюс»', address: 'Кутузовский пр., 33', phone: '+7 (495) 678-90-12', hours: 'Пн–Сб: 8:00–20:00', type: 'diagnostics', specializations: ['МРТ', 'КТ', 'Рентген', 'ЭКГ'], lat: 55.742, lng: 37.570 },
];

const TYPES = [
  { value: '', label: 'Все' },
  { value: 'hospital', label: 'Больницы' },
  { value: 'polyclinic', label: 'Поликлиники' },
  { value: 'clinic', label: 'Клиники' },
  { value: 'pharmacy', label: 'Аптеки' },
  { value: 'emergency', label: 'Скорая' },
  { value: 'diagnostics', label: 'Диагностика' },
];

const TYPE_COLORS: Record<string, string> = {
  hospital: '#3b82f6', polyclinic: '#10b981', clinic: '#8b5cf6',
  pharmacy: '#f59e0b', emergency: '#ef4444', diagnostics: '#6366f1',
};

function deg2rad(d: number) { return d * Math.PI / 180; }
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1), dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ClinicsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>(CLINICS);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoOk, setGeoOk] = useState(false);

  useEffect(() => { requestLocation(); }, []);

  function requestLocation() {
    if (!navigator.geolocation) { setGeoError('Геолокация не поддерживается браузером'); return; }
    setGeoLoading(true); setGeoError(''); setGeoOk(false);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const sorted = CLINICS
          .map(c => ({ ...c, distance: getDistance(lat, lng, c.lat, c.lng) }))
          .sort((a, b) => a.distance - b.distance);
        setClinics(sorted);
        setGeoOk(true);
        setGeoLoading(false);
      },
      err => {
        setGeoLoading(false);
        setGeoError(err.code === 1 ? 'Доступ к местоположению отклонён' : 'Не удалось определить местоположение');
      }
    );
  }

  const filtered = clinics.filter(c => {
    const matchType = !typeFilter || c.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
      || (c.specializations ?? []).some(s => s.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--s-bg)', color: 'var(--s-text)' }}>
      <header style={{ background: 'var(--s-surface)', borderBottom: '1px solid var(--s-border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text-muted)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <Building2 size={22} color="var(--s-primary)" />
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, flex: 1 }}>Клиники</h1>
        <ThemeToggle />
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        {geoLoading && (
          <div style={{ background: 'var(--s-surface)', borderRadius: '10px', border: '1px solid var(--s-border)', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--s-text-muted)', fontSize: '14px' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            Определяем местоположение…
          </div>
        )}
        {geoOk && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '13px' }}>
            <Navigation size={15} /> Местоположение определено — клиники отсортированы по расстоянию
          </div>
        )}
        {geoError && (
          <div style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--s-text-muted)' }}><AlertCircle size={15} /> {geoError}</span>
            <button onClick={requestLocation} style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>Повторить</button>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--s-text-muted)' }} />
          <input type="text" placeholder="Поиск по названию, адресу, специальности…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: '10px', padding: '10px 12px 10px 36px', color: 'var(--s-text)', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)} style={{
              background: typeFilter === t.value ? 'var(--s-primary)' : 'var(--s-surface)',
              color: typeFilter === t.value ? '#fff' : 'var(--s-text)',
              border: `1px solid ${typeFilter === t.value ? 'var(--s-primary)' : 'var(--s-border)'}`,
              borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '12px' }}>Найдено: {filtered.length}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--s-text-muted)' }}>
              <Building2 size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Ничего не найдено</p>
            </div>
          )}
          {filtered.map(c => {
            const color = TYPE_COLORS[c.type] ?? 'var(--s-primary)';
            const typeLabel = TYPES.find(t => t.value === c.type)?.label ?? c.type;
            return (
              <div key={c.id} style={{ background: 'var(--s-surface)', borderRadius: '14px', border: '1px solid var(--s-border)', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{c.name}</div>
                    <span style={{ background: color + '20', color, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{typeLabel}</span>
                  </div>
                  {c.distance !== undefined && (
                    <div style={{ background: 'var(--s-bg)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontWeight: 600, color: 'var(--s-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <Navigation size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {c.distance < 1 ? `${Math.round(c.distance * 1000)} м` : `${c.distance.toFixed(1)} км`}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '6px' }}>
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: '1px' }} /><span>{c.address}</span>
                </div>
                {c.hours && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: 'var(--s-text-muted)', marginBottom: '6px' }}>
                    <Clock size={14} style={{ flexShrink: 0, marginTop: '1px' }} /><span>{c.hours}</span>
                  </div>
                )}
                {c.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '8px' }}>
                    <Phone size={14} color="var(--s-primary)" style={{ flexShrink: 0 }} />
                    <a href={`tel:${c.phone}`} style={{ color: 'var(--s-primary)', textDecoration: 'none', fontWeight: 500 }}>{c.phone}</a>
                  </div>
                )}
                {c.specializations && c.specializations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {c.specializations.map(s => (
                      <span key={s} style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: 'var(--s-text-muted)' }}>{s}</span>
                    ))}
                  </div>
                )}
                <a href={`https://maps.google.com/?q=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: 'var(--s-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  <MapPin size={14} /> Открыть на карте
                </a>
              </div>
            );
          })}
        </div>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
