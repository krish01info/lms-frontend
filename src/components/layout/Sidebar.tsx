import { AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { APP_NAME } from '@/constants/navigation'
import type { NavConfig } from '@/constants/navigation'
import { cn } from '@/utils/cn'

interface SidebarProps {
  navItems: NavConfig[]
  isOpen: boolean
  onClose: () => void
}

function NavLinks({ navItems, onClose }: { navItems: NavConfig[]; onClose?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.href.split('/').length <= 2}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground hover:bg-muted'
            )
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="default" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
              {item.badge}
            </Badge>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar({ navItems, isOpen, onClose }: SidebarProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <span className="text-sm font-bold text-white">LF</span>
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <NavLinks navItems={navItems} onClose={onClose} />
        </ScrollArea>
      </aside>
    </>
  )
}
