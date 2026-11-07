import { auth } from './auth';
import { CONSENT_REQUIRED_EVENT, CONSENT_VERSION } from './consent';

import { API_BASE } from './config';

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
    // Бэкенд не принимает данные без согласия на обработку — показываем окно согласия
    if (res.status === 403 && msg === 'consent_required' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CONSENT_REQUIRED_EVENT));
    }
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

  // Пользователь определяется по токену; без токена консультация идёт в гостевом режиме.
  // Гость должен дать согласие прямо в форме — тогда передаём его версию.
  startConsultation: (symptoms: string, guestConsent = false) =>
    apiFetch(`${API_BASE}/api/consultation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        guestConsent
          ? { symptoms, consent_version: CONSENT_VERSION, consent_source: 'web' }
          : { symptoms },
      ),
    }),

  // Согласие на обработку данных (для вошедших пользователей)
  getConsent: () =>
    apiFetch(`${API_BASE}/api/consent`),

  acceptConsent: (source: 'web' | 'miniapp') =>
    apiFetch(`${API_BASE}/api/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: CONSENT_VERSION, source }),
    }),

  // Выйти на всех устройствах: сервер отзывает все токены этого пользователя
  logoutAll: () =>
    apiFetch(`${API_BASE}/api/auth/logout-all`, { method: 'POST' }),

  // Удалить аккаунт и все данные (отзыв согласия)
  deleteAccount: () =>
    apiFetch(`${API_BASE}/api/account`, { method: 'DELETE' }),

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
