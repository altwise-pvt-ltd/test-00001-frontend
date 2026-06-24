import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createPrincipal } from '../services/principals';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Create a principal (super-admin). The admin sets the password explicitly here
// (principals aren't DOB-derived like teachers/students). Calls
// onSaved(createdPrincipal) on success; assigning to a school happens separately
// on the Schools page.
export function PrincipalFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm({ name: '', email: '', password: '' });
      setError('');
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (name.length < 2) return setError('Enter a name (at least 2 characters).');
    if (!email) return setError('Enter an email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    setError('');
    try {
      const saved = await createPrincipal({ name, email, password: form.password });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the principal. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New principal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="p-name" className="mb-1 block text-sm font-medium text-text-h">
            Name
          </label>
          <input
            id="p-name"
            value={form.name}
            onChange={set('name')}
            autoFocus
            placeholder="e.g. New Principal"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="p-email" className="mb-1 block text-sm font-medium text-text-h">
            Email
          </label>
          <input
            id="p-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="e.g. principal@riverdale.test"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="p-password" className="mb-1 block text-sm font-medium text-text-h">
            Password
          </label>
          <input
            id="p-password"
            type="text"
            value={form.password}
            onChange={set('password')}
            placeholder="At least 8 characters"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-text/60">
            Share this with the principal — they can change it after first sign-in.
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
            {submitting ? 'Creating…' : 'Create principal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
