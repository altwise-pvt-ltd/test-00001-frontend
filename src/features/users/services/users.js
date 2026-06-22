import { http } from '../../auth';

// Mongo uses _id; some endpoints (e.g. /auth/me) return `id`. Normalise.
export const userId = (u) => u?._id ?? u?.id;

// Teacher + everything they teach/created (subjects, sections, teaching
// assignments, assignments). GET /users/teachers/:id — any logged-in user.
export async function getTeacherDetail(id) {
  const { data } = await http.get(`/users/teachers/${id}`);
  return data.data;
}

// Student + placement + coursework (subjects with teachers, the section's
// worklist with this student's state folded in, submissions).
// GET /users/students/:id — any logged-in user.
export async function getStudentDetail(id) {
  const { data } = await http.get(`/users/students/${id}`);
  return data.data;
}

// Replace a teacher's full set of subject×section teaching assignments.
// Send the COMPLETE desired set ([] clears all) — it's a replace, not a delta.
// Principal only. Returns the refreshed teacher detail (same shape as
// getTeacherDetail). PUT /users/teachers/:id/teaching.
export async function setTeacherTeaching(id, teachingAssignments) {
  const { data } = await http.put(`/users/teachers/${id}/teaching`, { teachingAssignments });
  return data.data;
}
