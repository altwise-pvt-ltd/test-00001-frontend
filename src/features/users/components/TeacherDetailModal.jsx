import { useEffect, useState } from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Modal } from '../../../shared/components/Modal';
import { DetailSection } from '../../../shared/components/DetailSection';
import { Tag } from '../../../shared/components/Badge';
import { fmtDate, initials } from '../../../shared/format';
import { useAuthStore } from '../../auth';
import { getTeacherDetail } from '../services/users';
import { TeacherTeachingModal } from './TeacherTeachingModal';

// Loads GET /users/teachers/:id and shows the teacher with everything they
// teach and created.
export function TeacherDetailModal({ open, teacherId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [editingTeaching, setEditingTeaching] = useState(false);
  const isPrincipal = useAuthStore((s) => s.user?.role) === 'principal';

  useEffect(() => {
    if (!open || !teacherId) return undefined;
    let active = true;
    setData(null);
    setError('');
    getTeacherDetail(teacherId)
      .then((d) => active && setData(d))
      .catch((err) =>
        active && setError(err?.response?.status === 404 ? 'Teacher not found.' : 'Could not load teacher.'),
      );
    return () => {
      active = false;
    };
  }, [open, teacherId]);

  return (
    <Modal open={open} onClose={onClose} title="Teacher details" size="lg">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!data && !error && (
        <p className="py-6 text-center text-sm text-text/60" role="status">
          Loading details…
        </p>
      )}

      {data && (
        <div>
          {/* Profile */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-sm font-semibold text-accent">
                {initials(data.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-text-h">{data.name}</p>
                <p className="truncate text-sm text-text/70">{data.email}</p>
              </div>
            </div>
            {isPrincipal && (
              <button
                onClick={() => setEditingTeaching(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
              >
                <EditRoundedIcon fontSize="small" />
                Edit teaching
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border p-3 text-sm">
            <Meta label="Status" value={data.isActive === false ? 'Inactive' : 'Active'} />
            <Meta label="Born" value={fmtDate(data.dateOfBirth)} />
            <Meta label="Joined" value={fmtDate(data.createdAt)} />
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <DetailSection title="Subjects" count={data.subjects?.length} empty="No subjects assigned">
            <div className="flex flex-wrap gap-2">
              {data.subjects?.map((s) => (
                <Tag key={s.id}>
                  {s.name} · {s.code}
                </Tag>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Sections taught" count={data.sections?.length} empty="No sections">
            <div className="flex flex-wrap gap-2">
              {data.sections?.map((s) => (
                <Tag key={s.id}>
                  Class {s.classLevel} · {s.name}
                </Tag>
              ))}
            </div>
          </DetailSection>

          <DetailSection
            title="Teaching assignments"
            count={data.teachingAssignments?.length}
            empty="No teaching assignments"
          >
            <ul className="space-y-2">
              {data.teachingAssignments?.map((ta) => (
                <li
                  key={ta.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-h">{ta.subject?.name}</span>
                  <span className="text-text/60">
                    Class {ta.classLevel} · Section {ta.section?.name}
                  </span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection
            title="Assignments created"
            count={data.assignments?.length}
            empty="No assignments created"
          >
            <ul className="space-y-2">
              {data.assignments?.map((a) => (
                <li key={a.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-text-h">{a.title}</span>
                    <Tag>{a.type}</Tag>
                  </div>
                  <p className="mt-1 text-xs text-text/60">
                    Section {a.sectionName} · Due {fmtDate(a.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>
          </div>

          {isPrincipal && (
            <TeacherTeachingModal
              open={editingTeaching}
              teacher={data}
              onClose={() => setEditingTeaching(false)}
              onSaved={(updated) => setData(updated)}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text/50">{label}</p>
      <p className="mt-0.5 text-text-h">{value}</p>
    </div>
  );
}
