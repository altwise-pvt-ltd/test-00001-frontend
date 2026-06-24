import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { fmtDate } from '../../../shared/format';
import {
  ActivityPanel,
  ListRow,
  StatCard,
  UNCAPPED_LIMIT,
  gridVariants,
} from '../../home/components/dashboardKit';
import { getOverview } from '../services/admin';
import { listSchools } from '../../schools';

const idOf = (o) => o?._id ?? o?.id;

function principalLabel(school) {
  const p = school?.principal;
  if (p && typeof p === 'object') return p.name || p.email || 'Assigned';
  return p ? 'Assigned' : 'No principal';
}

// One-line summary of a school's per-school counts, e.g. "2 teachers · 3 students".
function countsSummary(counts) {
  if (!counts) return null;
  const parts = [];
  if (counts.teachers != null) parts.push(`${counts.teachers} teachers`);
  if (counts.students != null) parts.push(`${counts.students} students`);
  if (counts.classes != null) parts.push(`${counts.classes} classes`);
  if (counts.subjects != null) parts.push(`${counts.subjects} subjects`);
  return parts.join(' · ') || null;
}

// Platform-wide dashboard for the super-admin. The /admin/overview payload is
// `{ role, schools: [...] }` where each school carries its own `counts`,
// `principal`, and `recentActivity` — there are no top-level totals, so we sum
// the per-school counts ourselves. listSchools() is a fallback only if the
// overview omits its schools array.
export function AdminHome() {
  const [schools, setSchools] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getOverview()
      .then((overview) => {
        if (!active) return null;
        const list = Array.isArray(overview?.schools) ? overview.schools : null;
        if (list) {
          setSchools(list);
          return null;
        }
        // Overview had no schools array — fall back to the authoritative list.
        return listSchools();
      })
      .then((fallback) => {
        if (active && Array.isArray(fallback)) setSchools(fallback);
      })
      .catch(() => active && setError('Could not load the admin overview.'))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  // Sum per-school counts into platform totals; principals = schools that have one.
  const stats = useMemo(() => {
    const total = (key) => schools.reduce((sum, s) => sum + (s.counts?.[key] ?? 0), 0);
    const principals = schools.filter((s) => s.principal).length;
    return [
      { key: 'schools', label: 'Schools', Icon: ApartmentRoundedIcon, value: schools.length },
      { key: 'principals', label: 'Principals', Icon: BadgeRoundedIcon, value: principals },
      { key: 'teachers', label: 'Teachers', Icon: SchoolRoundedIcon, value: total('teachers') },
      { key: 'students', label: 'Students', Icon: GroupsRoundedIcon, value: total('students') },
    ];
  }, [schools]);

  // Flatten every school's recentActivity into one feed, newest first, with the
  // originating school name attached for context.
  const activity = useMemo(() => {
    const nameById = new Map(schools.map((s) => [idOf(s), s.name]));
    return schools
      .flatMap((s) =>
        (s.recentActivity ?? []).map((a) => ({
          ...a,
          schoolName: nameById.get(a.schoolId) ?? s.name,
        })),
      )
      .sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [schools]);

  if (!loaded) {
    return (
      <p className="text-sm text-text/70" role="status">
        Loading overview…
      </p>
    );
  }

  const cappedActivity = activity.slice(0, UNCAPPED_LIMIT);
  const moreActivity = activity.length - cappedActivity.length;

  return (
    <>
      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <motion.section
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map(({ key, label, Icon, value }) => (
          <StatCard key={key} label={label} value={value} Icon={Icon} />
        ))}
      </motion.section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ActivityPanel
          title="Schools"
          icon={ApartmentRoundedIcon}
          emptyTitle="No schools yet"
          emptyHint="Create schools from the Schools page to see them here."
          items={schools}
          renderItem={(s, i) => (
            <ListRow
              key={idOf(s) ?? i}
              primary={s.name}
              meta={[principalLabel(s), countsSummary(s.counts)].filter(Boolean).join(' — ')}
              trailing={
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.isActive !== false ? 'bg-green-500/10 text-green-600' : 'bg-social-bg text-text/60'
                  }`}
                >
                  {s.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              }
            />
          )}
        />

        <ActivityPanel
          title="Recent Activity"
          icon={HistoryRoundedIcon}
          emptyTitle="No recent activity"
          emptyHint="Submissions, assignments, and new users across all schools appear here."
          items={cappedActivity}
          footer={moreActivity > 0 ? `+${moreActivity} more` : undefined}
          renderItem={(a, i) => (
            <ListRow
              key={`${a.schoolId}-${a.at}-${i}`}
              primary={a.message}
              meta={a.schoolName}
              trailing={fmtDate(a.at)}
            />
          )}
        />
      </div>
    </>
  );
}
