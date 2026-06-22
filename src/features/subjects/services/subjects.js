import { http } from '../../auth';

// Subjects for the school — GET /subjects. Unwraps { success, data } and
// tolerates a bare array or a paginated envelope.
export async function listSubjects() {
  const { data } = await http.get('/subjects');
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.subjects ?? []);
}

// POST /subjects { name, code }. The code is set at creation and is immutable.
export async function createSubject(payload) {
  const { data } = await http.post('/subjects', payload);
  return data.data;
}

// PUT /subjects/:id — only the name is editable.
export async function updateSubject(id, payload) {
  const { data } = await http.put(`/subjects/${id}`, payload);
  return data.data;
}

export async function deleteSubject(id) {
  await http.delete(`/subjects/${id}`);
}
