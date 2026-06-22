import { motion } from 'framer-motion';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import GradingRoundedIcon from '@mui/icons-material/GradingRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
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

// A teacher's teaching world: what they grade, what they teach, what's due.
export function TeacherHome({ home }) {
  const counts = home.counts ?? {};
  const recent = home.recent ?? {};
  const teaching = Array.isArray(home.teaching) ? home.teaching : [];
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <StatCard label="Assignments created" value={counts.assignmentsCreated} Icon={AssignmentRoundedIcon} />
        <StatCard label="To grade" value={counts.submissionsToGrade} Icon={GradingRoundedIcon} />
      </motion.section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Oldest-waiting first — preserve backend order, do NOT re-sort. */}
        <ActivityPanel
          title="Grading queue"
          icon={GradingRoundedIcon}
          emptyTitle="Nothing waiting to grade"
          emptyHint="Submissions awaiting your grade will appear here, oldest first."
          items={recent.submissionsToGrade}
          renderItem={(s, i) => (
            <ListRow
              key={s.id ?? i}
              primary={s.assignmentTitle || 'Untitled assignment'}
              meta={s.studentName || 'Unknown student'}
              trailing={fmtDate(s.submittedAt)}
            />
          )}
        />

        <ActivityPanel
          title="What you teach"
          icon={MenuBookRoundedIcon}
          emptyTitle="No teaching assignments yet"
          emptyHint="Subjects and sections assigned to you will be listed here."
          items={teaching}
          renderItem={(t, i) => (
            <ListRow
              key={t.teachingAssignmentId ?? i}
              primary={t.subjectName || 'Untitled subject'}
              meta={`${t.className || 'No class'} · ${t.sectionName || 'No section'}`}
            />
          )}
        />

        <ActivityPanel
          title="Upcoming"
          icon={EventRoundedIcon}
          emptyTitle="Nothing due soon"
          emptyHint="Assignments due in the next two weeks will appear here."
          items={upcomingShown}
          footer={upcomingMore > 0 ? `+${upcomingMore} more` : null}
          renderItem={(a, i) => (
            <ListRow
              key={a.assignmentId ?? i}
              primary={a.title || 'Untitled assignment'}
              meta={a.sectionName ? <Tag>{a.sectionName}</Tag> : 'No section'}
              trailing={fmtDate(a.dueDate)}
            />
          )}
        />
      </div>
    </>
  );
}
