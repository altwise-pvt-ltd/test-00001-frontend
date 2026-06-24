import { http } from '../../auth';

// GET /admin/overview — cross-school rollup for the super-admin dashboard
// (platform-wide counts + per-school summary). Shape is read defensively by the
// view, so extra/missing fields degrade gracefully rather than crash.
export async function getOverview() {
  const { data } = await http.get('/admin/overview');
  return data.data;
}
