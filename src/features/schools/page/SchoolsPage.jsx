import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { SchoolFormModal } from '../components/SchoolFormModal';
import { SchoolDetailModal } from '../components/SchoolDetailModal';
import { listSchools } from '../services/schools';

const idOf = (o) => o?._id ?? o?.id;

// Render a school's principal cell — the field may be a populated object or
// absent, depending on the list endpoint's shape.
function principalLabel(school) {
  const p = school?.principal;
  if (p && typeof p === 'object') return p.name || p.email || 'Assigned';
  return p ? 'Assigned' : '—';
}

// Super-admin landing for schools: create, then manage each (principal,
// active state, admin-targeted setup) from the detail panel.
export function SchoolsPage() {
  const [schools, setSchools] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState(null); // school open in the detail panel

  async function load() {
    setError('');
    try {
      const data = await listSchools();
      setSchools(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load schools.');
      setSchools([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const isLoading = schools === null;
  const isEmpty = Array.isArray(schools) && schools.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Schools</h1>
          <p className="mt-1 text-sm text-text/60">
            Every school on the platform — create one, then assign a principal.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <AddRoundedIcon fontSize="small" />
          New school
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading schools…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <ApartmentRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No schools yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Create the first school, then assign a principal to run it.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New school
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">School</th>
                <th className="px-5 py-3 font-medium">Principal</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s, i) => {
                const active = s.isActive !== false;
                return (
                  <motion.tr
                    key={idOf(s) ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                  >
                    <td className="px-5 py-3 text-text/50">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-text-h">{s.name}</div>
                      {s.address && <div className="text-xs text-text/50">{s.address}</div>}
                    </td>
                    <td className="px-5 py-3 text-text/70">{principalLabel(s)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          active ? 'bg-green-500/10 text-green-600' : 'bg-social-bg text-text/60'
                        }`}
                      >
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setManaging(s)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text transition hover:border-text-h hover:text-text-h"
                        >
                          <SettingsRoundedIcon fontSize="small" />
                          Manage
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create */}
      <SchoolFormModal open={creating} onClose={() => setCreating(false)} onSaved={() => load()} />

      {/* Manage: principal, status, setup */}
      <SchoolDetailModal
        open={Boolean(managing)}
        school={managing}
        onClose={() => setManaging(null)}
        onChanged={load}
      />
    </div>
  );
}
