import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { mockUsers } from '@/constants/mockData'
import { roleDashboardPaths } from '@/constants/navigation'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = 'learnflow_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, _password: string, role: UserRole = 'student') => {
    await new Promise((r) => setTimeout(r, 800))
    const mockUser = { ...mockUsers[role], email }
    setUser(mockUser)
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser))
  }

  const register = async (name: string, email: string, _password: string, role: UserRole) => {
    await new Promise((r) => setTimeout(r, 800))
    const newUser: User = { ...mockUsers[role], name, email }
    setUser(newUser)
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }

  const switchRole = (role: UserRole) => {
    const mockUser = mockUsers[role]
    setUser(mockUser)
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function getDashboardPath(role: UserRole) {
  return roleDashboardPaths[role]
}
