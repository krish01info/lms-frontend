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