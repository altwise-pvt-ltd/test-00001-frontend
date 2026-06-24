import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

// Single source of truth for the sidebar nav and the routes it points at.
// `end` marks routes that should only be active on an exact match (the index).
// `roles` gates an item to specific roles; absent = visible to every role. The
// router enforces the same matrix as a guard — keep the two in sync.
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: DashboardRoundedIcon, end: true },
  { to: '/schools', label: 'Schools', Icon: ApartmentRoundedIcon, roles: ['admin'] },
  { to: '/principals', label: 'Principals', Icon: BadgeRoundedIcon, roles: ['admin'] },
  { to: '/teachers', label: 'Teachers', Icon: SchoolRoundedIcon, roles: ['principal'] },
  { to: '/students', label: 'Students', Icon: GroupsRoundedIcon, roles: ['principal', 'teacher'] },
  { to: '/assignments', label: 'Assignments', Icon: AssignmentRoundedIcon, roles: ['teacher', 'student'] },
  { to: '/classes', label: 'Classes', Icon: ClassRoundedIcon, roles: ['principal'] },
  { to: '/sections', label: 'Sections', Icon: ViewModuleRoundedIcon, roles: ['principal'] },
  { to: '/subjects', label: 'Subjects', Icon: MenuBookRoundedIcon, roles: ['principal'] },
];
