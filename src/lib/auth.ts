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

export const auth = {
  getUser: (): TelegramUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setUser: (user: TelegramUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  },

  isLoggedIn: (): boolean => {
    const user = auth.getUser();
    if (!user) return false;
    const age = Date.now() / 1000 - user.auth_date;
    return age < 86400;
  },

  /**
   * Verifies Telegram Login Widget data via server-side HMAC check,
   * then saves the user to localStorage. Throws on failure.
   */
  verifyAndSetUser: async (user: TelegramUser): Promise<void> => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? 'Verification failed');
    }

    auth.setUser(user);
  },
};
