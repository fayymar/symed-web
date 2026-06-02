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
    fetch(`${API_BASE}/api/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  startConsultation: (userId: number | null, symptoms: string) =>
    fetch(`${API_BASE}/api/consultation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(userId ? { user_id: userId } : {}), symptoms }),
    }).then(r => r.json()),

  sendAnswers: (sessionId: string, userId: number | null, answers: string[]) =>
    fetch(`${API_BASE}/api/consultation/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, ...(userId ? { user_id: userId } : {}), answers }),
    }).then(r => r.json()),

  sendDuration: (sessionId: string, duration: string) =>
    fetch(`${API_BASE}/api/consultation/duration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, duration }),
    }).then(r => r.json()),

  getResult: (sessionId: string, anamnesisAnswers?: string[]) =>
    fetch(`${API_BASE}/api/consultation/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, anamnesis_answers: anamnesisAnswers ?? [] }),
    }).then(r => r.json()),

  getConsultations: (userId: number) =>
    apiFetch(`${API_BASE}/api/consultations/${userId}`),

  getMedications: (userId: number) =>
    apiFetch(`${API_BASE}/api/medications/${userId}`),

  addMedication: (userId: number, data: object) =>
    fetch(`${API_BASE}/api/medications/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getDiary: (userId: number) =>
    apiFetch(`${API_BASE}/api/diary/${userId}`),

  addDiaryEntry: (userId: number, data: object) =>
    fetch(`${API_BASE}/api/diary/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getHealthMetrics: (userId: number, type?: string) =>
    fetch(`${API_BASE}/api/health/metrics/${userId}${type ? `?type=${type}` : ''}`).then(r => r.json()),

  requestAuthCode: (code: string) =>
    fetch(`${API_BASE}/api/auth/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).then(r => r.json()),

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
};
