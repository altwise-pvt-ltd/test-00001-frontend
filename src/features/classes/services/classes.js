import { http } from '../../auth';

// CRUD for /classes. The API wraps payloads as { success, data }, so each
// helper unwraps `data.data` and returns the bare resource(s).
export async function listClasses() {
  const { data } = await http.get('/classes');
  return data.data;
}

export async function createClass(payload) {
  const { data } = await http.post('/classes', payload);
  return data.data;
}

export async function updateClass(id, payload) {
  const { data } = await http.put(`/classes/${id}`, payload);
  return data.data;
}

export async function deleteClass(id) {
  await http.delete(`/classes/${id}`);
}

// Aggregated view across every section of the class (sections, students,
// subjects+teachers, assignments, submissions). GET /classes/:id/detail —
// principal only (403 otherwise).
export async function getClassDetail(id) {
  const { data } = await http.get(`/classes/${id}/detail`);
  return data.data;
}
