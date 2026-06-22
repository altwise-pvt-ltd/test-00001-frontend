// Public API of the `auth` feature.
export { LoginPage } from './page/LoginPage'
export { LoginForm } from './components/loginform'
export { useAuthStore } from './store/authStore'
export { useRole } from './hooks/useRole'
export { logout, fetchHome } from './services/auth'
// The token-aware axios instance (Bearer injection + 401→refresh retry).
// Other features import this as their authed transport rather than rolling
// their own — keeps the refresh logic in one place.
export { default as http } from './services/client'
