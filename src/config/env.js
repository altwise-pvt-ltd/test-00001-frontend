// Centralized access to environment configuration.
// Read Vite env vars here once so the rest of the app never touches
// `import.meta.env` directly — makes config easy to find and mock.
export const env = {
  // Base URL for the backend API. Defaults to the dev proxy path `/api`.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  // Current build mode: 'development' | 'production' | etc.
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
