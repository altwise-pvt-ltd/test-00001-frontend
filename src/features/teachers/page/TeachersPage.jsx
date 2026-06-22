import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { Modal } from '../../../shared/components/Modal';
import { Tag } from '../../../shared/components/Badge';
import { TeacherDetailModal } from '../../users';
import { TeacherFormModal } from '../components/TeacherFormModal';
import { listTeachers, deleteTeacher, userId } from '../services/teachers';

const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

export function TeachersPage() {
  const [teachers, setTeachers] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [viewingId, setViewingId] = useState(null); // user id whose details are open
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function load() {
    setError('');
    try {
      setTeachers(await listTeachers());
    } catch {
      setError('Could not load teachers.');
      setTeachers([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(saved) {
    setTeachers((prev) => {
      if (!prev) return prev;
      const exists = saved && prev.some((t) => userId(t) === userId(saved));
      return exists ? prev.map((t) => (userId(t) === userId(saved) ? saved : t)) : [...prev, saved];
    });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteTeacher(userId(deleting));
      setTeachers((prev) => prev.filter((t) => userId(t) !== userId(deleting)));
      setDeleting(null);
    } catch {
      setError('Could not delete the teacher.');
    } finally {
      setRemoving(false);
    }
  }

  const isLoading = teachers === null;
  const isEmpty = Array.isArray(teachers) && teachers.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Teachers</h1>
          <p className="mt-1 text-sm text-text/60">Manage the teaching staff at your school.</p>
        </div>
        <button
          onClick={() => setFormFor(null)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <AddRoundedIcon fontSize="small" />
          New teacher
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading teachers…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <SchoolRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No teachers yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Add your first teacher to start assigning them to classes and subjects.
          </p>
          <button
            onClick={() => setFormFor(null)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New teacher
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">Teacher</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Classes</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <motion.tr
                  key={userId(t)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setViewingId(userId(t))}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bg text-xs font-semibold text-accent">
                        {initials(t.name)}
                      </span>
                      <span className="font-medium text-text-h">{t.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text/80">{t.email || '—'}</td>
                  <td className="px-5 py-3">
                    {t.classes?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {t.classes.map((c) => (
                          <Tag key={c.classId}>
                            Class {c.classLevel}
                            {c.sections?.length ? ` · ${c.sections.map((s) => s.sectionName).join(', ')}` : ''}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <span className="text-text/40">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.isActive === false
                          ? 'bg-social-bg text-text/60'
                          : 'bg-green-500/10 text-green-600'
                      }`}
                    >
                      {t.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFor(t);  
                        }}
                        aria-label={`Edit ${t.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(t);
                        }}
                        aria-label={`Delete ${t.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeacherDetailModal
        open={Boolean(viewingId)}
        teacherId={viewingId}
        onClose={() => setViewingId(null)}
      />

      <TeacherFormModal
        open={formFor !== undefined}
        initial={formFor || null}
        onClose={() => setFormFor(undefined)}
        onSaved={handleSaved}
      />

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete teacher">
        <p className="text-sm text-text">
          Delete <span className="font-medium text-text-h">{deleting?.name}</span>? This can't be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setDeleting(null)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={removing}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {removing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
