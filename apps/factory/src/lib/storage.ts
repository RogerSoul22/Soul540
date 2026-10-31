const USER_KEY = 'soul540_user';

export const storage = {
  getUser<T>(): T | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser<T>(user: T) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('soul540_token');
  },
};
