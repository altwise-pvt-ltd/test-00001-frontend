import { http } from '../../auth';

// Super-admin only. Schools are the top tenant boundary: the admin creates them,
// assigns a principal, toggles active state, and can seed a school's
// subjects/classes/sections out of band (admin-targeted setup).

function unwrapList(data) {
  const raw = data?.data;
  return Array.isArray(raw) ? raw : (raw?.items ?? raw?.schools ?? []);
}

// GET /schools — every school on the platform.
export async function listSchools() {
  const { data } = await http.get('/schools');
  return unwrapList(data);
}

// GET /schools/:id — a single school (may embed principal/classes/subjects).
export async function getSchool(id) {
  const { data } = await http.get(`/schools/${id}`);
  return data.data;
}

// POST /schools { name, address }.
export async function createSchool(payload) {
  const { data } = await http.post('/schools', payload);
  return data.data;
}

export async function activateSchool(id) {
  const { data } = await http.patch(`/schools/${id}/activate`);
  return data.data;
}

export async function deactivateSchool(id) {
  const { data } = await http.patch(`/schools/${id}/deactivate`);
  return data.data;
}

// PATCH /schools/:id/principal { principalId } — assign (or reassign) the
// school's principal.
export async function assignPrincipal(id, principalId) {
  const { data } = await http.patch(`/schools/${id}/principal`, { principalId });
  return data.data;
}

// DELETE /schools/:id/principal — leave the school without a principal.
export async function unassignPrincipal(id) {
  const { data } = await http.delete(`/schools/${id}/principal`);
  return data.data;
}

// Admin-targeted setup — create resources for a specific school without being
// its principal. Mirrors the principal's /subjects, /classes, /sections.
export async function createSchoolSubject(id, payload) {
  const { data } = await http.post(`/schools/${id}/subjects`, payload);
  return data.data;
}

export async function createSchoolClass(id, payload) {
  const { data } = await http.post(`/schools/${id}/classes`, payload);
  return data.data;
}

export async function createSchoolSection(id, payload) {
  const { data } = await http.post(`/schools/${id}/sections`, payload);
  return data.data;
}
