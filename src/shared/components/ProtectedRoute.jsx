import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../features/auth'

// Route guard driven by the auth store's status:
//  - 'loading' : bootstrap hasn't resolved yet — render nothing so we don't
//    bounce an authenticated user mid-refresh.
//  - 'guest'   : redirect to /login, remembering where they were headed.
//  - 'authed'  : render the protected page.
//
// Optional `roles`: when provided, an authed user whose role isn't in the list
// is sent to '/' (they're logged in, just not permitted here) rather than to
// /login. This is UX gating only — the backend remains the real boundary.
export function ProtectedRoute({ children, roles }) {
  const status = useAuthStore((s) => s.status)
  const role = useAuthStore((s) => s.user?.role)
  const location = useLocation()

  if (status === 'loading') return null

  if (status !== 'authed') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
