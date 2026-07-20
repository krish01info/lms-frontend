import type { Organization, Branch, BranchAdmin } from '@/types'
import { FolderOpen, GraduationCap, ClipboardCheck, DollarSign } from 'lucide-react'

export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'LearnFlow Global Inc.',
  totalBranches: 12,
  totalUsers: 14500,
  subscriptionPlan: 'Enterprise',
  status: 'active',
  contactEmail: 'contact@learnflow.global',
  contactPhone: '+1 (555) 123-4567',
  createdAt: '2023-01-15T00:00:00Z',
}

export const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'New York Campus',
    location: 'New York, USA',
    adminId: 'admin-1',
    adminName: 'Alice Johnson',
    totalStudents: 1200,
    totalTeachers: 85,
    totalCourses: 45,
    status: 'active',
    lastUpdated: '2024-03-10T10:00:00Z',
  },
  {
    id: 'branch-2',
    name: 'London Campus',
    location: 'London, UK',
    adminId: 'admin-2',
    adminName: 'Bob Smith',
    totalStudents: 850,
    totalTeachers: 60,
    totalCourses: 32,
    status: 'active',
    lastUpdated: '2024-03-11T09:30:00Z',
  },
  {
    id: 'branch-3',
    name: 'Sydney Campus',
    location: 'Sydney, Australia',
    adminId: 'admin-3',
    adminName: 'Charlie Brown',
    totalStudents: 640,
    totalTeachers: 45,
    totalCourses: 28,
    status: 'inactive',
    lastUpdated: '2024-03-01T14:20:00Z',
  },
  {
    id: 'branch-4',
    name: 'Toronto Campus',
    location: 'Toronto, Canada',
    adminId: 'admin-4',
    adminName: 'Diana Prince',
    totalStudents: 920,
    totalTeachers: 70,
    totalCourses: 38,
    status: 'active',
    lastUpdated: '2024-03-12T11:45:00Z',
  }
]

export const mockBranchAdmins: BranchAdmin[] = [
  {
    id: 'admin-1',
    name: 'Alice Johnson',
    email: 'alice.j@learnflow.global',
    role: 'admin',
    assignedBranchId: 'branch-1',
    assignedBranchName: 'New York Campus',
    phone: '+1 555-0101',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=alice',
  },
  {
    id: 'admin-2',
    name: 'Bob Smith',
    email: 'bob.s@learnflow.global',
    role: 'admin',
    assignedBranchId: 'branch-2',
    assignedBranchName: 'London Campus',
    phone: '+44 20-7946-0102',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=bob',
  },
  {
    id: 'admin-3',
    name: 'Charlie Brown',
    email: 'charlie.b@learnflow.global',
    role: 'admin',
    assignedBranchId: 'branch-3',
    assignedBranchName: 'Sydney Campus',
    phone: '+61 2-9876-5432',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?u=charlie',
  },
  {
    id: 'admin-4',
    name: 'Diana Prince',
    email: 'diana.p@learnflow.global',
    role: 'admin',
    assignedBranchId: 'branch-4',
    assignedBranchName: 'Toronto Campus',
    phone: '+1 416-555-0104',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?u=diana',
  }
]

export const superAdminStats = [
  {
    label: 'Total Branches',
    value: '12',
    change: '+2 this year',
    trend: 'up' as const,
    icon: FolderOpen,
  },
  {
    label: 'Total Students',
    value: '14,500',
    change: '+12% from last month',
    trend: 'up' as const,
    icon: GraduationCap,
  },
  {
    label: 'Total Teachers',
    value: '850',
    change: '+5% from last month',
    trend: 'up' as const,
    icon: ClipboardCheck,
  },
  {
    label: 'Total Revenue',
    value: '$2.4M',
    change: '+18% from last year',
    trend: 'up' as const,
    icon: DollarSign,
  },
]

export const studentGrowthData = [
  { name: 'Jan', students: 12000 },
  { name: 'Feb', students: 12500 },
  { name: 'Mar', students: 13100 },
  { name: 'Apr', students: 13800 },
  { name: 'May', students: 14200 },
  { name: 'Jun', students: 14500 },
]

export const branchPerformanceData = [
  { name: 'New York', revenue: 400000, students: 1200 },
  { name: 'London', revenue: 300000, students: 850 },
  { name: 'Toronto', revenue: 350000, students: 920 },
  { name: 'Sydney', revenue: 200000, students: 640 },
]

export const recentActivities = [
  {
    id: 'act-1',
    user: 'Alice Johnson',
    action: 'activated a new course',
    target: 'Advanced React patterns',
    branch: 'New York Campus',
    time: '2 hours ago',
  },
  {
    id: 'act-2',
    user: 'System',
    action: 'generated monthly invoice for',
    target: 'Toronto Campus',
    branch: 'Toronto Campus',
    time: '5 hours ago',
  },
  {
    id: 'act-3',
    user: 'Bob Smith',
    action: 'registered 50 new students at',
    target: 'London Campus',
    branch: 'London Campus',
    time: '1 day ago',
  },
]
