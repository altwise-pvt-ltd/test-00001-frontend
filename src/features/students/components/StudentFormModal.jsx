import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { useAuthStore, useRole } from '../../auth';
import { getApiErrorMessage } from '../../../shared/apiError';
import { createStudent, updateStudent, userId } from '../services/students';
import { listClasses } from '../../classes';
import { listSections } from '../../sections';
import { listTeachingAssignments } from '../../assignments';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: '', email: '', dateOfBirth: '', classId: '', sectionId: '' };

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Extracts an id from either a raw ObjectId string or a populated { _id|id, ... }
// reference, so we tolerate teaching assignments populating sectionId either way.
const idOf = (v) =>
  v && typeof v === 'object' ? String(v._id ?? v.id ?? '') : v != null ? String(v) : '';

// Create/edit form for a student. On create a principal cascades class → section
// to place the student; a teacher places them in one of THEIR OWN sections,
// derived from their teaching assignments (teacher × subject × section, fetched
// via GET /teaching-assignments?teacherId=). A section can recur across several
// subjects, so we de-duplicate it. A teacher with a single section gets it
// auto-selected (read-only); one with several gets a picker limited to just
// those sections. On edit only name/email are sent. Calls onSaved(savedStudent)
// on success.
export function StudentFormModal({ open, onClose, onSaved, initial }) {
  const isEdit = Boolean(initial);
  const { isTeacher } = useRole();
  const myId = useAuthStore((s) => s.user?.id ?? s.user?._id);
  const [form, setForm] = useState(EMPTY);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  // Teacher's own sections, enriched with display labels: [{ sectionId, classId, label }].
  const [teacherSections, setTeacherSections] = useState([]);
  const [loadingTeacherSections, setLoadingTeacherSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // When the teacher picks one of their sections, set BOTH sectionId and its
  // matching classId together (the backend requires them to be consistent).
  const pickTeacherSection = (e) => {
    const sectionId = e.target.value;
    const match = teacherSections.find((s) => s.sectionId === sectionId);
    setForm((f) => ({ ...f, sectionId, classId: match?.classId ?? '' }));
  };

  // Reset on open; load classes for the create cascade.
  useEffect(() => {
    if (!open) return undefined;
    setForm(initial ? { ...EMPTY, name: initial.name ?? '', email: initial.email ?? '' } : EMPTY);
    setError('');
    setSections([]);
    // Only a principal picks the placement; a teacher uses their own section.
    if (!isEdit && !isTeacher) {
      let active = true;
      listClasses()
        .then((data) => active && setClasses(Array.isArray(data) ? data : []))
        .catch(() => active && setClasses([]));
      return () => {
        active = false;
      };
    }
    return undefined;
  }, [open, initial, isEdit, isTeacher]);

  // Load sections whenever the selected class changes (principal create only).
  useEffect(() => {
    if (isEdit || isTeacher || !form.classId) {
      setSections([]);
      return undefined;
    }
    let active = true;
    setLoadingSections(true);
    listSections(form.classId)
      .then((data) => active && setSections(Array.isArray(data) ? data : []))
      .catch(() => active && setSections([]))
      .finally(() => active && setLoadingSections(false));
    return () => {
      active = false;
    };
  }, [form.classId, isEdit, isTeacher]);

  // Teacher create: derive the teacher's own sections from their teaching
  // assignments (the single source of truth for what a teacher teaches), then
  // resolve each section's parent class + display label by matching against the
  // school's class/section lists. A section taught for several subjects is kept
  // once. Auto-select when the teacher teaches exactly one section.
  useEffect(() => {
    if (!open || isEdit || !isTeacher || !myId) return undefined;
    let active = true;
    setLoadingTeacherSections(true);
    listTeachingAssignments({ teacherId: myId })
      .then((tas) => {
        if (!active) return undefined;
        // Distinct sectionIds the teacher teaches, preserving first-seen order.
        const seen = new Set();
        const taughtSectionIds = [];
        for (const ta of Array.isArray(tas) ? tas : []) {
          const sectionId = idOf(ta?.sectionId);
          if (!sectionId || seen.has(sectionId)) continue;
          seen.add(sectionId);
          taughtSectionIds.push(sectionId);
        }
        if (taughtSectionIds.length === 0) {
          setTeacherSections([]);
          return undefined;
        }
        // Resolve classId + label for each taught section. Teaching assignments
        // populate only the section name, so map every class's sections to find
        // the parent class (and its level) for the de-duplicated sections.
        return listClasses()
          .catch(() => [])
          .then((classList) => {
            const classes = Array.isArray(classList) ? classList : [];
            return Promise.all(
              classes.map((c) =>
                listSections(idOf(c))
                  .then((secs) => [c, Array.isArray(secs) ? secs : []])
                  .catch(() => [c, []])
              )
            );
          })
          .then((entries) => {
            if (!active) return;
            const bySection = new Map();
            for (const [cls, secs] of entries) {
              const classId = idOf(cls);
              for (const sec of secs) {
                const label = [
                  cls.level != null ? `Class ${cls.level}` : null,
                  sec?.name ? `Section ${sec.name}` : 'Section',
                ]
                  .filter(Boolean)
                  .join(' · ');
                bySection.set(idOf(sec), { sectionId: idOf(sec), classId, label });
              }
            }
            const enriched = taughtSectionIds.map((sid) => bySection.get(sid)).filter(Boolean);
            setTeacherSections(enriched);
            if (enriched.length === 1) {
              setForm((f) => ({ ...f, classId: enriched[0].classId, sectionId: enriched[0].sectionId }));
            }
          });
      })
      .catch(() => active && setTeacherSections([]))
      .finally(() => active && setLoadingTeacherSections(false));
    return () => {
      active = false;
    };
  }, [open, isEdit, isTeacher, myId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError('Name is required.');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');
    // Both roles enroll into a concrete class + section pair: a teacher into one
    // of their own sections, a principal into one chosen via the cascade.
    const { classId, sectionId } = form;
    if (!isEdit) {
      if (!form.dateOfBirth) return setError('Date of birth is required (it sets the initial password).');
      if (isTeacher) {
        if (teacherSections.length === 0) {
          return setError('Your account is not assigned to any section, so you cannot enroll students.');
        }
        if (!sectionId || !classId) return setError('Select which of your sections to enroll the student into.');
      } else if (!sectionId || !classId) {
        return setError('Select a class and section for the student.');
      }
    }

    setSubmitting(true);
    setError('');
    try {
      const saved = isEdit
        ? await updateStudent(userId(initial), { name, email })
        : await createStudent({ name, email, dateOfBirth: form.dateOfBirth, classId, sectionId });
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the student. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit student' : 'New student'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="s-name" className="mb-1 block text-sm font-medium text-text-h">
            Full name
          </label>
          <input id="s-name" value={form.name} onChange={set('name')} autoFocus placeholder="e.g. Sam Pupil" className={inputCls} />
        </div>

        <div>
          <label htmlFor="s-email" className="mb-1 block text-sm font-medium text-text-h">
            Email
          </label>
          <input id="s-email" type="email" value={form.email} onChange={set('email')} placeholder="sam@greenwood.test" className={inputCls} />
        </div>

        {!isEdit && (
          <>
            <div>
              <label htmlFor="s-dob" className="mb-1 block text-sm font-medium text-text-h">
                Date of birth
              </label>
              <input id="s-dob" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputCls} />
              <p className="mt-1 text-xs text-text/60">Doubles as the student's initial login password.</p>
            </div>

            {isTeacher ? (
              <div>
                <label htmlFor="s-teacher-section" className="mb-1 block text-sm font-medium text-text-h">
                  Section
                </label>
                {loadingTeacherSections ? (
                  <p className="rounded-md border border-border bg-social-bg/40 px-3 py-2 text-xs text-text/70">
                    Loading your sections…
                  </p>
                ) : teacherSections.length === 0 ? (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                    You aren't assigned to any section yet, so you can't enroll students. Ask your
                    principal to assign you to a class section.
                  </p>
                ) : teacherSections.length === 1 ? (
                  <>
                    <div className={`${inputCls} flex items-center`}>{teacherSections[0].label}</div>
                    <p className="mt-1 text-xs text-text/60">
                      The student will be enrolled in your section.
                    </p>
                  </>
                ) : (
                  <>
                    <select
                      id="s-teacher-section"
                      value={form.sectionId}
                      onChange={pickTeacherSection}
                      className={inputCls}
                    >
                      <option value="">Select your section…</option>
                      {teacherSections.map((s) => (
                        <option key={s.sectionId} value={s.sectionId}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-text/60">
                      Choose which of your sections to enroll the student into.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="s-class" className="mb-1 block text-sm font-medium text-text-h">
                  Class
                </label>
                <select id="s-class" value={form.classId} onChange={set('classId')} className={inputCls}>
                  <option value="">Select…</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      Class {c.level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="s-section" className="mb-1 block text-sm font-medium text-text-h">
                  Section
                </label>
                <select
                  id="s-section"
                  value={form.sectionId}
                  onChange={set('sectionId')}
                  disabled={!form.classId || loadingSections}
                  className={inputCls}
                >
                  <option value="">
                    {!form.classId ? 'Pick a class first' : loadingSections ? 'Loading…' : 'Select…'}
                  </option>
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {form.classId && !loadingSections && sections.length === 0 && (
              <p className="text-xs text-amber-600">
                This class has no sections yet. Create one before enrolling students.
              </p>
            )}
              </>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create student'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
