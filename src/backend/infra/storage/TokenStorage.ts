const USER_KEY = 'soul540_user';

export const TokenStorage = {
  getUser<T>(): T | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },
  clear(): void {
    this.removeUser();
    localStorage.removeItem('soul540_token'); // clean up old token key
  },
};
