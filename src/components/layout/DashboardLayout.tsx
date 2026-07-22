import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { navigationByRole } from '@/constants/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUnreadCount } from '@/hooks/useNotificationData'

interface DashboardLayoutProps {
  children?: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Called unconditionally (before the early return below) to satisfy the
  // Rules of Hooks — /notifications/me safely 401s if there's no user yet,
  // react-query just treats it as an errored, ignorable query in that case.
  const { data: unreadData } = useUnreadCount()

  if (!user) return null

  const navItems = navigationByRole[user.role]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} notificationCount={unreadData?.count ?? 0} />
        <main className="flex-1 overflow-auto gradient-mesh p-4 pb-24 lg:p-6 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children ?? <Outlet />}
          </motion.div>
        </main>
        <BottomNav role={user.role} />
      </div>
    </div>
  )
}
