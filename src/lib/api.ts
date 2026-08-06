const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://telegram-doctor-bot.onrender.com';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
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

  startConsultation: (userId: number | null, symptoms: string) =>
    apiFetch(`${API_BASE}/api/consultation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(userId ? { user_id: userId } : {}), symptoms }),
    }),

  sendAnswers: (sessionId: string, userId: number | null, answers: string[]) =>
    apiFetch(`${API_BASE}/api/consultation/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, ...(userId ? { user_id: userId } : {}), answers }),
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

  requestAuthCode: (code: string) =>
    apiFetch(`${API_BASE}/api/auth/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }),

  checkAuthStatus: (code: string) =>
    apiFetch(`${API_BASE}/api/auth/status/${code}`),

  requestLinkCode: (userId: number) =>
    apiFetch(`${API_BASE}/api/auth/link-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }),

  checkLinkStatus: (code: string) =>
    apiFetch(`${API_BASE}/api/auth/link-status/${code}`),

  saveFeedback: (consultationId: string, rating: 'good' | 'bad') =>
    apiFetch(`${API_BASE}/api/consultation/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultation_id: consultationId, rating }),
    }),
};
