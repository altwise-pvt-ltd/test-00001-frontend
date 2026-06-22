// A titled block inside a detail modal. Shows a count in the heading and an
// "empty" hint when there's nothing to render. Keeps the rich detail modals
// (teacher / student / class) consistent and uncluttered.
export function DetailSection({ title, count, empty = 'None yet', children }) {
  const isEmpty = count === 0;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text/50">
        {title}
        {typeof count === 'number' ? ` (${count})` : ''}
      </h3>
      {isEmpty ? <p className="text-sm text-text/50">{empty}</p> : children}
    </section>
  );
}
