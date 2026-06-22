import { http } from '../../auth';

// Mongo uses _id; some endpoints (e.g. /auth/me) return `id`. Normalise.
export const userId = (u) => u?._id ?? u?.id;

// Unwraps the API's { success, data } envelope. `data` may be a bare array or
// a paginated object — handle both.
function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.users ?? []);
}

// GET /users/teachers returns the teaching staff already enriched with the
// `subjects` they teach and the `classes` (with `sections`) they're assigned to.
export async function listTeachers() {
  const { data } = await http.get('/users/teachers');
  return unwrapList(data);
}

export async function createTeacher({ name, email, dateOfBirth }) {
  const { data } = await http.post('/users', { name, email, dateOfBirth, role: 'teacher' });
  return data.data;
}

// Profile edits only — name/email. DOB (initial password) isn't changed here.
export async function updateTeacher(id, { name, email }) {
  const { data } = await http.put(`/users/${id}`, { name, email });
  return data.data;
}

export async function deleteTeacher(id) {
  await http.delete(`/users/${id}`);
}
