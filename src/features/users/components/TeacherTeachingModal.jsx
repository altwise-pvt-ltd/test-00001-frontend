import { useEffect, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Modal } from '../../../shared/components/Modal';
import { getApiErrorMessage } from '../../../shared/apiError';
import { listSubjects } from '../../subjects';
import { listClasses } from '../../classes';
import { listSections } from '../../sections';
import { setTeacherTeaching, userId } from '../services/users';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

const pairKey = (p) => `${p.subjectId}-${p.sectionId}`;

// Map the teacher's existing teachingAssignments into our richer working set
// (carries display labels so we don't have to resolve ids back to names).
function fromTeacher(teacher) {
  return (teacher?.teachingAssignments ?? [])
    .filter((ta) => ta.subject?.id && ta.section?.id)
    .map((ta) => ({
      subjectId: ta.subject.id,
      sectionId: ta.section.id,
      subjectName: ta.subject.name,
      subjectCode: ta.subject.code,
      sectionName: ta.section.name,
      classLevel: ta.classLevel,
    }));
}

// Principal-only editor for a teacher's subject×section assignments. Sends the
// complete desired set on save (replace, not delta). `teacher` is the loaded
// teacher detail; onSaved receives the refreshed detail returned by the PUT.
export function TeacherTeachingModal({ open, teacher, onClose, onSaved }) {
  const [pairs, setPairs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sel, setSel] = useState({ subjectId: '', classId: '', sectionId: '' });
  const [loadingSections, setLoadingSections] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Init working set + load option lists when opened.
  useEffect(() => {
    if (!open) return undefined;
    setPairs(fromTeacher(teacher));
    setSel({ subjectId: '', classId: '', sectionId: '' });
    setSections([]);
    setError('');
    let active = true;
    listSubjects()
      .then((d) => active && setSubjects(Array.isArray(d) ? d : []))
      .catch(() => active && setSubjects([]));
    listClasses()
      .then((d) => active && setClasses(Array.isArray(d) ? d : []))
      .catch(() => active && setClasses([]));
    return () => {
      active = false;
    };
  }, [open, teacher]);

  // Load sections when the picker's class changes.
  useEffect(() => {
    if (!open || !sel.classId) {
      setSections([]);
      return undefined;
    }
    let active = true;
    setLoadingSections(true);
    listSections(sel.classId)
      .then((d) => active && setSections(Array.isArray(d) ? d : []))
      .catch(() => active && setSections([]))
      .finally(() => active && setLoadingSections(false));
    return () => {
      active = false;
    };
  }, [open, sel.classId]);

  function addPair() {
    if (!sel.subjectId || !sel.sectionId) return;
    const subject = subjects.find((s) => (s._id ?? s.id) === sel.subjectId);
    const section = sections.find((s) => (s._id ?? s.id) === sel.sectionId);
    const cls = classes.find((c) => (c._id ?? c.id) === sel.classId);
    const next = {
      subjectId: sel.subjectId,
      sectionId: sel.sectionId,
      subjectName: subject?.name,
      subjectCode: subject?.code,
      sectionName: section?.name,
      classLevel: cls?.level,
    };
    setPairs((prev) =>
      prev.some((p) => pairKey(p) === pairKey(next)) ? prev : [...prev, next],
    );
    setSel((s) => ({ ...s, subjectId: '', sectionId: '' })); // keep class for quick repeats
  }

  function removePair(key) {
    setPairs((prev) => prev.filter((p) => pairKey(p) !== key));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload = pairs.map((p) => ({ subjectId: p.subjectId, sectionId: p.sectionId }));
      const updated = await setTeacherTeaching(userId(teacher), payload);
      onSaved(updated);
      onClose();
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'Only a principal can change teaching assignments.'
          : getApiErrorMessage(err, 'Could not save. Please try again.'),
      );
    } finally {
      setSaving(false);
    }
  }

  const id = (o) => o._id ?? o.id;

  return (
    <Modal open={open} onClose={onClose} title="Edit teaching assignments" size="lg">
      <p className="-mt-2 mb-4 text-sm text-text/60">
        Set the full list of subjects this teacher teaches, per section.
      </p>

      {/* Add row */}
      <div className="rounded-lg border border-border p-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            aria-label="Subject"
            value={sel.subjectId}
            onChange={(e) => setSel((s) => ({ ...s, subjectId: e.target.value }))}
            className={inputCls}
          >
            <option value="">Subject…</option>
            {subjects.map((s) => (
              <option key={id(s)} value={id(s)}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <select
            aria-label="Class"
            value={sel.classId}
            onChange={(e) => setSel((s) => ({ ...s, classId: e.target.value, sectionId: '' }))}
            className={inputCls}
          >
            <option value="">Class…</option>
            {classes.map((c) => (
              <option key={id(c)} value={id(c)}>
                Class {c.level}
              </option>
            ))}
          </select>
          <select
            aria-label="Section"
            value={sel.sectionId}
            onChange={(e) => setSel((s) => ({ ...s, sectionId: e.target.value }))}
            disabled={!sel.classId || loadingSections}
            className={inputCls}
          >
            <option value="">
              {!sel.classId ? 'Pick class' : loadingSections ? 'Loading…' : 'Section…'}
            </option>
            {sections.map((s) => (
              <option key={id(s)} value={id(s)}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={addPair}
          disabled={!sel.subjectId || !sel.sectionId}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h disabled:opacity-40"
        >
          <AddRoundedIcon fontSize="small" />
          Add assignment
        </button>
      </div>

      {/* Selected set */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text/50">
          Assigned ({pairs.length})
        </p>
        {pairs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-text/50">
            No assignments. The teacher will teach nothing until you add some.
          </p>
        ) : (
          <ul className="space-y-2">
            {pairs.map((p) => (
              <li
                key={pairKey(p)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium text-text-h">
                    {p.subjectName ?? 'Subject'}
                    {p.subjectCode ? <span className="font-normal text-text/50"> · {p.subjectCode}</span> : null}
                  </span>
                  <span className="text-text/60">
                    {' '}— {p.classLevel != null ? `Class ${p.classLevel} · ` : ''}Section {p.sectionName ?? '?'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removePair(pairKey(p))}
                  aria-label="Remove assignment"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <CloseRoundedIcon fontSize="small" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save assignments'}
        </button>
      </div>
    </Modal>
  );
}
