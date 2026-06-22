import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createSubject, updateSubject } from '../services/subjects';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Create/edit form for a subject. `initial` is the subject being edited, or null
// for a new one. On create both name and code are sent; on edit only the name is
// editable (the code is immutable), so the code field is shown disabled.
export function SubjectFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setCode(initial?.code ?? '');
      setError('');
    }
  }, [open, initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName) {
      setError('Enter a subject name.');
      return;
    }
    if (!isEdit && !trimmedCode) {
      setError('Enter a subject code (e.g. MATH).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateSubject(initial._id, { name: trimmedName })
        : await createSubject({ name: trimmedName, code: trimmedCode });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the subject. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit subject' : 'New subject'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject-name" className="mb-1 block text-sm font-medium text-text-h">
            Subject name
          </label>
          <input
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Mathematics"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="subject-code" className="mb-1 block text-sm font-medium text-text-h">
            Subject code
          </label>
          <input
            id="subject-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isEdit}
            placeholder="e.g. MATH"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-text/60">
            {isEdit ? 'The code is fixed once a subject is created.' : 'A short identifier for the subject.'}
          </p>
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
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
