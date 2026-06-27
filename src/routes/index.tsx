import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ProtectedRoute, PublicRoute } from './guards'

// Auth
import { SplashPage } from '@/pages/auth/SplashPage'
import { OnboardingPage } from '@/pages/auth/OnboardingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { OtpPage } from '@/pages/auth/OtpPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

// Student
import { StudentDashboard } from '@/pages/student/Dashboard'
import { CoursesPage } from '@/pages/student/CoursesPage'
import { CourseDetailPage } from '@/pages/student/CourseDetailPage'
import { AssignmentsPage } from '@/pages/student/AssignmentsPage'
import { QuizzesPage } from '@/pages/student/QuizzesPage'
import { QuizTakePage } from '@/pages/student/QuizTakePage'
import { AttendancePage } from '@/pages/student/AttendancePage'
import { CalendarPage } from '@/pages/student/CalendarPage'
import { FeesPage } from '@/pages/student/FeesPage'
import { PaymentsPage } from '@/pages/student/PaymentsPage'
import { ResultsPage } from '@/pages/student/ResultsPage'
import { ProgressPage } from '@/pages/student/ProgressPage'
import { DiscussionPage } from '@/pages/student/DiscussionPage'
import { ResourcesPage } from '@/pages/student/ResourcesPage'
import { CertificatesPage } from '@/pages/student/CertificatesPage'
import { MessagesPage } from '@/pages/student/MessagesPage'
import { NotificationsPage } from '@/pages/student/NotificationsPage'
import { ProfilePage } from '@/pages/student/ProfilePage'
import { SettingsPage } from '@/pages/student/SettingsPage'

// Teacher
import { TeacherDashboard } from '@/pages/teacher/Dashboard'
import {
  CreateCoursePage,
  TeacherCoursesPage,
  TeacherAssignmentsPage,
  QuizBuilderPage,
  TeacherAttendancePage,
  GradebookPage,
  AnnouncementsPage,
  PerformancePage,
  TeacherMessagesPage,
  TeacherAnalyticsPage,
  TeacherResourcesPage,
  TeacherProfilePage,
} from '@/pages/teacher/Pages'

// Parent
import { ParentDashboard } from '@/pages/parent/Dashboard'
import {
  ParentPerformancePage,
  ParentAttendancePage,
  ParentAssignmentsPage,
  ParentPaymentsPage,
  ParentMessagesPage,
  ParentProgressPage,
  ParentNotificationsPage,
  ParentCalendarPage,
  ReportsPage as ParentReportsPage,
  ParentProfilePage,
} from '@/pages/parent/Pages'

// Admin
import { AdminDashboard } from '@/pages/admin/Dashboard'
import {
  UsersPage,
  AdminCoursesPage,
  AdminPaymentsPage,
  ReportsPage as AdminReportsPage,
  AnalyticsPage,
  RolesPage,
  SettingsPage as AdminSettingsPage,
  AuditLogsPage,
} from '@/pages/admin/Pages'

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  { path: '/', element: <SplashPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/otp-verification', element: <OtpPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      { path: '/student', element: withSuspense(<StudentDashboard />) },
      { path: '/student/courses', element: withSuspense(<CoursesPage />) },
      { path: '/student/courses/:id', element: withSuspense(<CourseDetailPage />) },
      { path: '/student/assignments', element: withSuspense(<AssignmentsPage />) },
      { path: '/student/quizzes', element: withSuspense(<QuizzesPage />) },
      { path: '/student/quizzes/take', element: withSuspense(<QuizTakePage />) },
      { path: '/student/attendance', element: withSuspense(<AttendancePage />) },
      { path: '/student/calendar', element: withSuspense(<CalendarPage />) },
      { path: '/student/fees', element: withSuspense(<FeesPage />) },
      { path: '/student/payments', element: withSuspense(<PaymentsPage />) },
      { path: '/student/results', element: withSuspense(<ResultsPage />) },
      { path: '/student/progress', element: withSuspense(<ProgressPage />) },
      { path: '/student/discussion', element: withSuspense(<DiscussionPage />) },
      { path: '/student/resources', element: withSuspense(<ResourcesPage />) },
      { path: '/student/certificates', element: withSuspense(<CertificatesPage />) },
      { path: '/student/messages', element: withSuspense(<MessagesPage />) },
      { path: '/student/notifications', element: withSuspense(<NotificationsPage />) },
      { path: '/student/profile', element: withSuspense(<ProfilePage />) },
      { path: '/student/settings', element: withSuspense(<SettingsPage />) },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['teacher']} />,
    children: [
      { path: '/teacher', element: withSuspense(<TeacherDashboard />) },
      { path: '/teacher/create-course', element: withSuspense(<CreateCoursePage />) },
      { path: '/teacher/courses', element: withSuspense(<TeacherCoursesPage />) },
      { path: '/teacher/assignments', element: withSuspense(<TeacherAssignmentsPage />) },
      { path: '/teacher/quiz-builder', element: withSuspense(<QuizBuilderPage />) },
      { path: '/teacher/attendance', element: withSuspense(<TeacherAttendancePage />) },
      { path: '/teacher/gradebook', element: withSuspense(<GradebookPage />) },
      { path: '/teacher/announcements', element: withSuspense(<AnnouncementsPage />) },
      { path: '/teacher/performance', element: withSuspense(<PerformancePage />) },
      { path: '/teacher/messages', element: withSuspense(<TeacherMessagesPage />) },
      { path: '/teacher/analytics', element: withSuspense(<TeacherAnalyticsPage />) },
      { path: '/teacher/resources', element: withSuspense(<TeacherResourcesPage />) },
      { path: '/teacher/profile', element: withSuspense(<TeacherProfilePage />) },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['parent']} />,
    children: [
      { path: '/parent', element: withSuspense(<ParentDashboard />) },
      { path: '/parent/performance', element: withSuspense(<ParentPerformancePage />) },
      { path: '/parent/attendance', element: withSuspense(<ParentAttendancePage />) },
      { path: '/parent/assignments', element: withSuspense(<ParentAssignmentsPage />) },
      { path: '/parent/payments', element: withSuspense(<ParentPaymentsPage />) },
      { path: '/parent/messages', element: withSuspense(<ParentMessagesPage />) },
      { path: '/parent/progress', element: withSuspense(<ParentProgressPage />) },
      { path: '/parent/notifications', element: withSuspense(<ParentNotificationsPage />) },
      { path: '/parent/calendar', element: withSuspense(<ParentCalendarPage />) },
      { path: '/parent/reports', element: withSuspense(<ParentReportsPage />) },
      { path: '/parent/profile', element: withSuspense(<ParentProfilePage />) },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      { path: '/admin', element: withSuspense(<AdminDashboard />) },
      { path: '/admin/users', element: withSuspense(<UsersPage />) },
      { path: '/admin/courses', element: withSuspense(<AdminCoursesPage />) },
      { path: '/admin/payments', element: withSuspense(<AdminPaymentsPage />) },
      { path: '/admin/reports', element: withSuspense(<AdminReportsPage />) },
      { path: '/admin/analytics', element: withSuspense(<AnalyticsPage />) },
      { path: '/admin/roles', element: withSuspense(<RolesPage />) },
      { path: '/admin/settings', element: withSuspense(<AdminSettingsPage />) },
      { path: '/admin/audit-logs', element: withSuspense(<AuditLogsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
