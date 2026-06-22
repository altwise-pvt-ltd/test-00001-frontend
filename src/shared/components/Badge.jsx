// Neutral pill for tags/labels (subject codes, types, section names, …).
export function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-social-bg px-2.5 py-0.5 text-xs font-medium text-text/70">
      {children}
    </span>
  );
}

// Submission/assignment status pill. Enum: pending | submitted | graded.
const STATUS_CLS = {
  pending: 'bg-amber-500/10 text-amber-600',
  submitted: 'bg-blue-500/10 text-blue-600',
  graded: 'bg-green-500/10 text-green-600',
};

export function StatusBadge({ status }) {
  const cls = STATUS_CLS[status] ?? 'bg-social-bg text-text/60';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status ?? '—'}
    </span>
  );
}
