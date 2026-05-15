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
    // Check auth is not older than 24 hours
    const age = Date.now() / 1000 - user.auth_date;
    return age < 86400;
  },
};
