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
    localStorage.setItem('symed_user_id', String(user.id));
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('symed_user_id');
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
    if (!user) return false;
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
