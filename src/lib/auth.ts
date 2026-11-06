import { supabase } from './supabase';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const USER_KEY = 'symed_user';
const TOKEN_KEY = 'symed_token';

export const auth = {
  getUser: (): TelegramUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  /**
   * Сохраняет пользователя и токен сессии, выданный бэкендом после входа.
   * Без токена бэкенд не отдаёт данные пользователя (401).
   */
  setUser: (user: TelegramUser, token: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('symed_user_id', String(user.id));
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },

  /**
   * Полностью завершает сессию в этом браузере: токен бэкенда, данные
   * пользователя и сохранённую сессию Supabase (sb-*). Удаление локальное и
   * безусловное — не зависит от сети. Вызывается при выходе, ответе 401 и
   * истечении сессии, чтобы на общем компьютере следующий человек не мог
   * получить доступ к чужим медицинским данным.
   */
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('symed_user_id');
    localStorage.removeItem(TOKEN_KEY);
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    }
  },

  /**
   * Выход: удаляем токен бэкенда и завершаем сессию Supabase (Google/Apple/email).
   * Иначе сессия Supabase осталась бы в браузере, и через /auth/callback можно
   * было бы снова получить токен без ввода пароля.
   */
  logout: async () => {
    // Сначала пробуем отозвать refresh-токен на сервере Supabase, потом в любом
    // случае удаляем всё локально (auth.clear не зависит от результата запроса).
    try { await supabase?.auth.signOut(); } catch { /* сеть недоступна */ }
    auth.clear();
    window.location.href = '/';
  },

  getUserId: (): number | null => {
    if (typeof window === 'undefined') return null;
    // Try numeric key first (set by 6-digit code auth)
    const numKey = localStorage.getItem('symed_user_id');
    if (numKey) return parseInt(numKey);
    // Fall back to full user object
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id) return user.id;
      }
    } catch {}
    return null;
  },

  isLoggedIn: (): boolean => {
    const user = auth.getUser();
    // Старые сессии без токена считаем разлогиненными — нужен повторный вход
    if (!user || !auth.getToken()) return false;
    const age = Date.now() / 1000 - user.auth_date;
    // 7 дней без активности (auth_date обновляется при активности) — сессия
    // истекла: очищаем всё, включая токен бэкенда и сессию Supabase.
    if (age >= 86400 * 7) { auth.clear(); return false; }
    return true;
  },

  // Call on user activity to extend session
  refreshSession: (): void => {
    const user = auth.getUser();
    if (user) {
      user.auth_date = Math.floor(Date.now() / 1000);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
};
