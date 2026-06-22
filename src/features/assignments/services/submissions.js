import { http } from '../../auth';

function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.submissions ?? []);
}

// GET /submissions — role-scoped by the backend: a student only ever sees their
// own; a teacher sees submissions under what they teach. Optional { assignmentId }
// filter. Response populates studentId (name/email) and assignmentId (title).
export async function listSubmissions(params = {}) {
  const { data } = await http.get('/submissions', { params });
  return unwrapList(data);
}

// POST /submissions (student only). Must carry content or at least one
// attachment. One submission per student per assignment (409 on a repeat).
export async function createSubmission(payload) {
  const { data } = await http.post('/submissions', payload);
  return data.data;
}

// PATCH /submissions/:id/grade (teacher only) — records grade + optional feedback
// and flips status to "graded".
export async function gradeSubmission(id, payload) {
  const { data } = await http.patch(`/submissions/${id}/grade`, payload);
  return data.data;
}
