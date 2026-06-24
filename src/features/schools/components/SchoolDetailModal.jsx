import { useCallback, useEffect, useState } from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Modal } from '../../../shared/components/Modal';
import { Tag } from '../../../shared/components/Badge';
import { getApiErrorMessage } from '../../../shared/apiError';
import { listPrincipals } from '../../principals';
import {
  getSchool,
  listSchoolSubjects,
  listSchoolClasses,
  assignPrincipal,
  unassignPrincipal,
  activateSchool,
  deactivateSchool,
  createSchoolSubject,
  createSchoolClass,
  createSchoolSection,
} from '../services/schools';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';
const btnGhost =
  'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h disabled:opacity-40';

const idOf = (o) => o?._id ?? o?.id ?? o;

// Super-admin control panel for one school: principal assignment, active state,
// and admin-targeted setup (seed subjects/classes/sections without being the
// principal). Reads the school fresh on open so nested principal/classes/subjects
// reflect the latest state; refetches after every mutation. `onChanged` lets the
// parent list refresh status/principal columns.
export function SchoolDetailModal({ open, school, onClose, onChanged }) {
  const schoolId = idOf(school);
  const [data, setData] = useState(null); // fresh school detail
  const [classes, setClasses] = useState([]); // school's classes (own endpoint)
  const [subjects, setSubjects] = useState([]); // school's subjects (own endpoint)
  const [principals, setPrincipals] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Local setup forms.
  const [pick, setPick] = useState(''); // principal to assign
  const [subj, setSubj] = useState({ name: '', code: '' });
  const [level, setLevel] = useState('');
  const [section, setSection] = useState({ name: '', classId: '' });

  const refresh = useCallback(async () => {
    if (!schoolId) return;
    // getSchool() doesn't embed classes/subjects, so fetch them on their own.
    const [fresh, cls, subs] = await Promise.all([
      getSchool(schoolId),
      listSchoolClasses(schoolId),
      listSchoolSubjects(schoolId),
    ]);
    setData(fresh);
    setClasses(Array.isArray(cls) ? cls : []);
    setSubjects(Array.isArray(subs) ? subs : []);
  }, [schoolId]);

  useEffect(() => {
    if (!open) return undefined;
    setError('');
    setPick('');
    setSubj({ name: '', code: '' });
    setLevel('');
    setSection({ name: '', classId: '' });
    setData(school ?? null);
    setClasses([]);
    setSubjects([]);
    let active = true;
    refresh().catch(() => active && setError('Could not load the school.'));
    listPrincipals()
      .then((p) => active && setPrincipals(Array.isArray(p) ? p : []))
      .catch(() => active && setPrincipals([]));
    return () => {
      active = false;
    };
  }, [open, school, refresh]);

  // Run a mutation, then refetch + notify the parent. Surfaces a friendly error.
  async function run(fn, fallback) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await refresh();
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  }

  const principal = data?.principal && typeof data.principal === 'object' ? data.principal : null;
  const isActive = data?.isActive !== false;

  return (
    <Modal open={open} onClose={onClose} title={data?.name || school?.name || 'School'} size="lg">
      {/* Status + address */}
      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive ? 'bg-green-500/10 text-green-600' : 'bg-social-bg text-text/60'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
        {data?.address && <span className="text-text/60">{data.address}</span>}
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(
              () => (isActive ? deactivateSchool(schoolId) : activateSchool(schoolId)),
              'Could not change the school status.',
            )
          }
          className={`${btnGhost} ml-auto`}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Principal */}
      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-h">Principal</h3>
        {principal ? (
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium text-text-h">{principal.name}</span>
              <span className="text-text/60"> · {principal.email}</span>
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => unassignPrincipal(schoolId), 'Could not unassign the principal.')}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-40"
            >
              Unassign
            </button>
          </div>
        ) : (
          <p className="mb-3 text-sm text-text/60">No principal assigned.</p>
        )}
        <div className="flex gap-2">
          <select
            aria-label="Principal"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className={inputCls}
          >
            <option value="">{principal ? 'Reassign to…' : 'Assign a principal…'}</option>
            {principals.map((p) => (
              <option key={idOf(p)} value={idOf(p)}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !pick}
            onClick={() => run(() => assignPrincipal(schoolId, pick), 'Could not assign the principal.')}
            className={btnGhost}
          >
            Assign
          </button>
        </div>
      </section>

      {/* Admin-targeted setup */}
      <section className="mt-4 rounded-lg border border-border p-4">
        <h3 className="mb-1 text-sm font-semibold text-text-h">Quick setup</h3>
        <p className="mb-4 text-xs text-text/60">
          Seed this school's subjects, classes and sections on the school's behalf.
        </p>

        {/* Subject */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              aria-label="Subject name"
              value={subj.name}
              onChange={(e) => setSubj((s) => ({ ...s, name: e.target.value }))}
              placeholder="Subject name"
              className={inputCls}
            />
            <input
              aria-label="Subject code"
              value={subj.code}
              onChange={(e) => setSubj((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
              placeholder="CODE"
              className={`${inputCls} max-w-[8rem]`}
            />
            <button
              type="button"
              disabled={busy || !subj.name.trim() || !subj.code.trim()}
              onClick={() =>
                run(async () => {
                  await createSchoolSubject(schoolId, {
                    name: subj.name.trim(),
                    code: subj.code.trim(),
                  });
                  setSubj({ name: '', code: '' });
                }, 'Could not create the subject.')
              }
              className={btnGhost}
            >
              <AddRoundedIcon fontSize="small" />
              Subject
            </button>
          </div>
          {subjects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <Tag key={idOf(s)}>
                  {s.name} · {s.code}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* Class */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              aria-label="Class level"
              type="number"
              min="1"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Class level (e.g. 7)"
              className={inputCls}
            />
            <button
              type="button"
              disabled={busy || !level}
              onClick={() =>
                run(async () => {
                  await createSchoolClass(schoolId, { level: Number(level) });
                  setLevel('');
                }, 'Could not create the class.')
              }
              className={btnGhost}
            >
              <AddRoundedIcon fontSize="small" />
              Class
            </button>
          </div>
          {classes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {classes.map((c) => (
                <Tag key={idOf(c)}>Class {c.level}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Section (needs a class) */}
        <div className="flex gap-2">
          <select
            aria-label="Section class"
            value={section.classId}
            onChange={(e) => setSection((s) => ({ ...s, classId: e.target.value }))}
            disabled={classes.length === 0}
            className={inputCls}
          >
            <option value="">{classes.length === 0 ? 'Add a class first' : 'Class…'}</option>
            {classes.map((c) => (
              <option key={idOf(c)} value={idOf(c)}>
                Class {c.level}
              </option>
            ))}
          </select>
          <input
            aria-label="Section name"
            value={section.name}
            onChange={(e) => setSection((s) => ({ ...s, name: e.target.value }))}
            placeholder="Section (e.g. A)"
            className={`${inputCls} max-w-[10rem]`}
          />
          <button
            type="button"
            disabled={busy || !section.classId || !section.name.trim()}
            onClick={() =>
              run(async () => {
                await createSchoolSection(schoolId, {
                  name: section.name.trim(),
                  classId: section.classId,
                });
                setSection({ name: '', classId: '' });
              }, 'Could not create the section.')
            }
            className={btnGhost}
          >
            <AddRoundedIcon fontSize="small" />
            Section
          </button>
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
