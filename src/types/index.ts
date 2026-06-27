export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  grade?: string
  department?: string
  children?: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar?: string
  image: string
  progress: number
  modules: number
  students: number
  rating: number
  category: string
  duration: string
  status: 'active' | 'completed' | 'upcoming'
}

export interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded' | 'overdue'
  grade?: number
  maxGrade: number
  description: string
  feedback?: string
}

export interface Quiz {
  id: string
  title: string
  course: string
  questions: number
  duration: number
  status: 'available' | 'completed' | 'locked'
  score?: number
  maxScore: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface AttendanceRecord {
  id: string
  date: string
  subject: string
  status: 'present' | 'absent' | 'late' | 'leave'
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'class' | 'exam' | 'deadline' | 'event'
  color: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'assignment' | 'quiz' | 'announcement' | 'payment' | 'message'
  read: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participantName: string
  participantAvatar?: string
  participantRole: UserRole
  lastMessage: string
  lastMessageTime: string
  unread: number
  online: boolean
  messages: Message[]
}

export interface Payment {
  id: string
  title: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  invoiceUrl?: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

export interface StatCard {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: string
}

export interface ChartDataPoint {
  name: string
  value?: number
  [key: string]: string | number | undefined
}
