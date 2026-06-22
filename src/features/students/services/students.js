import { http } from '../../auth';

// Mongo uses _id; some endpoints (e.g. /auth/me) return `id`. Normalise.
export const userId = (u) => u?._id ?? u?.id;

function toStudents(data) {
  const raw = data?.data;
  const list = Array.isArray(raw) ? raw : (raw?.items ?? raw?.users ?? []);
  return list.filter((u) => u.role === 'student');
}

// Students are users with role=student. Pass ?role=student as a hint and still
// filter client-side so it's correct whether or not the API honours it.
export async function listStudents() {
  const { data } = await http.get('/users', { params: { role: 'student' } });
  return toStudents(data);
}

// Students additionally require a placement: BOTH classId and sectionId. The
// backend validates that the section actually belongs to the class.
export async function createStudent({ name, email, dateOfBirth, classId, sectionId }) {
  const { data } = await http.post('/users', { name, email, dateOfBirth, classId, sectionId, role: 'student' });
  return data.data;
}

// Profile edits only — name/email. DOB (initial password) and placement aren't
// changed here.
export async function updateStudent(id, { name, email }) {
  const { data } = await http.put(`/users/${id}`, { name, email });
  return data.data;
}

export async function deleteStudent(id) {
  await http.delete(`/users/${id}`);
}
