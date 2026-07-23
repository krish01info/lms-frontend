import type {
  Assignment,
  AttendanceRecord,
  CalendarEvent,
  Conversation,
  Course,
  Payment,
  Quiz,
  QuizQuestion,
  User,
} from '@/types'

export const mockUsers: Record<string, User> = {
  student: {
    id: '1',
    name: 'Prakhar Bhardwaj',
    email: 'prakhar.bhardwaj@learnflow.edu',
    role: 'student',
    avatar: 'https://www.vecteezy.com/vector-art/67721648-anime-student-smiling-cheerfully-with-glasses-and-backpack-flashing-a-peace-sign-on-light-blue-background-perfect-for-showcasing-youthful-energy-and-style',
    grade: '2nd Year',
  },
  teacher: {
    id: '2',
    name: 'Daljeet Dhillon',
    email: 'dljeet.dhilln@learnflow.edu',
    role: 'teacher',
    avatar: 'https://www.google.com/imgres?q=teacher%20pfp%20image&imgurl=https%3A%2F%2Fi.pinimg.com%2F474x%2Ffc%2Ff0%2F63%2Ffcf063d97be8e001f12409bd74615525.jpg&imgrefurl=https%3A%2F%2Fin.pinterest.com%2Fpin%2F507710558006551569%2F&docid=QQYT0-hnffrGSM&tbnid=w_gINUJRj58HAM&vet=12ahUKEwiCz8fmhKWVAxX_UWwGHe5MGucQnPAOegQIGhAB..i&w=398&h=398&hcb=2&itg=1&ved=2ahUKEwiCz8fmhKWVAxX_UWwGHe5MGucQnPAOegQIGhAB',
    department: 'Computer Science',
  },
  parent: {
    id: '3',
    name: ' Kapil Sharma',
    email: 'kapil.sharma@email.com',
    role: 'parent',
    avatar: 'https://visualpharm.com/free-icons/parent%20theme',
    children: ['Prakhar Bhardwaj'],
  },
  admin: {
    id: '4',
    name: 'Kanishk Kaushik',
    email: 'Kanishk Kaushik@learnflow.edu',                              
    role: 'admin',
    avatar: 'https://www.vectorstock.com/royalty-free-vector/admin-icon-isolated-on-white-background-vector-53099435',
  },
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Master calculus, linear algebra, and differential equations with hands-on problem solving and real-world applications.',
    instructor: 'Dr. Sarah Mitchell',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    progress: 72,
    modules: 12,
    students: 156,
    rating: 4.8,
    category: 'Mathematics',
    duration: '16 weeks',
    status: 'active',
  },
  {
    id: '2',
    title: 'DSA: BASICS',
    description: 'Explore classical mechanics, wave phenomena, and thermodynamics through interactive simulations and lab experiments.',
    instructor: 'Prof. James Wilson',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop',
    progress: 45,
    modules: 10,
    students: 134,
    rating: 4.6,
    category: 'Science',
    duration: '14 weeks',
    status: 'active',
  },
  {
    id: '3',
    title: 'Communication Skills',
    description: 'Analyze classic and contemporary literature while developing advanced writing and critical thinking skills.',
    instructor: 'Ms. Rachel Green',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
    progress: 88,
    modules: 8,
    students: 98,
    rating: 4.9,
    category: 'Humanities',
    duration: '12 weeks',
    status: 'active',
  },
  {
    id: '4',
    title: 'Android Development Fundamentals',
    description: 'Learn programming fundamentals, data structures, and algorithms using Python and modern development practices.',
    instructor: 'Dr. Sarah Mitchell',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    progress: 60,
    modules: 14,
    students: 210,
    rating: 4.7,
    category: 'Technology',
    duration: '18 weeks',
    status: 'active',
  },
]

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Calculus Problem Set #5',
    course: 'Advanced Mathematics',
    dueDate: '2026-06-28',
    status: 'pending',
    maxGrade: 100,
    description: 'Complete problems 1-20 from Chapter 7. Show all work and justify your solutions.',
  },
  {
    id: '2',
    title: 'Wave Motion Lab Report',
    course: 'Physics: Mechanics & Waves',
    dueDate: '2026-06-26',
    status: 'submitted',
    maxGrade: 50,
    grade: 45,
    description: 'Write a comprehensive lab report on the wave motion experiment conducted in class.',
    feedback: 'Excellent analysis of wave interference patterns. Minor improvements needed in the conclusion section.',
  },
  {
    id: '3',
    title: 'Essay: Modern Poetry Analysis',
    course: 'English Literature & Composition',
    dueDate: '2026-06-24',
    status: 'graded',
    maxGrade: 100,
    grade: 92,
    description: 'Write a 1500-word essay analyzing themes in contemporary poetry.',
    feedback: 'Outstanding critical analysis with well-supported arguments. Your thesis was compelling.',
  },
  {
    id: '4',
    title: 'Python Data Structures Project',
    course: 'Computer Science Fundamentals',
    dueDate: '2026-06-22',
    status: 'overdue',
    maxGrade: 100,
    description: 'Implement a binary search tree with insert, delete, and search operations.',
  },
]

