const USER_KEY = 'soul540_user';

export const Storage = {
  getUser: <T>(): T | null => {
    try {
      const d = localStorage.getItem(USER_KEY);
      return d ? JSON.parse(d) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser: <T>(u: T) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('soul540_token');
  },
};
