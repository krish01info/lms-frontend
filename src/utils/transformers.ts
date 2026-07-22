// Transforms backend course shape → frontend Course type
export function transformCourse(backendCourse: any) {
  return {
    id: backendCourse.id,
    title: backendCourse.title,
    description: backendCourse.description || '',
    instructor: backendCourse.instructor?.name || 'Unknown Instructor',
    instructorAvatar: backendCourse.instructor?.avatar || 
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    image: backendCourse.thumbnail || 
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    progress: backendCourse.progress || 0,
    modules: backendCourse.lessonCount || 0,
    students: backendCourse.enrollmentCount || 0,
    rating: backendCourse.rating || 0,
    category: backendCourse.category?.name || 'General',
    duration: backendCourse.duration || 'Self-paced',
    status: backendCourse.status === 'PUBLISHED' ? 'active' : 
            backendCourse.status === 'DRAFT' ? 'upcoming' : 'active',
  }
}

// Transforms backend lesson shape → frontend Lesson shape
export function transformLesson(backendLesson: any) {
  return {
    id: backendLesson.id,
    title: backendLesson.title,
    description: backendLesson.description || '',
    type: backendLesson.type || 'VIDEO',
    duration: backendLesson.duration || null,
    order: backendLesson.order ?? 0,
    isPreview: backendLesson.isPreview ?? false,
    videoUrl: backendLesson.videoUrl || null,
    content: backendLesson.content || null,
  }
}

// Transforms backend assignment shape → frontend Assignment shape
// status/mySubmission now come directly from GET /assignments — no more
// client-side pending/overdue guessing based on dueDate.
export function transformAssignment(raw: any) {
  const submission = raw.mySubmission

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    course: raw.course?.title ?? 'Unknown course',
    courseId: raw.courseId,
    dueDate: raw.dueDate,
    status: raw.status, // 'pending' | 'submitted' | 'graded' | 'overdue'
    submissionCount: raw.submissionCount ?? 0,
    grade: submission?.grade ?? null,
    feedback: submission?.feedback ?? null,
    submissionFileUrl: submission?.fileUrl ?? null,
    submittedAt: submission?.createdAt ?? null,
  }
}