import axios from 'axios';
import { env } from '../../../config/env';
import { useAuthStore } from '../store/authStore';

// Axios instance for auth-aware requests. `withCredentials` lets the browser
// send/receive the httpOnly refresh cookie; the access token is attached
// per-request from the in-memory store.
const client = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

// Attach the current access token (read lazily so we always get the latest).
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try the refresh cookie once, then replay the original request.
// Guard with `_retry` so a failed refresh doesn't loop.
let refreshing = null;
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        // Coalesce concurrent 401s into a single refresh.
        refreshing ??= client.post('/auth/refresh').finally(() => {
          refreshing = null;
        });
        const { data } = await refreshing;
        const accessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return client(original);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
