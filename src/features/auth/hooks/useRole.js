import { useAuthStore } from '../store/authStore';

// Convenience accessor for the current user's role and the common role checks.
// Backed by the auth store so it re-renders when the user changes. The backend
// is the real authorization boundary — these are for UX gating only.
export function useRole() {
  const role = useAuthStore((s) => s.user?.role) ?? null;
  return {
    role,
    isPrincipal: role === 'principal',
    isTeacher: role === 'teacher',
    isStudent: role === 'student',
  };
}
