import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { DetailSection } from '../../../shared/components/DetailSection';
import { Tag, StatusBadge } from '../../../shared/components/Badge';
import { fmtDate } from '../../../shared/format';
import { getClassDetail } from '../services/classes';

// Loads GET /classes/:id/detail (principal only) — everything aggregated across
// every section: roster, subjects+teachers, assignments and submissions.
export function ClassDetailModal({ open, classId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !classId) return undefined;
    let active = true;
    setData(null);
    setError('');
    getClassDetail(classId)
      .then((d) => active && setData(d))
      .catch((err) => {
        if (!active) return;
        const status = err?.response?.status;
        setError(
          status === 403
            ? 'Only a principal can view class details.'
            : status === 404
              ? 'Class not found.'
              : 'Could not load class details.',
        );
      });
    return () => {
      active = false;
    };
  }, [open, classId]);

  return (
    <Modal open={open} onClose={onClose} title={data ? `Class ${data.level}` : 'Class details'} size="xl">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!data && !error && (
        <p className="py-6 text-center text-sm text-text/60" role="status">
          Loading details…
        </p>
      )}

      {data && (
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <DetailSection title="Sections" count={data.sections?.length} empty="No sections yet">
            <div className="flex flex-wrap gap-2">
              {data.sections?.map((s) => (
                <Tag key={s.id}>Section {s.name}</Tag>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Subjects" count={data.subjects?.length} empty="No subjects yet">
            <ul className="space-y-2">
              {data.subjects?.map((s) => (
                <li key={s.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="font-medium text-text-h">
                    {s.name} <span className="font-normal text-text/50">· {s.code}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.teachers?.length ? (
                      s.teachers.map((t, i) => (
                        <Tag key={`${t.id}-${t.sectionName}-${i}`}>
                          {t.name} · {t.sectionName}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-xs text-text/50">No teacher assigned</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Students" count={data.students?.length} empty="No students enrolled">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <tbody>
                  {data.students?.map((st) => (
                    <tr key={st.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-text-h">{st.name}</td>
                      <td className="px-3 py-2 text-right">
                        <Tag>Section {st.sectionName}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>

          <DetailSection title="Assignments" count={data.assignments?.length} empty="No assignments yet">
            <ul className="space-y-2">
              {data.assignments?.map((a) => (
                <li key={a.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-text-h">{a.title}</span>
                    <Tag>{a.type}</Tag>
                  </div>
                  <p className="mt-1 text-xs text-text/60">
                    {a.subjectName} · Section {a.sectionName} · {a.teacherName} · Due{' '}
                    {fmtDate(a.dueDate)}
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Submissions" count={data.submissions?.length} empty="No submissions yet">
            <ul className="space-y-2">
              {data.submissions?.map((s) => (
                <li key={s.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-text-h">{s.studentName}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.grade && <Tag>Grade {s.grade}</Tag>}
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text/60">{s.assignmentTitle}</p>
                </li>
              ))}
            </ul>
          </DetailSection>
        </div>
      )}
    </Modal>
  );
}
