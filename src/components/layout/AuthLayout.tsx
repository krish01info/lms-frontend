import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { APP_NAME } from '@/constants/navigation'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <span className="text-2xl font-bold">LF</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Transform Your Learning Journey
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              {APP_NAME} empowers students, teachers, and parents with a seamless, modern learning experience.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 gradient-mesh">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <span className="text-sm font-bold text-white">LF</span>
              </div>
              <span className="text-xl font-bold">{APP_NAME}</span>
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
