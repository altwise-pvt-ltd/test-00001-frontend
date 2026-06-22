import { http } from '../../auth';

// Sections for a class — GET /sections?classId=. Unwraps { success, data } and
// tolerates either a bare array or a paginated envelope.
export async function listSections(classId) {
  const { data } = await http.get('/sections', {
    params: classId ? { classId } : undefined,
  });
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.sections ?? []);
}

// POST /sections { name, classId }. A section belongs to a class; the parent
// class is fixed at creation.
export async function createSection(payload) {
  const { data } = await http.post('/sections', payload);
  return data.data;
}

// PUT /sections/:id — only the name is editable.
export async function updateSection(id, payload) {
  const { data } = await http.put(`/sections/${id}`, payload);
  return data.data;
}

export async function deleteSection(id) {
  await http.delete(`/sections/${id}`);
}
