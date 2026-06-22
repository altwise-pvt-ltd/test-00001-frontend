import { useEffect, useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Tag, StatusBadge } from '../../../shared/components/Badge';
import { useRole } from '../../auth';
import { fmtDate, initials } from '../../../shared/format';
import { getApiErrorMessage } from '../../../shared/apiError';
import { listSubmissions, createSubmission, gradeSubmission } from '../services/submissions';

const inputCls =
  'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-h outline-none transition focus:border-accent-border disabled:opacity-50';

// Render an attachment ref as a link when it looks like a URL, else as plain text.
function Attachment({ value }) {
  const isUrl = /^https?:\/\//i.test(value);
  if (isUrl) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-center truncate rounded-full bg-social-bg px-2.5 py-0.5 text-xs font-medium text-accent hover:underline"
      >
        {value}
      </a>
    );
  }
  return <Tag>{value}</Tag>;
}

// Read-only detail for an assignment, with the role-specific action inline:
//  - teacher: the list of submissions, each gradeable in place.
//  - student: their own submission (status + grade + feedback) or a submit form.
// `scopeLabel` is the resolved "Subject · Section". onChanged() lets the parent
// refresh its list after a submit/grade.
export function AssignmentDetailModal({ open, onClose, assignment, scopeLabel, onChanged }) {
  const { isTeacher, isStudent } = useRole();

  // teacher: all submissions for this assignment. student: their own (0 or 1).
  const [submissions, setSubmissions] = useState(null); // null = loading
  const [error, setError] = useState('');

  // student submit form
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // teacher inline grading
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  const assignmentId = assignment?._id;

  useEffect(() => {
    if (!open || !assignmentId) return undefined;
    let active = true;
    setSubmissions(null);
    setError('');
    setContent('');
    setAttachments('');
    setGradingId(null);
    listSubmissions({ assignmentId })
      .then((data) => active && setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => {
        if (!active) return;
        setSubmissions([]);
        setError('Could not load submissions.');
      });
    return () => {
      active = false;
    };
  }, [open, assignmentId]);

  const mySubmission = isStudent ? submissions?.[0] : null;

  async function handleSubmit(e) {
    e.preventDefault();
    const body = content.trim();
    const files = attachments.split('\n').map((a) => a.trim()).filter(Boolean);
    if (!body && files.length === 0) return setError('Add some text or at least one attachment.');
    setSubmitting(true);
    setError('');
    try {
      const saved = await createSubmission({ assignmentId, content: body, attachments: files });
      setSubmissions([saved]);
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  function startGrading(s) {
    setGradingId(s._id);
    setGradeForm({ grade: s.grade ?? '', feedback: s.feedback ?? '' });
  }

  async function handleGrade(e) {
    e.preventDefault();
    if (!gradeForm.grade.trim()) return setError('Enter a grade (e.g. A, 85, Pass).');
    setGrading(true);
    setError('');
    try {
      const saved = await gradeSubmission(gradingId, {
        grade: gradeForm.grade.trim(),
        feedback: gradeForm.feedback.trim(),
      });
      setSubmissions((prev) => (prev ?? []).map((s) => (s._id === saved._id ? saved : s)));
      setGradingId(null);
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the grade. Please try again.'));
    } finally {
      setGrading(false);
    }
  }

  if (!assignment) return null;

  return (
    <Modal open={open} onClose={onClose} title={assignment.title} size="lg">
      <div className="space-y-5">
        {/* Scope + meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-text/70">
          <Tag>{assignment.type ?? 'homework'}</Tag>
          {scopeLabel && <span>{scopeLabel}</span>}
          <span className="text-text/40">•</span>
          <span>Due {fmtDate(assignment.dueDate)}</span>
        </div>

        {assignment.description ? (
          <p className="whitespace-pre-wrap text-sm text-text">{assignment.description}</p>
        ) : (
          <p className="text-sm text-text/50">No description.</p>
        )}

        {assignment.attachments?.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text/50">Attachments</h3>
            <div className="flex flex-wrap gap-1.5">
              {assignment.attachments.map((a, i) => (
                <Attachment key={i} value={a} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="border-t border-border pt-4">
          {/* ---------- STUDENT ---------- */}
          {isStudent && (
            <>
              <h3 className="mb-3 text-sm font-semibold text-text-h">Your submission</h3>
              {submissions === null ? (
                <p className="text-sm text-text/70" role="status">
                  Loading…
                </p>
              ) : mySubmission ? (
                <div className="space-y-3 rounded-lg border border-border bg-bg/40 p-4">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={mySubmission.status} />
                    <span className="text-xs text-text/50">Submitted {fmtDate(mySubmission.submittedAt)}</span>
                  </div>
                  {mySubmission.content && (
                    <p className="whitespace-pre-wrap text-sm text-text">{mySubmission.content}</p>
                  )}
                  {mySubmission.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {mySubmission.attachments.map((a, i) => (
                        <Attachment key={i} value={a} />
                      ))}
                    </div>
                  )}
                  {mySubmission.status === 'graded' && (
                    <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3">
                      <p className="text-sm font-medium text-green-700">Grade: {mySubmission.grade}</p>
                      {mySubmission.feedback && (
                        <p className="mt-1 text-sm text-text">{mySubmission.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Write your response…"
                    className={inputCls}
                  />
                  <textarea
                    value={attachments}
                    onChange={(e) => setAttachments(e.target.value)}
                    rows={2}
                    placeholder="Attachments — one per line (optional)"
                    className={inputCls}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting…' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ---------- TEACHER ---------- */}
          {isTeacher && (
            <>
              <h3 className="mb-3 text-sm font-semibold text-text-h">
                Submissions{submissions ? ` (${submissions.length})` : ''}
              </h3>
              {submissions === null ? (
                <p className="text-sm text-text/70" role="status">
                  Loading…
                </p>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-text/50">No submissions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {submissions.map((s) => (
                    <li key={s._id} className="rounded-lg border border-border bg-bg/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bg text-xs font-semibold text-accent">
                            {initials(s.studentId?.name)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-text-h">{s.studentId?.name ?? 'Student'}</p>
                            <p className="text-xs text-text/50">Submitted {fmtDate(s.submittedAt)}</p>
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>

                      {s.content && <p className="mt-3 whitespace-pre-wrap text-sm text-text">{s.content}</p>}
                      {s.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.attachments.map((a, i) => (
                            <Attachment key={i} value={a} />
                          ))}
                        </div>
                      )}

                      {gradingId === s._id ? (
                        <form onSubmit={handleGrade} className="mt-3 space-y-2 border-t border-border pt-3">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <input
                              value={gradeForm.grade}
                              onChange={(e) => setGradeForm((g) => ({ ...g, grade: e.target.value }))}
                              autoFocus
                              placeholder="Grade (A, 85, Pass)"
                              className={inputCls}
                            />
                            <input
                              value={gradeForm.feedback}
                              onChange={(e) => setGradeForm((g) => ({ ...g, feedback: e.target.value }))}
                              placeholder="Feedback (optional)"
                              className={`${inputCls} sm:col-span-2`}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingId(null)}
                              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={grading}
                              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                              {grading ? 'Saving…' : 'Save grade'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          {s.status === 'graded' ? (
                            <p className="text-sm text-text">
                              <span className="font-medium text-text-h">Grade: {s.grade}</span>
                              {s.feedback ? ` — ${s.feedback}` : ''}
                            </p>
                          ) : (
                            <span className="text-sm text-text/50">Not graded</span>
                          )}
                          <button
                            onClick={() => startGrading(s)}
                            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:border-text-h hover:text-text-h"
                          >
                            {s.status === 'graded' ? 'Edit grade' : 'Grade'}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
