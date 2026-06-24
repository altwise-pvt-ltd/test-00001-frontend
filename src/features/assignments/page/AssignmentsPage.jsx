import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { Modal } from '../../../shared/components/Modal';
import { Tag, StatusBadge } from '../../../shared/components/Badge';
import { useAuthStore, useRole } from '../../auth';
import { fmtDate } from '../../../shared/format';
import { listAssignments, deleteAssignment } from '../services/assignments';
import { listSubmissions } from '../services/submissions';
import { listSubjectAllocations } from '../services/subjectAllocations';
import { AssignmentFormModal } from '../components/AssignmentFormModal';
import { AssignmentDetailModal } from '../components/AssignmentDetailModal';

const idStr = (v) => (v && typeof v === 'object' ? String(v._id ?? v.id ?? '') : v != null ? String(v) : '');

// Build a lookup: subjectAllocationId -> { subject, code, section } from a
// subject-allocation list (populated with subject name/code + section name).
function buildAllocMap(allocations) {
  const map = new Map();
  for (const alloc of allocations || []) {
    map.set(String(alloc._id), {
      subject: alloc.subjectId?.name,
      code: alloc.subjectId?.code,
      section: alloc.sectionId?.name,
    });
  }
  return map;
}

// Teachers and students share this page; the role decides what they can do:
// a teacher authors assignments and grades submissions, a student reads the
// assignments for their section and submits work.
export function AssignmentsPage() {
  const { isTeacher, isStudent } = useRole();
  const user = useAuthStore((s) => s.user);
  const myId = user?.id ?? user?._id;
  const mySectionId = user?.sectionId ?? null;

  const [assignments, setAssignments] = useState(null); // null = loading
  const [allocMap, setAllocMap] = useState(() => new Map());
  const [subsByAssignment, setSubsByAssignment] = useState(() => new Map()); // student: assignmentId -> submission
  const [error, setError] = useState('');

  const [formFor, setFormFor] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [viewing, setViewing] = useState(null); // assignment open in the detail modal
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [list, allocations, subs] = await Promise.all([
        listAssignments(),
        isTeacher
          ? listSubjectAllocations({ teacherId: myId })
          : isStudent && mySectionId
            ? listSubjectAllocations({ sectionId: mySectionId })
            : Promise.resolve([]),
        isStudent ? listSubmissions() : Promise.resolve([]),
      ]);
      setAssignments(Array.isArray(list) ? list : []);
      setAllocMap(buildAllocMap(allocations));
      const m = new Map();
      for (const s of subs || []) m.set(idStr(s.assignmentId), s);
      setSubsByAssignment(m);
    } catch {
      setError('Could not load assignments.');
      setAssignments([]);
    }
  }, [isTeacher, isStudent, myId, mySectionId]);

  useEffect(() => {
    load();
  }, [load]);

  // Resolve an assignment's "Subject · Section" label from the TA map, falling
  // back to the populated section name on the assignment itself.
  const scopeOf = useMemo(
    () => (a) => {
      const alloc = allocMap.get(idStr(a.subjectAllocationId));
      const section = a.sectionId?.name ?? alloc?.section;
      const subject = alloc?.subject ? `${alloc.subject}${alloc.code ? ` (${alloc.code})` : ''}` : null;
      return [subject, section ? `Section ${section}` : null].filter(Boolean).join(' · ');
    },
    [allocMap]
  );

  function handleSaved() {
    setFormFor(undefined);
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteAssignment(deleting._id);
      setAssignments((prev) => (prev ?? []).filter((a) => a._id !== deleting._id));
      setDeleting(null);
    } catch {
      setError('Could not delete the assignment.');
    } finally {
      setRemoving(false);
    }
  }

  const isLoading = assignments === null;
  const isEmpty = Array.isArray(assignments) && assignments.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-h sm:text-3xl">Assignments</h1>
          <p className="mt-1 text-sm text-text/60">
            {isTeacher
              ? 'Set work for your sections and grade what comes back.'
              : 'Your homework, reading and books — and where you turn them in.'}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setFormFor(null)}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <AddRoundedIcon fontSize="small" />
            New assignment
          </button>
        )}
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text/70" role="status">
          Loading assignments…
        </p>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50">
            <AssignmentRoundedIcon />
          </span>
          <p className="text-sm font-medium text-text-h">No assignments yet</p>
          <p className="mt-1 max-w-xs text-xs text-text/60">
            {isTeacher
              ? 'Create your first assignment for one of the sections you teach.'
              : 'When your teachers set work, it will show up here.'}
          </p>
          {isTeacher && (
            <button
              onClick={() => setFormFor(null)}
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
            >
              <AddRoundedIcon fontSize="small" />
              New assignment
            </button>
          )}
        </div>
      )}

      {!isLoading && !isEmpty && (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a, i) => {
            const mine = subsByAssignment.get(idStr(a._id));
            return (
              <motion.button
                key={a._id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setViewing(a)}
                className="group flex flex-col rounded-xl border border-border bg-bg/60 p-5 text-left shadow-card transition-colors hover:border-accent-border"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h2 className="font-medium text-text-h">{a.title}</h2>
                  {isStudent && <StatusBadge status={mine?.status ?? 'pending'} />}
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text/60">
                  <Tag>{a.type ?? 'homework'}</Tag>
                  {scopeOf(a) && <span>{scopeOf(a)}</span>}
                </div>

                {a.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-text/80">{a.description}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-text/50">Due {fmtDate(a.dueDate)}</span>
                  {isTeacher && (
                    <div className="flex gap-1">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormFor(a);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormFor(a);
                          }
                        }}
                        aria-label={`Edit ${a.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(a);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleting(a);
                          }
                        }}
                        aria-label={`Delete ${a.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Teacher: create / edit */}
      {isTeacher && (
        <AssignmentFormModal
          open={formFor !== undefined}
          initial={formFor || null}
          scopeLabel={formFor ? scopeOf(formFor) : undefined}
          onClose={() => setFormFor(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* Detail — submit (student) or grade (teacher) */}
      <AssignmentDetailModal
        open={Boolean(viewing)}
        assignment={viewing}
        scopeLabel={viewing ? scopeOf(viewing) : undefined}
        onClose={() => setViewing(null)}
        onChanged={load}
      />

      {/* Teacher: delete confirmation */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete assignment">
        <p className="text-sm text-text">
          Delete <span className="font-medium text-text-h">{deleting?.title}</span>? This can't be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setDeleting(null)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={removing}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {removing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
