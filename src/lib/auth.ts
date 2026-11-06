import { supabase } from './supabase';

/**
 * Сессия Supabase (Google/Apple/email) нужна сайту только на мгновение — чтобы
 * обменять её на токен бэкенда. Сразу после этого завершаем её: отзываем на
 * сервере (scope 'local' — только эту сессию, другие устройства не трогаем)
 * и удаляем из браузера. Так в localStorage никогда не лежит действующая
 * сессия Supabase, которую можно было бы использовать после выхода.
 */
export async function discardSupabaseSession(): Promise<void> {
  try {
    if (supabase) {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }).catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
  } catch { /* сеть недоступна — всё равно удаляем локально */ }
  removeSupabaseKeys();
}

function removeSupabaseKeys(): void {
  if (typeof window === 'undefined') return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  }
}

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
const SESSION_IDLE_LIMIT = 86400 * 7; // 7 дней без активности — сессия истекает

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

  /**
   * Токен бэкенда. Если сессия истекла (7 дней без активности) — очищает всё и
   * возвращает null. Проверка здесь, а не на отдельных страницах, чтобы ни одна
   * страница не могла работать с просроченной сессией.
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    let token: string | null = null;
    try { token = localStorage.getItem(TOKEN_KEY); } catch { return null; }
    if (!token) return null;
    const user = auth.getUser();
    if (!user || Date.now() / 1000 - user.auth_date >= SESSION_IDLE_LIMIT) {
      auth.clear();
      return null;
    }
    return token;
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
    removeSupabaseKeys();
  },

  /** Выход: полностью очищает сессию в этом браузере. */
  logout: async () => {
    // Сессия Supabase завершается сразу после входа (discardSupabaseSession),
    // поэтому при выходе достаточно локальной очистки — без сетевых запросов,
    // которые могли бы обновить и записать сессию обратно.
    auth.clear();
    window.location.href = '/';
  },

  getUserId: (): number | null => {
    if (typeof window === 'undefined') return null;
    // Без действующей сессии номера пользователя нет (getToken проверяет срок)
    if (!auth.getToken()) return null;
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
    // getToken() сам очищает просроченную (7 дней без активности) сессию
    return Boolean(user && auth.getToken());
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
