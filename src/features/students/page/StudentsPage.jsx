import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { Modal } from '../../../shared/components/Modal';
import { StudentDetailModal } from '../../users';
import { initials } from '../../../shared/format';
import { StudentFormModal } from '../components/StudentFormModal';
import { listStudents, deleteStudent, userId } from '../services/students';

export function StudentsPage() {
  const [students, setStudents] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [viewingId, setViewingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function load() {
    setError('');
    try {
      setStudents(await listStudents());
    } catch {
      setError('Could not load students.');
      setStudents([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(saved) {
    setStudents((prev) => {
      if (!prev) return prev;
      const exists = saved && prev.some((s) => userId(s) === userId(saved));
      return exists ? prev.map((s) => (userId(s) === userId(saved) ? saved : s)) : [...prev, saved];
    });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteStudent(userId(deleting));
      setStudents((prev) => prev.filter((s) => userId(s) !== userId(deleting)));
      setDeleting(null);
    } catch {
      setError('Could not delete the student.');
    } finally {
      setRemoving(false);
    }
  }

  const isLoading = students === null;
  const isEmpty = Array.isArray(students) && students.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Students</h1>
          <p className="mt-1 text-sm text-text/60">Manage the students enrolled at your school.</p>
        </div>
        <button
          onClick={() => setFormFor(null)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <AddRoundedIcon fontSize="small" />
          New student
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading students…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <GroupsRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No students yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Enroll your first student. You'll need a class with at least one section first.
          </p>
          <button
            onClick={() => setFormFor(null)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New student
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <motion.tr
                  key={userId(s)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setViewingId(userId(s))}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bg text-xs font-semibold text-accent">
                        {initials(s.name)}
                      </span>
                      <span className="font-medium text-text-h">{s.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text/80">{s.email || '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.isActive === false
                          ? 'bg-social-bg text-text/60'
                          : 'bg-green-500/10 text-green-600'
                      }`}
                    >
                      {s.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFor(s);
                        }}
                        aria-label={`Edit ${s.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(s);
                        }}
                        aria-label={`Delete ${s.name}`}
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

      <StudentDetailModal
        open={Boolean(viewingId)}
        studentId={viewingId}
        onClose={() => setViewingId(null)}
      />

      <StudentFormModal
        open={formFor !== undefined}
        initial={formFor || null}
        onClose={() => setFormFor(undefined)}
        onSaved={handleSaved}
      />

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete student">
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
