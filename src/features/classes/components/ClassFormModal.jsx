import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createClass, updateClass } from '../services/classes';

// Create/edit form for a class. `initial` is the class being edited, or null
// for a new one. Calls onSaved(savedClass) on success so the parent can refresh.
export function ClassFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial);
  const [level, setLevel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset the field whenever the modal opens (prefilled when editing).
  useEffect(() => {
    if (open) {
      setLevel(initial?.level != null ? String(initial.level) : '');
      setError('');
    }
  }, [open, initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = Number(level);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('Enter a valid class level (a positive whole number).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = { level: parsed };
      const saved = isEdit ? await updateClass(initial._id, payload) : await createClass(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the class. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit class' : 'New class'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="class-level" className="mb-1 block text-sm font-medium text-text-h">
            Class level
          </label>
          <input
            id="class-level"
            type="number"
            min="1"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            autoFocus
            placeholder="e.g. 5"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border"
          />
          <p className="mt-1 text-xs text-text/60">The grade/standard number for this class.</p>
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
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create class'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
