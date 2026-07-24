import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { navigationByRole } from '@/constants/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'

interface DashboardLayoutProps {
  children?: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Called unconditionally (before the early return below) to satisfy the
  // Rules of Hooks — useNotifications is enabled/disabled internally based
  // on auth state, so it's safe to call even before `user` is set.
  const { unreadCount } = useNotifications()

  if (!user) return null

  // Only the Notifications entry's badge is replaced with the real unread
  // count — every other badge (Assignments, Messages, etc.) is left exactly
  // as the static nav config defines it, untouched.
  const navItems = navigationByRole[user.role].map((item) =>
    item.href.endsWith('/notifications') ? { ...item, badge: unreadCount || undefined } : item
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} notificationCount={unreadCount} />
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