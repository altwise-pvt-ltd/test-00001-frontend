import { useEffect, useState } from 'react';
// Auth store + authed data calls come from the auth feature's public barrel
// (features don't reach into each other's internals). Sign-out now lives in
// the app shell's top bar, so this page only reads data.
import { fetchHome, useAuthStore } from '../../auth';
import { AdminHome } from '../../admin';
import { PrincipalHome } from '../views/PrincipalHome';
import { TeacherHome } from '../views/TeacherHome';
import { StudentHome } from '../views/StudentHome';

// Per-role header copy. The title slot is filled separately (school name for a
// principal, a plain "Dashboard" otherwise); this is the subtitle line.
const SUBTITLE = {
  admin: "Welcome back — here's the platform at a glance.",
  principal: "Welcome back — here's your school at a glance.",
  teacher: "Welcome back — here's your teaching at a glance.",
  student: "Welcome back — here's your work at a glance.",
};

// /home returns a DIFFERENT shape per role, so each role gets its own view.
function RoleView({ home }) {
  switch (home.role) {
    case 'principal':
      return <PrincipalHome home={home} />;
    case 'teacher':
      return <TeacherHome home={home} />;
    case 'student':
      return <StudentHome home={home} />;
    default:
      return (
        <p className="text-sm text-text/70" role="status">
          Nothing to show for this role.
        </p>
      );
  }
}

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  // The super-admin has no /home payload — it renders its own platform view
  // (self-fetching), so we skip the /home call entirely for that role.
  const isAdmin = user?.role === 'admin';

  const [home, setHome] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) return undefined;
    let active = true;
    fetchHome()
      .then((data) => active && setHome(data))
      .catch(() => active && setError('Could not load your dashboard.'));
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // Branch on the payload's role; fall back to the auth store only before the
  // payload has loaded (so the header badge shows something sensible meanwhile).
  const role = home?.role ?? user?.role ?? 'principal';

  // Header title: a principal sees their school name; teachers/students get a
  // generic title (their context lives in the placement line / sub-views).
  const title = home?.school?.name || 'Dashboard';

  // Student placement line (className · sectionName), rendered in the header.
  const placement = home?.role === 'student' ? home.placement : null;
  const placementLine = placement
    ? `${placement.className || 'No class'} · ${placement.sectionName || 'No section'}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Shared header: role badge + school/placement title */}
      <header className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full bg-accent-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {role}
          </span>
          <h1 className="mt-3 text-3xl font-medium text-text-h sm:text-4xl">{title}</h1>
          {placementLine ? (
            <p className="mt-1 text-sm text-text/70">{placementLine}</p>
          ) : (
            <p className="mt-1 text-sm text-text/60">{SUBTITLE[role] ?? SUBTITLE.principal}</p>
          )}
        </div>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isAdmin ? (
        <AdminHome />
      ) : (
        <>
          {!home && !error && (
            <p className="text-sm text-text/70" role="status">
              Loading dashboard…
            </p>
          )}

          {home && <RoleView home={home} />}
        </>
      )}
    </div>
  );
}
