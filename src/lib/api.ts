import { auth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://telegram-doctor-bot.onrender.com';

/**
 * Все запросы к бэкенду идут через эту функцию: она добавляет токен сессии
 * (Authorization: Bearer). Если токен истёк или недействителен (401) —
 * выходим из аккаунта и отправляем на страницу входа.
 */
async function apiFetch(url: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  const token = auth.getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && token) {
    auth.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth';
    }
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  getProfile: (userId: number) =>
    apiFetch(`${API_BASE}/api/profile/${userId}`),

  saveProfile: (userId: number, data: object) =>
    apiFetch(`${API_BASE}/api/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Пользователь определяется по токену; без токена консультация идёт в гостевом режиме
  startConsultation: (symptoms: string) =>
    apiFetch(`${API_BASE}/api/consultation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms }),
    }),

  sendAnswers: (sessionId: string, answers: string[]) =>
    apiFetch(`${API_BASE}/api/consultation/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, answers }),
    }),

  sendDuration: (sessionId: string, duration: string) =>
    apiFetch(`${API_BASE}/api/consultation/duration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, duration }),
    }),

  getResult: (sessionId: string, anamnesisAnswers?: string[]) =>
    apiFetch(`${API_BASE}/api/consultation/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, anamnesis_answers: anamnesisAnswers ?? [] }),
    }),

  getConsultations: (userId: number) =>
    apiFetch(`${API_BASE}/api/consultations/${userId}`),

  getMedications: (userId: number) =>
    apiFetch(`${API_BASE}/api/medications/${userId}`),

  addMedication: (userId: number, data: object) =>
    apiFetch(`${API_BASE}/api/medications/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getDiary: (userId: number) =>
    apiFetch(`${API_BASE}/api/diary/${userId}`),

  addDiaryEntry: (userId: number, data: object) =>
    apiFetch(`${API_BASE}/api/diary/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getHealthMetrics: (userId: number, type?: string) =>
    apiFetch(`${API_BASE}/api/health/metrics/${userId}${type ? `?type=${type}` : ''}`),

  // Вход по коду, который бот прислал пользователю в Telegram (/login)
  loginWithCode: (code: string) =>
    apiFetch(`${API_BASE}/api/auth/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }),

  // Вход через Supabase (Google/Apple/email): бэкенд сам проверяет access_token
  socialLogin: (accessToken: string) =>
    apiFetch(`${API_BASE}/api/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    }),

  // Вход внутри Telegram (Mini App): бэкенд проверяет подпись initData
  telegramWebAppLogin: (initData: string) =>
    apiFetch(`${API_BASE}/api/auth/telegram-webapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data: initData }),
    }),

  // Привязать Telegram к текущему аккаунту кодом из бота
  linkTelegram: (code: string) =>
    apiFetch(`${API_BASE}/api/auth/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }),

  saveFeedback: (consultationId: number, rating: 'good' | 'bad') =>
    apiFetch(`${API_BASE}/api/consultation/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: consultationId, rating }),
    }),
};
