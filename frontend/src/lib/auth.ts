// src/lib/auth.ts
const isBrowser = typeof window !== 'undefined';

export const auth = {
  setToken(token: string): void {
    if (isBrowser) localStorage.setItem('token', token);
  },
  
  getToken(): string | null {
    if (isBrowser) return localStorage.getItem('token');
    return null;
  },
  
  setUser(user: any): void {
    if (isBrowser) localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser(): any | null {
    if (isBrowser) {
      const user = localStorage.getItem('user');
      if (user) {
        try { return JSON.parse(user); } catch { return null; }
      }
    }
    return null;
  },
  
  isAuthenticated(): boolean {
    return isBrowser ? !!this.getToken() : false;
  },
  
  logout(): void {
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
  }
};