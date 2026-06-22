import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import { Modal } from '../../../shared/components/Modal';
import { ClassFormModal } from '../components/ClassFormModal';
import { ClassDetailModal } from '../components/ClassDetailModal';
import { listClasses, deleteClass } from '../services/classes';

export function ClassesPage() {
  const [classes, setClasses] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [viewingId, setViewingId] = useState(null); // class id whose detail is open
  const [deleting, setDeleting] = useState(null); // the class pending delete confirmation
  const [removing, setRemoving] = useState(false);

  async function load() {
    setError('');
    try {
      const data = await listClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load classes.');
      setClasses([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(saved) {
    // Optimistically merge the saved class, then reload to stay in sync.
    setClasses((prev) => {
      if (!prev) return prev;
      const exists = prev.some((c) => c._id === saved?._id);
      return exists ? prev.map((c) => (c._id === saved._id ? saved : c)) : [...prev, saved];
    });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteClass(deleting._id);
      setClasses((prev) => prev.filter((c) => c._id !== deleting._id));
      setDeleting(null);
    } catch {
      setError('Could not delete the class.');
    } finally {
      setRemoving(false);
    }
  }

  const isLoading = classes === null;
  const isEmpty = Array.isArray(classes) && classes.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Page header */}
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Classes</h1>
          <p className="mt-1 text-sm text-text/60">Manage the grade levels in your school.</p>
        </div>
        <button
          onClick={() => setFormFor(null)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <AddRoundedIcon fontSize="small" />
          New class
        </button>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading classes…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <ClassRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No classes yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Create your first class to start building out sections and enrolling students.
          </p>
          <button
            onClick={() => setFormFor(null)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New class
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Class level</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <motion.tr
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setViewingId(c._id)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                >
                  <td className="px-5 py-3 text-text/50">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-text-h">Class {c.level}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFor(c);
                        }}
                        aria-label={`Edit class ${c.level}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(c);
                        }}
                        aria-label={`Delete class ${c.level}`}
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

      {/* Detail */}
      <ClassDetailModal
        open={Boolean(viewingId)}
        classId={viewingId}
        onClose={() => setViewingId(null)}
      />

      {/* Create / edit */}
      <ClassFormModal
        open={formFor !== undefined}
        initial={formFor || null}
        onClose={() => setFormFor(undefined)}
        onSaved={handleSaved}
      />

      {/* Delete confirmation */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete class">
        <p className="text-sm text-text">
          Delete <span className="font-medium text-text-h">Class {deleting?.level}</span>? This
          can't be undone.
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
