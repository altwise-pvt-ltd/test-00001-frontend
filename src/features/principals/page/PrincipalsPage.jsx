import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { PrincipalFormModal } from '../components/PrincipalFormModal';
import { listPrincipals } from '../services/principals';

const idOf = (o) => o?._id ?? o?.id;

// Render a principal's school cell — populated object, plain label, or unassigned.
// The list endpoint returns the school under `assignedSchool`; fall back to the
// other shapes other endpoints have used.
function schoolLabel(p) {
  const s = p?.assignedSchool ?? p?.school ?? p?.schoolId;
  if (s && typeof s === 'object') return s.name || 'Assigned';
  return s ? 'Assigned' : 'Unassigned';
}

// Super-admin directory of principals: create them here, then assign to a school
// from the Schools page.
export function PrincipalsPage() {
  const [principals, setPrincipals] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setError('');
    try {
      const data = await listPrincipals();
      setPrincipals(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load principals.');
      setPrincipals([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const isLoading = principals === null;
  const isEmpty = Array.isArray(principals) && principals.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Principals</h1>
          <p className="mt-1 text-sm text-text/60">
            Create principals, then assign each to a school from the Schools page.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <AddRoundedIcon fontSize="small" />
          New principal
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading principals…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <BadgeRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No principals yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Create a principal so you can put them in charge of a school.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New principal
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">School</th>
              </tr>
            </thead>
            <tbody>
              {principals.map((p, i) => (
                <motion.tr
                  key={idOf(p) ?? i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                >
                  <td className="px-5 py-3 text-text/50">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-text-h">{p.name}</td>
                  <td className="px-5 py-3 text-text/70">{p.email}</td>
                  <td className="px-5 py-3 text-text/70">{schoolLabel(p)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PrincipalFormModal open={creating} onClose={() => setCreating(false)} onSaved={() => load()} />
    </div>
  );
}
