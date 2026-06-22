import { NavLink } from 'react-router-dom';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useRole } from '../../features/auth';
import { NAV_ITEMS } from './navItems';

// Presentational nav. Used both as the persistent desktop rail and inside the
// mobile drawer. `onNavigate` lets the drawer close itself after a selection.
// Items are filtered to the current role (items without `roles` show for all).
export function Sidebar({ onNavigate }) {
  const { role } = useRole();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
  return (
    <div className="flex h-full flex-col text-left">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-bg text-accent">
          <SchoolRoundedIcon fontSize="small" />
        </span>
        <span className="text-base font-semibold text-text-h">SchoolMS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-bg text-accent'
                  : 'text-text/70 hover:bg-social-bg hover:text-text-h',
              ].join(' ')
            }
          >
            <Icon fontSize="small" />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="border-t border-border px-5 py-4 text-xs text-text/40">School Management v0.1</p>
    </div>
  );
}
