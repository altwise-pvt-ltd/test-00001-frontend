import { http } from '../../auth';

// Unwraps the API's { success, data } envelope; tolerates a bare array or a
// paginated object.
function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.assignments ?? []);
}

// GET /assignments — the backend auto-scopes by role (a student sees their own
// section, a teacher sees what they teach). Optional { sectionId } filter. The
// response populates subjectAllocationId (teacher/subject/section ids) and
// sectionId (name).
export async function listAssignments(params = {}) {
  const { data } = await http.get('/assignments', { params });
  return unwrapList(data);
}

export async function getAssignment(id) {
  const { data } = await http.get(`/assignments/${id}`);
  return data.data;
}

// POST /assignments (teacher only). The section is inherited from the subject
// allocation, so the client sends subjectAllocationId, not a section.
export async function createAssignment(payload) {
  const { data } = await http.post('/assignments', payload);
  return data.data;
}

// PUT /assignments/:id — content fields only (title/description/type/dueDate/
// attachments). The teaching assignment (and thus the section) can't change.
export async function updateAssignment(id, payload) {
  const { data } = await http.put(`/assignments/${id}`, payload);
  return data.data;
}

export async function deleteAssignment(id) {
  await http.delete(`/assignments/${id}`);
}
