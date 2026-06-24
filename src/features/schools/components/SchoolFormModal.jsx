import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createSchool } from '../services/schools';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Create a new school (super-admin). Schools have no edit/delete endpoints — the
// admin manages them afterwards via activate/deactivate and principal
// assignment in the detail panel. Calls onSaved(createdSchool) on success.
export function SchoolFormModal({ open, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setAddress('');
      setError('');
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a school name.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const saved = await createSchool({ name: trimmedName, address: address.trim() });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the school. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New school">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="school-name" className="mb-1 block text-sm font-medium text-text-h">
            School name
          </label>
          <input
            id="school-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Riverdale High"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="school-address" className="mb-1 block text-sm font-medium text-text-h">
            Address
          </label>
          <input
            id="school-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 42 River Road"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-text/60">Optional.</p>
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
            {submitting ? 'Creating…' : 'Create school'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
