import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { DetailSection } from '../../../shared/components/DetailSection';
import { Tag } from '../../../shared/components/Badge';
import { getTeacherDetail } from '../../users';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createTeacher, updateTeacher, userId } from '../services/teachers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', dateOfBirth: '' };

// Create/edit form for a teacher. `initial` = teacher being edited, or null for
// new. DOB is only collected on create (it seeds the initial login password and
// isn't editable afterwards). Calls onSaved(savedTeacher) on success.
export function TeacherFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(EMPTY);
  const [detail, setDetail] = useState(null); // full GET /users/teachers/:id payload
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setError('');
    setDetail(null);

    if (!isEdit) {
      setForm(EMPTY);
      return undefined;
    }

    // Edit: fetch fresh detail from the same endpoint the detail view uses
    // (GET /users/teachers/:id) so the form reflects the latest server state,
    // not the trimmed list row. Seed from the row first to avoid a flash.
    setForm({ name: initial.name ?? '', email: initial.email ?? '', dateOfBirth: '' });
    let active = true;
    setLoading(true);
    getTeacherDetail(userId(initial))
      .then((d) => {
        if (!active) return;
        setForm({ name: d.name ?? '', email: d.email ?? '', dateOfBirth: '' });
        setDetail(d);
      })
      .catch(() => active && setError('Could not load the latest teacher details.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, isEdit, initial]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError('Name is required.');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    if (!isEdit && !form.dateOfBirth) return setError('Date of birth is required (it sets the initial password).');

    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateTeacher(userId(initial), { name, email })
        : await createTeacher({ name, email, dateOfBirth: form.dateOfBirth });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the teacher. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit teacher' : 'New teacher'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="t-name" className="mb-1 block text-sm font-medium text-text-h">
            Full name
          </label>
          <input id="t-name" value={form.name} onChange={set('name')} disabled={loading} autoFocus placeholder="e.g. Alan Turing" className={inputCls} />
        </div>

        <div>
          <label htmlFor="t-email" className="mb-1 block text-sm font-medium text-text-h">
            Email
          </label>
          <input id="t-email" type="email" value={form.email} onChange={set('email')} disabled={loading} placeholder="alan@greenwood.test" className={inputCls} />
        </div>

        {!isEdit && (
          <div>
            <label htmlFor="t-dob" className="mb-1 block text-sm font-medium text-text-h">
              Date of birth
            </label>
            <input id="t-dob" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputCls} />
            <p className="mt-1 text-xs text-text/60">Doubles as the teacher's initial login password.</p>
          </div>
        )}

        {/* Same two columns shown on row-click (GET /users/teachers/:id):
            the teacher's subjects and the sections they teach. Read-only. */}
        {isEdit && detail && (
          <div className="grid gap-x-6 gap-y-5 border-t border-border pt-4 sm:grid-cols-2">
            <DetailSection title="Subjects" count={detail.subjects?.length} empty="No subjects assigned">
              <div className="flex flex-wrap gap-2">
                {detail.subjects?.map((s) => (
                  <Tag key={s.id}>
                    {s.name} · {s.code}
                  </Tag>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Sections taught" count={detail.sections?.length} empty="No sections">
              <div className="flex flex-wrap gap-2">
                {detail.sections?.map((s) => (
                  <Tag key={s.id}>
                    Class {s.classLevel} · {s.name}
                  </Tag>
                ))}
              </div>
            </DetailSection>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h">
            Cancel
          </button>
          <button type="submit" disabled={submitting || loading} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Saving…' : loading ? 'Loading…' : isEdit ? 'Save changes' : 'Create teacher'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
