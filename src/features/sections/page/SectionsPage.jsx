import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import { Modal } from '../../../shared/components/Modal';
import { listClasses } from '../../classes';
import { SectionFormModal } from '../components/SectionFormModal';
import { listSections, deleteSection } from '../services/sections';

const selectCls =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border';

// Sections are scoped to a class, so the page asks the user to pick a class
// first, then lists and manages that class's sections.
export function SectionsPage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [sections, setSections] = useState(null); // null = not loaded yet
  const [error, setError] = useState('');
  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  // Load the class list once for the selector.
  useEffect(() => {
    let active = true;
    listClasses()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setClasses(list);
        if (list.length && !classId) setClassId(list[0]._id);
      })
      .catch(() => active && setError('Could not load classes.'));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    if (!classId) return;
    setError('');
    try {
      const data = await listSections(classId);
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load sections.');
      setSections([]);
    }
  }

  // Reload sections whenever the chosen class changes.
  useEffect(() => {
    setSections(null);
    if (classId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function handleSaved(saved) {
    // A section's class can't change, so only merge ones in the current class.
    setSections((prev) => {
      if (!prev) return prev;
      const exists = prev.some((s) => s._id === saved?._id);
      return exists ? prev.map((s) => (s._id === saved._id ? saved : s)) : [...prev, saved];
    });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteSection(deleting._id);
      setSections((prev) => prev.filter((s) => s._id !== deleting._id));
      setDeleting(null);
    } catch {
      setError('Could not delete the section.');
    } finally {
      setRemoving(false);
    }
  }

  const noClasses = classes.length === 0;
  const isLoading = Boolean(classId) && sections === null;
  const isEmpty = Array.isArray(sections) && sections.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Sections</h1>
          <p className="mt-1 text-sm text-text/60">Organise each class into sections.</p>
        </div>
        <button
          onClick={() => setFormFor(null)}
          disabled={!classId}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <AddRoundedIcon fontSize="small" />
          New section
        </button>
      </header>

      {/* Class selector */}
      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="sections-class" className="text-sm font-medium text-text-h">
          Class
        </label>
        <select
          id="sections-class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          disabled={noClasses}
          className={selectCls}
        >
          {noClasses && <option value="">No classes yet</option>}
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              Class {c.level}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {noClasses && (
        <p className="text-sm text-text/70">Create a class first before adding sections.</p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading sections…
        </p>
      )}

      {!noClasses && isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <ViewModuleRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No sections in this class</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            Add a section so students can be enrolled and teachers assigned.
          </p>
          <button
            onClick={() => setFormFor(null)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            <AddRoundedIcon fontSize="small" />
            New section
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && Array.isArray(sections) && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-social-bg/50 text-xs uppercase tracking-wide text-text/60">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Section</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border transition-colors last:border-0 hover:bg-social-bg/40"
                >
                  <td className="px-5 py-3 text-text/50">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-text-h">Section {s.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setFormFor(s)}
                        aria-label={`Edit section ${s.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => setDeleting(s)}
                        aria-label={`Delete section ${s.name}`}
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

      {/* Create / edit — new sections default to the selected class */}
      <SectionFormModal
        open={formFor !== undefined}
        initial={formFor || null}
        defaultClassId={formFor === null ? classId : undefined}
        onClose={() => setFormFor(undefined)}
        onSaved={handleSaved}
      />

      {/* Delete confirmation */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete section">
        <p className="text-sm text-text">
          Delete <span className="font-medium text-text-h">Section {deleting?.name}</span>? This
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
