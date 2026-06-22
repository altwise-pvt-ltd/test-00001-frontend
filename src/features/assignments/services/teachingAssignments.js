import { http } from '../../auth';

function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.teachingAssignments ?? []);
}

// GET /teaching-assignments — the authority join "teacher T teaches subject S to
// section X". Listing is open to any authenticated user; filter with
// { teacherId } (a teacher's own) or { sectionId } (a student's section). The
// response populates teacherId (name/email), subjectId (name/code), sectionId
// (name) — used to label assignments with their subject + section.
export async function listTeachingAssignments(params = {}) {
  const { data } = await http.get('/teaching-assignments', { params });
  return unwrapList(data);
}
