import { useNavigate } from 'react-router-dom';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { logout as logoutApi, useAuthStore } from '../../features/auth';

// Sits above the content area. Owns the global "sign out" action (moved here
// from the dashboard page) and the hamburger that opens the mobile sidebar.
export function TopBar({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      clear();
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-text transition-colors hover:bg-social-bg hover:text-text-h lg:hidden"
      >
        <MenuRoundedIcon />
      </button>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="flex items-center gap-2 text-right">
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight text-text-h">{user?.name ?? 'User'}</p>
            <p className="text-xs capitalize leading-tight text-text/60">{user?.role ?? 'member'}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-bg text-accent">
            <PersonRoundedIcon fontSize="small" />
          </span>
        </div>

        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
        >
          <LogoutRoundedIcon fontSize="small" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
