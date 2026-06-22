import { motion } from 'framer-motion';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { fmtDate } from '../../../shared/format';
import { Tag } from '../../../shared/components/Badge';
import {
  StatCard,
  ActivityPanel,
  ListRow,
  gridVariants,
  UNCAPPED_LIMIT,
} from '../components/dashboardKit';

// Submitted / not-submitted pill for the upcoming-work list.
function SubmittedBadge({ submitted }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        submitted ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
      }`}
    >
      {submitted ? 'Submitted' : 'Not submitted'}
    </span>
  );
}

// A student's own work: where they sit, their counts, grades, what's due.
export function StudentHome({ home }) {
  const counts = home.counts ?? {};
  const recent = home.recent ?? {};
  const upcoming = Array.isArray(home.upcoming) ? home.upcoming : [];

  // `upcoming` is NOT capped by the backend — render a bounded slice + "+N more".
  const upcomingShown = upcoming.slice(0, UNCAPPED_LIMIT);
  const upcomingMore = upcoming.length - upcomingShown.length;

  return (
    <>
      <motion.section
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard label="Pending" value={counts.pending} Icon={PendingActionsRoundedIcon} />
        <StatCard label="Submitted" value={counts.submitted} Icon={UploadFileRoundedIcon} />
        <StatCard label="Graded" value={counts.graded} Icon={CheckCircleRoundedIcon} />
      </motion.section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* recent.grades items have NO id — key by index. */}
        <ActivityPanel
          title="Recent grades"
          icon={GradeRoundedIcon}
          emptyTitle="No grades yet"
          emptyHint="Grades and feedback from your teachers will appear here."
          items={recent.grades}
          renderItem={(g, i) => (
            <ListRow
              key={i}
              primary={g.assignmentTitle || 'Untitled assignment'}
              meta={g.feedback || 'No feedback'}
              trailing={
                <span className="flex items-center gap-2">
                  <Tag>{g.grade ?? '—'}</Tag>
                  <span>{fmtDate(g.gradedAt)}</span>
                </span>
              }
            />
          )}
        />

        <ActivityPanel
          title="Upcoming work"
          icon={EventRoundedIcon}
          emptyTitle="Nothing due soon"
          emptyHint="Assignments due in the next two weeks will appear here."
          items={upcomingShown}
          footer={upcomingMore > 0 ? `+${upcomingMore} more` : null}
          renderItem={(a, i) => (
            <ListRow
              key={a.assignmentId ?? i}
              primary={a.title || 'Untitled assignment'}
              meta={a.subjectName || 'No subject'}
              trailing={
                <span className="flex items-center gap-2">
                  <SubmittedBadge submitted={!!a.hasSubmitted} />
                  <span>{fmtDate(a.dueDate)}</span>
                </span>
              }
            />
          )}
        />
      </div>
    </>
  );
}
