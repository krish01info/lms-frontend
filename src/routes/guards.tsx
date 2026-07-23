import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageSkeleton } from '@/components/common/Skeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <PageSkeleton />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

export function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return null

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return <Outlet />
}