export const mockQuizzes: Quiz[] = [
  { id: '1', title: 'Integration Techniques', course: 'Advanced Mathematics', questions: 20, duration: 45, status: 'available', maxScore: 100 },
  { id: '2', title: 'Newton\'s Laws Quiz', course: 'Physics: Mechanics & Waves', questions: 15, duration: 30, status: 'completed', score: 88, maxScore: 100 },
  { id: '3', title: 'Shakespeare Analysis', course: 'English Literature & Composition', questions: 10, duration: 20, status: 'completed', score: 95, maxScore: 100 },
  { id: '4', title: 'Algorithms & Complexity', course: 'Computer Science Fundamentals', questions: 25, duration: 60, status: 'locked', maxScore: 100 },
]

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the integral of ∫(2x + 3)dx?',
    options: ['x² + 3x + C', '2x² + 3x + C', 'x² + 3 + C', '2x + C'],
    correctAnswer: 0,
  },
  {
    id: '2',
    question: 'Which method is best for integrating ∫x·eˣ dx?',
    options: ['Substitution', 'Integration by Parts', 'Partial Fractions', 'Trigonometric Substitution'],
    correctAnswer: 1,
  },
  {
    id: '3',
    question: 'The derivative of ln(x) is:',
    options: ['1/x', 'x', 'eˣ', '1/x²'],
    correctAnswer: 0,
  },
]

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', date: '2026-06-25', subject: 'Mathematics', status: 'present' },
  { id: '2', date: '2026-06-25', subject: 'Physics', status: 'present' },
  { id: '3', date: '2026-06-24', subject: 'English', status: 'late' },
  { id: '4', date: '2026-06-24', subject: 'Computer Science', status: 'present' },
  { id: '5', date: '2026-06-23', subject: 'Mathematics', status: 'present' },
  { id: '6', date: '2026-06-23', subject: 'Physics', status: 'absent' },
  { id: '7', date: '2026-06-22', subject: 'English', status: 'present' },
  { id: '8', date: '2026-06-22', subject: 'Computer Science', status: 'present' },
]

export const mockCalendarEvents: CalendarEvent[] = [
  { id: '1', title: 'Mathematics Class', date: '2026-06-25', time: '09:00 AM', type: 'class', color: '#2563eb' },
  { id: '2', title: 'Physics Lab', date: '2026-06-25', time: '11:00 AM', type: 'class', color: '#4f46e5' },
  { id: '3', title: 'Calculus Quiz', date: '2026-06-26', time: '10:00 AM', type: 'exam', color: '#ef4444' },
  { id: '4', title: 'Essay Due', date: '2026-06-28', time: '11:59 PM', type: 'deadline', color: '#f59e0b' },
  { id: '5', title: 'Science Fair', date: '2026-06-30', time: '02:00 PM', type: 'event', color: '#10b981' },
  { id: '6', title: 'English Class', date: '2026-06-27', time: '09:00 AM', type: 'class', color: '#8b5cf6' },
]

export const mockPayments: Payment[] = [
  { id: '1', title: 'Semester Tuition Fee', amount: 25000, dueDate: '2026-06-30', status: 'pending' },
  { id: '2', title: 'Lab Equipment Fee', amount: 3500, dueDate: '2026-06-15', status: 'paid' },
  { id: '3', title: 'Library Membership', amount: 1500, dueDate: '2026-05-01', status: 'paid' },
  { id: '4', title: 'Sports Activity Fee', amount: 2000, dueDate: '2026-06-10', status: 'overdue' },
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participantName: 'Dr. Sarah Mitchell',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    participantRole: 'teacher',
    lastMessage: 'Great work on your last assignment!',
    lastMessageTime: '10:30 AM',
    unread: 2,
    online: true,
    messages: [
      { id: '1', senderId: '2', senderName: 'Dr. Sarah Mitchell', content: 'Hi Alex, I reviewed your calculus submission.', timestamp: '10:00 AM', read: true },
      { id: '2', senderId: '2', senderName: 'Dr. Sarah Mitchell', content: 'Great work on your last assignment!', timestamp: '10:30 AM', read: false },
    ],
  },
  {
    id: '2',
    participantName: 'Prof. James Wilson',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    participantRole: 'teacher',
    lastMessage: 'The lab report deadline has been extended.',
    lastMessageTime: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: '1', senderId: '5', senderName: 'Prof. James Wilson', content: 'The lab report deadline has been extended.', timestamp: 'Yesterday', read: true },
    ],
  },
]

export const weeklyProgressData = [
  { name: 'Mon', hours: 3.5, assignments: 2 },
  { name: 'Tue', hours: 4.2, assignments: 1 },
  { name: 'Wed', hours: 2.8, assignments: 3 },
  { name: 'Thu', hours: 5.1, assignments: 2 },
  { name: 'Fri', hours: 3.9, assignments: 1 },
  { name: 'Sat', hours: 6.2, assignments: 4 },
  { name: 'Sun', hours: 4.5, assignments: 2 },
]

export const subjectScores = [
  { subject: 'Mathematics', score: 88, fullMark: 100 },
  { subject: 'Physics', score: 82, fullMark: 100 },
  { subject: 'English', score: 95, fullMark: 100 },
  { subject: 'Computer Science', score: 90, fullMark: 100 },
]

export const attendanceBySubject = [
  { subject: 'Mathematics', percentage: 94 },
  { subject: 'Physics', percentage: 88 },
  { subject: 'English', percentage: 96 },
  { subject: 'Computer Science', percentage: 92 },
]

export const platformStats = {
  totalUsers: 12450,
  activeCourses: 342,
  totalRevenue: 2450000,
  completionRate: 78,
}
