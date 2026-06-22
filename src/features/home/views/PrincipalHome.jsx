import { motion } from 'framer-motion';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { fmtDate } from '../../../shared/format';
import { StatusBadge } from '../../../shared/components/Badge';
import { StatCard, ActivityPanel, ListRow, gridVariants } from '../components/dashboardKit';

// One descriptor per countable entity. Order here is the order shown in the grid.
const STAT_META = [
  { key: 'teachers', label: 'Teachers', Icon: SchoolRoundedIcon },
  { key: 'students', label: 'Students', Icon: GroupsRoundedIcon },
  { key: 'classes', label: 'Classes', Icon: ClassRoundedIcon },
  { key: 'sections', label: 'Sections', Icon: ViewModuleRoundedIcon },
  { key: 'subjects', label: 'Subjects', Icon: MenuBookRoundedIcon },
];

// School-wide overview: 5 counts + recent assignments / submissions.
export function PrincipalHome({ home }) {
  const counts = home.counts ?? {};
  const recent = home.recent ?? {};

  return (
    <>
      <motion.section
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {STAT_META.map(({ key, label, Icon }) => (
          <StatCard key={key} label={label} value={counts[key]} Icon={Icon} />
        ))}
      </motion.section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ActivityPanel
          title="Recent Assignments"
          icon={AssignmentRoundedIcon}
          emptyTitle="No recent assignments found"
          emptyHint="New assignments created by teachers will appear here."
          items={recent.assignments}
          renderItem={(a, i) => (
            <ListRow
              key={a.id ?? i}
              primary={a.title || 'Untitled assignment'}
              meta={`${a.sectionName || 'No section'} · ${a.teacherName || 'Unknown teacher'}`}
              trailing={fmtDate(a.createdAt)}
            />
          )}
        />
        <ActivityPanel
          title="Recent Submissions"
          icon={UploadFileRoundedIcon}
          emptyTitle="No recent submissions found"
          emptyHint="Student submissions across your school will show up here."
          items={recent.submissions}
          renderItem={(s, i) => (
            <ListRow
              key={s.id ?? i}
              primary={s.assignmentTitle || 'Untitled assignment'}
              meta={s.studentName || 'Unknown student'}
              trailing={
                <span className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  <span>{fmtDate(s.submittedAt)}</span>
                </span>
              }
            />
          )}
        />
      </div>
    </>
  );
}
