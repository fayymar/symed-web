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

/**
 * Derives a stable integer user_id from a UUID (e.g. Supabase auth user.id)
 * using the first 12 hex chars of its SHA-256 hash, mapped into the
 * 5,000,000,000–9,999,999,999 range to avoid clashing with Telegram IDs.
 * MUST stay in sync with the Python implementation on the backend
 * (hashlib.sha256(...).hexdigest()[:12]) — do not modify independently.
 */
export async function deriveUserId(uuid: string): Promise<number> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uuid));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return 5_000_000_000 + (parseInt(hex.slice(0, 12), 16) % 4_999_999_999);
}

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

  clear: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('symed_user_id');
    localStorage.removeItem(TOKEN_KEY);
  },

  logout: () => {
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
    // 7 days for OAuth users (auth_date is set at login and refreshed on activity)
    return age < 86400 * 7;
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
