import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../features/home'
import { LoginPage } from '../features/auth'
import { ClassesPage } from '../features/classes'
import { TeachersPage } from '../features/teachers'
import { StudentsPage } from '../features/students'
import { SectionsPage } from '../features/sections'
import { SubjectsPage } from '../features/subjects'
import { AssignmentsPage } from '../features/assignments'
import { SchoolsPage } from '../features/schools'
import { PrincipalsPage } from '../features/principals'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'
import { DashboardLayout } from './layout/DashboardLayout'

// Central route table. Authenticated pages render inside DashboardLayout
// (top bar + sidebar + <Outlet/>) behind the ProtectedRoute guard. Add new
// feature pages as children; keep guards and layout chrome at this layer.
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'schools',
        element: (
          <ProtectedRoute roles={['admin']}>
            <SchoolsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'principals',
        element: (
          <ProtectedRoute roles={['admin']}>
            <PrincipalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'teachers',
        element: (
          <ProtectedRoute roles={['principal']}>
            <TeachersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'students',
        element: (
          <ProtectedRoute roles={['principal', 'teacher']}>
            <StudentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assignments',
        element: (
          <ProtectedRoute roles={['teacher', 'student']}>
            <AssignmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'classes',
        element: (
          <ProtectedRoute roles={['principal']}>
            <ClassesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sections',
        element: (
          <ProtectedRoute roles={['principal']}>
            <SectionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'subjects',
        element: (
          <ProtectedRoute roles={['principal']}>
            <SubjectsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
