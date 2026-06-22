import { create } from 'zustand';
import { bootstrapSession, fetchMe } from '../services/auth';

// Auth state. The access token lives ONLY in memory (never localStorage), so a
// page refresh clears it — bootstrap() then tries the refresh cookie to restore
// the session silently.
export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  // 'loading' until the initial bootstrap finishes, then 'authed' | 'guest'
  status: 'loading',

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),

  clear: () => set({ accessToken: null, user: null, status: 'guest' }),

  // Called once on app load. Tries /auth/refresh; if it works, fetches the
  // current user and marks the session authed.
  bootstrap: async () => {
    try {
      const { accessToken } = await bootstrapSession();
      set({ accessToken });
      const user = await fetchMe();
      set({ user, status: 'authed' });
    } catch {
      set({ accessToken: null, user: null, status: 'guest' });
    }
  },

  // Called after a successful login (token already obtained).
  onLogin: async (accessToken) => {
    set({ accessToken });
    try {
      const user = await fetchMe();
      set({ user, status: 'authed' });
    } catch {
      set({ user: null, status: 'authed' });
    }
  },
}));