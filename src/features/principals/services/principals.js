import { http } from '../../auth';

// Super-admin only. Principals are created at the platform level (school null)
// and then assigned to a school via the schools feature.

function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.principals ?? []);
}

// GET /principals — every principal on the platform.
export async function listPrincipals() {
  const { data } = await http.get('/principals');
  return unwrapList(data);
}

// POST /principals { name, email, password }. Unlike DOB-derived teacher/student
// passwords, an admin sets the principal's password explicitly here.
export async function createPrincipal(payload) {
  const { data } = await http.post('/principals', payload);
  return data.data;
}
