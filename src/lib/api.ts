const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://telegram-doctor-bot.onrender.com';

export const api = {
  getProfile: (userId: number) =>
    fetch(`${API_BASE}/api/profile/${userId}`).then(r => r.json()),

  saveProfile: (userId: number, data: object) =>
    fetch(`${API_BASE}/api/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  startConsultation: (userId: number, symptoms: string) =>
    fetch(`${API_BASE}/api/consultation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, symptoms }),
    }).then(r => r.json()),

  sendAnswers: (sessionId: string, userId: number, answers: string[]) =>
    fetch(`${API_BASE}/api/consultation/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, user_id: userId, answers }),
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
    fetch(`${API_BASE}/api/consultations/${userId}`).then(r => r.json()),
};
