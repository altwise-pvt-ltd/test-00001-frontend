// Public API of the shared `users` feature (cross-cutting user concerns
// reused by the teachers and students pages).
export { TeacherDetailModal } from './components/TeacherDetailModal'
export { StudentDetailModal } from './components/StudentDetailModal'
export { getTeacherDetail, getStudentDetail, userId } from './services/users'
