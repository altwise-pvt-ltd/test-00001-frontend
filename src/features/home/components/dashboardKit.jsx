// Shared presentational pieces for the role-aware dashboard. Extracted from the
// original principal-only HomePage so all three role views (principal / teacher
// / student) render with one consistent visual language + motion.
import { motion } from 'framer-motion';

// Framer Motion stagger: the grid orchestrates, each card springs in.
export const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

// A single headline number with an icon. `value` is rendered defensively:
// null/undefined/0 dims the figure rather than crashing or showing blank.
export function StatCard({ label, value, Icon }) {
  const isZero = !value;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-bg/60 p-5 shadow-card transition-colors hover:border-accent-border"
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-bg text-accent"
        >
          <Icon fontSize="small" />
        </span>
      </div>
      <p
        className={`mt-4 text-4xl font-semibold tabular-nums ${
          isZero ? 'text-text/40' : 'text-text-h'
        }`}
      >
        {value ?? 0}
      </p>
      <p className="mt-1 text-sm text-text/70">{label}</p>
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-social-bg text-text/50"
      >
        <Icon />
      </span>
      <p className="text-sm font-medium text-text-h">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-text/60">{hint}</p>}
    </div>
  );
}

// A list panel: heading + the items (or an empty state). `footer` renders a
// small note below the list — used for the "+N more" cap on uncapped backend
// lists so a large payload never blows out the layout.
export function ActivityPanel({ title, icon, emptyTitle, emptyHint, items, renderItem, footer }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <section className="rounded-xl border border-border bg-bg/60 p-5 shadow-card">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-h">{title}</h2>
      {hasItems ? (
        <>
          <ul className="space-y-2">{items.map(renderItem)}</ul>
          {footer && <p className="mt-3 text-center text-xs text-text/50">{footer}</p>}
        </>
      ) : (
        <EmptyState icon={icon} title={emptyTitle} hint={emptyHint} />
      )}
    </section>
  );
}

// Generic row used inside ActivityPanel: a primary line, an optional muted meta
// line, and an optional trailing slot (date / status badge). Truncates so long
// titles don't break the row.
export function ListRow({ primary, meta, trailing }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-border bg-bg/40 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-h">{primary}</p>
        {meta != null && meta !== '' && <p className="mt-0.5 truncate text-xs text-text/60">{meta}</p>}
      </div>
      {trailing != null && (
        <div className="shrink-0 whitespace-nowrap text-xs text-text/60">{trailing}</div>
      )}
    </li>
  );
}

// How many uncapped-list items to render before collapsing to "+N more".
export const UNCAPPED_LIMIT = 8;
