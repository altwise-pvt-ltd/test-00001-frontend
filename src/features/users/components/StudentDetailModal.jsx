import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { DetailSection } from '../../../shared/components/DetailSection';
import { Tag, StatusBadge } from '../../../shared/components/Badge';
import { fmtDate, initials } from '../../../shared/format';
import { getStudentDetail } from '../services/users';

// Loads GET /users/students/:id and shows the student's placement, the subjects
// taught to their section, and the section's worklist with this student's state
// (status/grade) folded in — so we render straight from `assignments`.
export function StudentDetailModal({ open, studentId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !studentId) return undefined;
    let active = true;
    setData(null);
    setError('');
    getStudentDetail(studentId)
      .then((d) => active && setData(d))
      .catch((err) =>
        active && setError(err?.response?.status === 404 ? 'Student not found.' : 'Could not load student.'),
      );
    return () => {
      active = false;
    };
  }, [open, studentId]);

  const placement = data?.class
    ? `Class ${data.class.level}${data.section ? ` · Section ${data.section.name}` : ''}`
    : 'Unplaced';

  return (
    <Modal open={open} onClose={onClose} title="Student details" size="lg">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!data && !error && (
        <p className="py-6 text-center text-sm text-text/60" role="status">
          Loading details…
        </p>
      )}

      {data && (
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-bg text-sm font-semibold text-accent">
              {initials(data.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-text-h">{data.name}</p>
              <p className="truncate text-sm text-text/70">{data.email}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border p-3 text-sm">
            <Meta label="Placement" value={placement} />
            <Meta label="Status" value={data.isActive === false ? 'Inactive' : 'Active'} />
            <Meta label="Born" value={fmtDate(data.dateOfBirth)} />
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <DetailSection title="Subjects" count={data.subjects?.length} empty="No subjects yet">
            <ul className="space-y-2">
              {data.subjects?.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium text-text-h">
                    {s.name} <span className="font-normal text-text/50">· {s.code}</span>
                  </span>
                  <span className="text-text/60">{s.teacher?.name ?? 'Unassigned'}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection
            title="Assignments"
            count={data.assignments?.length}
            empty="Nothing assigned yet"
          >
            <ul className="space-y-2">
              {data.assignments?.map((a) => (
                <li key={a.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-text-h">{a.title}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      {a.grade && <Tag>Grade {a.grade}</Tag>}
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text/60">
                    {a.subjectName} · {a.type} · Due {fmtDate(a.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>
          </div>
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
