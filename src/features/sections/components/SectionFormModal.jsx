import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { listClasses } from '../../classes';
import { createSection, updateSection } from '../services/sections';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Create/edit form for a section. `initial` is the section being edited, or null
// for a new one. On create the parent class is chosen (sections belong to a
// class); on edit only the name is editable. `defaultClassId` preselects the
// class when creating from a class-scoped list.
export function SectionFormModal({ open, onClose, onSaved, initial, defaultClassId }) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setClassId(initial?.classId ?? defaultClassId ?? '');
      setError('');
    }
  }, [open, initial, defaultClassId]);

  // The class list is only needed when creating (the parent can't change on edit).
  useEffect(() => {
    if (!open || isEdit) return undefined;
    let active = true;
    listClasses()
      .then((data) => active && setClasses(Array.isArray(data) ? data : []))
      .catch(() => active && setClasses([]));
    return () => {
      active = false;
    };
  }, [open, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a section name (e.g. A).');
      return;
    }
    if (!isEdit && !classId) {
      setError('Select the class this section belongs to.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateSection(initial._id, { name: trimmedName })
        : await createSection({ name: trimmedName, classId });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the section. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit section' : 'New section'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div>
            <label htmlFor="section-class" className="mb-1 block text-sm font-medium text-text-h">
              Class
            </label>
            <select
              id="section-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={Boolean(defaultClassId)}
              className={inputCls}
            >
              <option value="">Select…</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  Class {c.level}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="section-name" className="mb-1 block text-sm font-medium text-text-h">
            Section name
          </label>
          <input
            id="section-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. A"
            className={inputCls}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create section'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
