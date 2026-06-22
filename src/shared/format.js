// Small shared formatting helpers used across detail views.

// ISO 8601 → "19 Jun 2026" (locale-aware). Returns an em dash for empty/invalid.
export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// "Alan Turing" → "AT". Falls back to "?" when empty.
export function initials(name = '') {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}
