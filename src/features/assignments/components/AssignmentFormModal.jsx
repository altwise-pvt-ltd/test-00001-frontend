import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { useAuthStore } from '../../auth';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createAssignment, updateAssignment } from '../services/assignments';
import { listSubjectAllocations } from '../services/subjectAllocations';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Assignment types mirror the backend enum (constant.js ASSIGNMENT_TYPES).
const TYPES = [
  { value: 'homework', label: 'Homework' },
  { value: 'reading', label: 'Reading' },
  { value: 'book', label: 'Book' },
];

const EMPTY = { subjectAllocationId: '', title: '', type: 'homework', description: '', dueDate: '', attachments: '' };

// ISO date → yyyy-mm-dd for a <input type="date">.
function toDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// One attachment per line; trim + drop blanks.
const parseAttachments = (text) =>
  text
    .split('\n')
    .map((a) => a.trim())
    .filter(Boolean);

const allocLabel = (alloc) => {
  const subject = alloc.subjectId?.name ?? 'Subject';
  const code = alloc.subjectId?.code ? ` (${alloc.subjectId.code})` : '';
  const section = alloc.sectionId?.name ?? '—';
  return `${subject}${code} · Section ${section}`;
};

// Create/edit form for an assignment (teacher). On create the teacher picks one
// of their subject allocations (subject + section); the backend derives the
// section from it. On edit the subject allocation is fixed — only the content
// fields change. `scopeLabel` is the already-resolved "Subject · Section" shown
// read-only when editing. Calls onSaved(savedAssignment) on success.
export function AssignmentFormModal({ open, onClose, onSaved, initial, scopeLabel }) {
  const isEdit = Boolean(initial);
  const myId = useAuthStore((s) => s.user?.id ?? s.user?._id);
  const [form, setForm] = useState(EMPTY);
  const [allocations, setAllocations] = useState([]);
  const [loadingAllocs, setLoadingAllocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Reset on open and prefill when editing.
  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      initial
        ? {
            subjectAllocationId: initial.subjectAllocationId?._id ?? initial.subjectAllocationId ?? '',
            title: initial.title ?? '',
            type: initial.type ?? 'homework',
            description: initial.description ?? '',
            dueDate: toDateInput(initial.dueDate),
            attachments: (initial.attachments ?? []).join('\n'),
          }
        : EMPTY
    );
  }, [open, initial]);

  // Load the teacher's subject allocations for the picker (create only).
  useEffect(() => {
    if (!open || isEdit || !myId) return undefined;
    let active = true;
    setLoadingAllocs(true);
    listSubjectAllocations({ teacherId: myId })
      .then((data) => active && setAllocations(Array.isArray(data) ? data : []))
      .catch(() => active && setAllocations([]))
      .finally(() => active && setLoadingAllocs(false));
    return () => {
      active = false;
    };
  }, [open, isEdit, myId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (title.length < 2) return setError('Enter a title (at least 2 characters).');
    if (!isEdit && !form.subjectAllocationId) {
      return setError('Choose which subject and section this assignment is for.');
    }

    const base = {
      title,
      type: form.type,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      attachments: parseAttachments(form.attachments),
    };

    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateAssignment(initial._id, base)
        : await createAssignment({ ...base, subjectAllocationId: form.subjectAllocationId });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the assignment. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit assignment' : 'New assignment'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="a-ta" className="mb-1 block text-sm font-medium text-text-h">
            Subject &amp; section
          </label>
          {isEdit ? (
            <div className={`${inputCls} flex items-center`}>{scopeLabel || 'This assignment'}</div>
          ) : (
            <select
              id="a-ta"
              value={form.subjectAllocationId}
              onChange={set('subjectAllocationId')}
              disabled={loadingAllocs}
              className={inputCls}
            >
              <option value="">{loadingAllocs ? 'Loading…' : 'Select…'}</option>
              {allocations.map((alloc) => (
                <option key={alloc._id} value={alloc._id}>
                  {allocLabel(alloc)}
                </option>
              ))}
            </select>
          )}
          {!isEdit && !loadingAllocs && allocations.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              You aren't assigned to teach any subject yet. Ask your principal to set up a subject
              allocation first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="a-title" className="mb-1 block text-sm font-medium text-text-h">
              Title
            </label>
            <input
              id="a-title"
              value={form.title}
              onChange={set('title')}
              autoFocus
              placeholder="e.g. Read chapter 4"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="a-type" className="mb-1 block text-sm font-medium text-text-h">
              Type
            </label>
            <select id="a-type" value={form.type} onChange={set('type')} className={inputCls}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="a-due" className="mb-1 block text-sm font-medium text-text-h">
              Due date
            </label>
            <input id="a-due" type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="a-desc" className="mb-1 block text-sm font-medium text-text-h">
            Description
          </label>
          <textarea
            id="a-desc"
            value={form.description}
            onChange={set('description')}
            rows={3}
            placeholder="What should students do?"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="a-attach" className="mb-1 block text-sm font-medium text-text-h">
            Attachments
          </label>
          <textarea
            id="a-attach"
            value={form.attachments}
            onChange={set('attachments')}
            rows={2}
            placeholder="One per line — a book name or a link"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-text/60">Optional. One reference per line (book name or URL).</p>
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
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
