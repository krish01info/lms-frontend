import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageShell } from '@/components/common/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/services/api'

import axios from 'axios'
import { Upload, Video, ImagePlus, FileText, X, CheckCircle2, Mail, Calendar, BookOpen, Users, Play, Briefcase, Plus, Trash2, Edit3, ArrowLeft, Eye } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  duration: z.string().optional(),
  price: z.string().optional(),
})

const categories = [
  'Mathematics', 'Science', 'Technology', 'Computer Science',
  'Data Science', 'Web Development', 'Mobile Development', 'AI & Machine Learning',
  'Business', 'Marketing', 'Design', 'Photography',
  'Music', 'Language', 'Health & Fitness', 'Personal Development',
  'Engineering', 'Finance', 'Law', 'Other',
]

export function CreateCoursePage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [resourceFiles, setResourceFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStage, setUploadStage] = useState('')

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_VIDEO_SIZE_MB = 500
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video file size must be under ${MAX_VIDEO_SIZE_MB} MB`)
        e.target.value = ''
        return
      }
      setVideoFile(file)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const MAX_THUMBNAIL_SIZE_MB = 5
      if (file.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024) {
        toast.error(`Thumbnail image size must be under ${MAX_THUMBNAIL_SIZE_MB} MB`)
        e.target.value = ''
        return
      }
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files)
      const MAX_RESOURCE_SIZE_MB = 10
      const valid = selected.filter((file) => {
        if (file.size > MAX_RESOURCE_SIZE_MB * 1024 * 1024) {
          toast.error(`Resource "${file.name}" exceeds ${MAX_RESOURCE_SIZE_MB} MB limit`)
          return false
        }
        return true
      })
      setResourceFiles((prev) => [...prev, ...valid])
    }
  }

  const removeResource = (index: number) => {
    setResourceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadToCloudinary = async (file: File, type: 'video' | 'image' | 'raw') => {
    const { data: signRes } = await api.get(`/uploads/sign-cloudinary?type=${type}`)
    const { signature, timestamp, folder } = signRes.data

    // Use backend response first, fallback to frontend env vars
    const cloudName = signRes.data.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey    = signRes.data.apiKey    || import.meta.env.VITE_CLOUDINARY_API_KEY

    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    formData.append('folder', folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`
    const { data: uploadRes } = await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      }
    })
    return uploadRes.secure_url
  }

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)
    let videoUrl = null
    let thumbnailUrl = null

    try {
      // Upload thumbnail if selected (non-blocking — course still creates if this fails)
      if (thumbnailFile) {
        try {
          setUploadStage('Uploading thumbnail...')
          setUploadProgress(0)
          thumbnailUrl = await uploadToCloudinary(thumbnailFile, 'image')
        } catch (uploadErr: any) {
          console.error('Thumbnail upload failed:', uploadErr?.response?.data || uploadErr.message)
          toast.warning('Thumbnail upload failed — course will be created without it.')
        }
      }

      // Upload video if selected (non-blocking — course still creates if this fails)
      if (videoFile) {
        try {
          setUploadStage('Uploading intro video...')
          setUploadProgress(0)
          videoUrl = await uploadToCloudinary(videoFile, 'video')
        } catch (uploadErr: any) {
          console.error('Video upload failed:', uploadErr?.response?.data || uploadErr.message)
          toast.warning('Video upload failed — course will be created without it.')
        }
      }

      // Save course in database
      setUploadStage('Creating course...')
      setUploadProgress(null)

      await api.post('/courses', {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price ? parseFloat(values.price) : 0,
        status: 'PUBLISHED',
        videoUrl,
        thumbnail: thumbnailUrl,
      })

      toast.success('Course created successfully!')
      navigate('/teacher/courses')
    } catch (err: any) {
      console.error('Create course error:', err?.response?.data || err.message)
      toast.error(err.response?.data?.message || err.message || 'Failed to create course.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
      setUploadStage('')
    }

  }

  return (
    <PageShell title="Create Course" description="Design and publish a new course for your students">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Section 1: Basic Info ── */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Course Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input id="title" placeholder="e.g. Introduction to Machine Learning" {...register('title')} className="text-base" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={4} placeholder="Describe what students will learn, prerequisites, and course outline..." {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message as string}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select onValueChange={(v) => setValue('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" placeholder="e.g. 12 weeks" {...register('duration')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" placeholder="0 for free" {...register('price')} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Media Uploads ── */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Media & Resources
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label>Course Thumbnail</Label>
                <label
                  htmlFor="thumbnailUpload"
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="h-28 w-full rounded-xl object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                      <span className="text-xs text-muted-foreground/60">JPG, PNG, WEBP — max 5 MB</span>
                    </>
                  )}
                  <input id="thumbnailUpload" type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <Label>Intro Video</Label>
                <label
                  htmlFor="videoUpload"
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  {videoFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-1" />
                      <span className="text-sm font-medium">{videoFile.name}</span>
                      <span className="block text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <>
                      <Video className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">Click to upload intro video</span>
                      <span className="text-xs text-muted-foreground/60">MP4, MOV, MKV, WEBM — max 100 MB</span>
                    </>
                  )}
                  <input id="videoUpload" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                </label>
              </div>
            </div>

            {/* Resource Uploads */}
            <div className="mt-6 space-y-2">
              <Label>Course Resources (PDFs, Documents, Images)</Label>
              <label
                htmlFor="resourceUpload"
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <Upload className="h-5 w-5 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">Click to attach resource files</span>
                <input id="resourceUpload" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg" multiple className="hidden" onChange={handleResourceChange} />
              </label>
              {resourceFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {resourceFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2">
                      <span className="text-sm truncate">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      <button type="button" onClick={() => removeResource(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Upload Progress ── */}
        {uploadProgress !== null && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{uploadStage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[180px]">
            {isSubmitting ? uploadStage || 'Creating...' : '🚀 Publish Course'}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/teacher/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </PageShell>
  )
}

export function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Edit dialog state
  const [editCourse, setEditCourse] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', status: '' })
  const [isEditing, setIsEditing] = useState(false)

  // Delete dialog state
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Status toggle loading
  const [statusLoading, setStatusLoading] = useState<string | null>(null)

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/my')
      setCourses(data.data.courses || [])
    } catch {
      toast.error('Failed to load courses.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  // ── Open edit dialog pre-filled ──────────────────────────────────────────────
  const openEdit = (course: any) => {
    setEditCourse(course)
    setEditForm({
      title: course.title || '',
      description: course.description || '',
      price: course.price?.toString() || '0',
      status: course.status || 'DRAFT',
    })
  }

  const handleEditSave = async () => {
    if (!editCourse) return
    setIsEditing(true)
    try {
      const { data } = await api.patch(`/courses/${editCourse.id}`, {
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price) || 0,
        status: editForm.status,
      })
      setCourses(prev => prev.map(c => c.id === editCourse.id ? data.data.course : c))
      toast.success('Course updated successfully!')
      setEditCourse(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update course.')
    } finally {
      setIsEditing(false)
    }
  }

  // ── Status toggle (quick publish/archive/draft) ───────────────────────────────
  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setStatusLoading(courseId)
    try {
      const { data } = await api.patch(`/courses/${courseId}/status`, { status: newStatus })
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: data.data.course.status } : c))
      toast.success(`Course marked as ${newStatus.toLowerCase()}.`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setStatusLoading(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCourseId) return
    setIsDeleting(true)
    try {
      await api.delete(`/courses/${deleteCourseId}`)
      setCourses(prev => prev.filter(c => c.id !== deleteCourseId))
      toast.success('Course deleted.')
      setDeleteCourseId(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete course.')
    } finally {
      setIsDeleting(false)
    }
  }

  const statusColors: Record<string, string> = {
    PUBLISHED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    DRAFT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    ARCHIVED: 'bg-muted text-muted-foreground border-border',
  }

  if (isLoading) {
    return (
      <PageShell title="Manage Courses" description="Loading courses...">
        <div className="text-center py-8 text-muted-foreground">Loading your courses...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Manage Courses"
      description="View, edit, publish, or delete your courses"
      actions={<Button onClick={() => navigate('/teacher/create-course')}>+ New Course</Button>}
    >
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground">
            <p className="text-lg font-medium">No courses yet</p>
            <p className="text-sm mt-1">Create your first course to get started.</p>
            <Button className="mt-4" onClick={() => navigate('/teacher/create-course')}>+ Create Course</Button>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-20 w-32 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-32 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-xs">
                      No image
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-base leading-snug">{course.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {course.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColors[course.status] || statusColors.DRAFT}`}>
                            {course.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {course.enrollmentCount || 0} students · {course.lessonCount || 0} lessons
                          </span>
                          {course.price > 0 && (
                            <span className="text-xs font-semibold text-primary">₹{course.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status quick-toggle */}
                        <Select
                          value={course.status}
                          onValueChange={(val) => handleStatusChange(course.id, val)}
                          disabled={statusLoading === course.id}
                        >
                          <SelectTrigger className="h-8 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Lessons button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/courses/${course.id}/lessons`)}
                        >
                          <Play className="h-3.5 w-3.5 mr-1 text-primary" /> Lessons
                        </Button>

                        {/* Edit button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(course)}
                        >
                          Edit
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteCourseId(course.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Course</h2>
              <button onClick={() => setEditCourse(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0 for free"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={val => setEditForm(f => ({ ...f, status: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleEditSave} disabled={isEditing} className="flex-1">
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditCourse(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      {deleteCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-lg font-bold">Delete Course?</h2>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the course and all its lessons. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteCourseId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}


export function TeacherAssignmentsPage() {
  return (
    <PageShell title="Assignments" description="Create and manage assignments" actions={<Button>Create Assignment</Button>}>
      <div className="space-y-3">
        {['Calculus Problem Set #6', 'Python Project Phase 2', 'Literature Review'].map((title, i) => (
          <Card key={i}><CardContent className="flex items-center justify-between p-5">
            <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{[23, 45, 12][i]} submissions pending</p></div>
            <Button variant="outline" size="sm">Grade</Button>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function QuizBuilderPage() {
  return (
    <PageShell title="Quiz Builder" description="Create interactive quizzes" actions={<Button>Create Quiz</Button>}>
      <Card><CardContent className="p-6 space-y-4">
        <div className="space-y-2"><Label>Quiz Title</Label><Input placeholder="Chapter 7 Quiz" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" defaultValue={30} /></div>
          <div className="space-y-2"><Label>Total Questions</Label><Input type="number" defaultValue={20} /></div>
        </div>
        <div className="space-y-2"><Label>Question 1</Label><Input placeholder="Enter question text" /></div>
        {['A', 'B', 'C', 'D'].map((opt) => (
          <div key={opt} className="space-y-2"><Label>Option {opt}</Label><Input placeholder={`Option ${opt}`} /></div>
        ))}
        <Button>Add Question</Button>
      </CardContent></Card>
    </PageShell>
  )
}

export function TeacherAttendancePage() {
  return (
    <PageShell title="Attendance" description="Mark and manage student attendance">
      <Card><CardContent className="p-0">
        <table className="w-full">
          <thead><tr className="border-b"><th className="p-4 text-left text-sm font-medium">Student</th><th className="p-4 text-left text-sm font-medium">Status</th><th className="p-4 text-left text-sm font-medium">Action</th></tr></thead>
          <tbody>
            {['Alex Johnson', 'Emma Davis', 'James Wilson', 'Sarah Kim'].map((name) => (
              <tr key={name} className="border-b"><td className="p-4 text-sm">{name}</td><td className="p-4"><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">Present</span></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function GradebookPage() {
  return (
    <PageShell title="Gradebook" description="View and manage student grades">
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">
            {['Student', 'Assignment 1', 'Assignment 2', 'Quiz 1', 'Average'].map((h) => (
              <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[{ name: 'Alex Johnson', grades: [92, 88, 95, 91.7] }, { name: 'Emma Davis', grades: [85, 90, 82, 85.7] }].map((s) => (
              <tr key={s.name} className="border-b">
                <td className="p-4 text-sm font-medium">{s.name}</td>
                {s.grades.map((g, i) => (<td key={i} className="p-4 text-sm">{typeof g === 'number' ? (i === 3 ? <span className="font-bold text-primary">{g}%</span> : g) : g}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function AnnouncementsPage() {
  return (
    <PageShell title="Announcements" description="Post announcements to your classes" actions={<Button>New Announcement</Button>}>
      <div className="space-y-3">
        {[{ title: 'Mid-term Exam Schedule', date: 'Jun 25', course: 'All Courses' }, { title: 'Lab Session Moved', date: 'Jun 24', course: 'Physics' }].map((a) => (
          <Card key={a.title}><CardContent className="p-5">
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.course} · {a.date}</p>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function PerformancePage() {
  return (
    <PageShell title="Student Performance" description="Analyze student performance metrics">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Class Average</p><p className="text-3xl font-bold">87%</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Top Performer</p><p className="text-xl font-bold">Alex Johnson</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">At Risk</p><p className="text-3xl font-bold text-amber-600">3</p></CardContent></Card>
      </div>
    </PageShell>
  )
}

export { MessagesPage as TeacherMessagesPage } from '@/pages/student/MessagesPage'

export function TeacherAnalyticsPage() {
  return (
    <PageShell title="Analytics" description="Detailed teaching analytics">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-2">Course Completion Rate</p><p className="text-4xl font-bold text-primary">78%</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-2">Avg. Assignment Score</p><p className="text-4xl font-bold text-emerald-600">84%</p></CardContent></Card>
      </div>
    </PageShell>
  )
}

export function TeacherResourcesPage() {
  return (
    <PageShell title="Resources" description="Manage course resources" actions={<Button>Upload Resource</Button>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {['Lecture Slides Ch.7', 'Practice Problems', 'Video Recording'].map((r) => (
          <Card key={r}><CardContent className="p-5 flex justify-between items-center"><span className="font-medium">{r}</span><Button variant="ghost" size="sm">Edit</Button></CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}


export function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, coursesRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/courses/my'),
        ])
        setUser(userRes.data.data.user)
        setMyCourses(coursesRes.data.data.courses || [])
      } catch {
        toast.error('Failed to load profile.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalStudents = myCourses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0)
  const totalLessons  = myCourses.reduce((sum: number, c: any) => sum + (c.lessonCount  || 0), 0)
  const publishedCount = myCourses.filter((c: any) => c.status === 'PUBLISHED').length
  const draftCount     = myCourses.filter((c: any) => c.status === 'DRAFT').length

  if (isLoading) {
    return (
      <PageShell title="My Profile" description="Your instructor profile">
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="My Profile" description="Your instructor profile and teaching overview">

      {/* ── Profile Banner ── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Banner gradient */}
          <div className="h-36 bg-gradient-to-r from-primary/80 via-primary to-violet-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4 -mt-14">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl border-4 border-card shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">{user?.name?.[0] || 'T'}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 border-2 border-card" title="Active" />
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                      INSTRUCTOR
                    </span>
                    <span className="text-sm text-muted-foreground">LearnFlow Academy</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="shrink-0">Edit Profile</Button>
            </div>

            {/* Info row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">Instructor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-xs text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Play className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Total Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Published · {draftCount} Draft</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── My Courses ── */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> My Courses
          </h3>
          {myCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              You haven't created any courses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {myCourses.map((course: any) => (
                <div key={course.id} className="flex items-center gap-4 rounded-2xl border p-4 hover:bg-muted/30 transition-colors">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-12 w-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xs text-muted-foreground">No img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.enrollmentCount || 0} students · {course.lessonCount || 0} lessons
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
                    course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    course.status === 'DRAFT'     ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Teaching Highlights ── */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">Teaching Highlights</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Course Completion Rate', value: '78%', color: 'text-primary' },
              { label: 'Avg. Student Rating',    value: '4.8 ★', color: 'text-amber-500' },
              { label: 'Avg. Assignment Score',  value: '84%',   color: 'text-emerald-600' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted/50 p-5 text-center">
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </PageShell>
  )
}

export function TeacherManageLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    videoUrl: '',
    content: '',
    order: 1,
    isPreview: false,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete Modal state
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/lessons`),
      ])
      setCourse(courseRes.data.data.course)
      setLessons(lessonsRes.data.data.lessons || [])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load lessons.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [courseId])

  const openAddModal = () => {
    setEditingLesson(null)
    setForm({
      title: '',
      description: '',
      type: 'VIDEO',
      videoUrl: '',
      content: '',
      order: lessons.length + 1,
      isPreview: false,
    })
    setVideoFile(null)
    setUploadProgress(null)
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: any) => {
    setEditingLesson(lesson)
    setForm({
      title: lesson.title || '',
      description: lesson.description || '',
      type: lesson.type || 'VIDEO',
      videoUrl: lesson.videoUrl || '',
      content: lesson.content || '',
      order: lesson.order || 1,
      isPreview: !!lesson.isPreview,
    })
    setVideoFile(null)
    setUploadProgress(null)
    setIsModalOpen(true)
  }

  const uploadToCloudinary = async (file: File, type: 'video' | 'image' | 'raw') => {
    const { data: signRes } = await api.get(`/uploads/sign-cloudinary?type=${type}`)
    const { signature, timestamp, folder } = signRes.data

    const cloudName = signRes.data.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey    = signRes.data.apiKey    || import.meta.env.VITE_CLOUDINARY_API_KEY

    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary is not configured.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    formData.append('folder', folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`
    const { data: uploadRes } = await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      }
    })
    return uploadRes.secure_url
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Lesson title is required.')
      return
    }

    setIsSaving(true)
    let finalVideoUrl = form.videoUrl

    try {
      if (form.type === 'VIDEO' && videoFile) {
        setIsUploading(true)
        finalVideoUrl = await uploadToCloudinary(videoFile, 'video')
        setIsUploading(false)
      }

      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        videoUrl: finalVideoUrl,
        content: form.content,
        order: Number(form.order) || 1,
        isPreview: form.isPreview,
      }

      if (editingLesson) {
        const { data } = await api.patch(`/courses/${courseId}/lessons/${editingLesson.id}`, payload)
        setLessons(prev => prev.map(l => l.id === editingLesson.id ? data.data.lesson : l))
        toast.success('Lesson updated successfully!')
      } else {
        const { data } = await api.post(`/courses/${courseId}/lessons`, payload)
        setLessons(prev => [...prev, data.data.lesson])
        toast.success('Lesson created successfully!')
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save lesson.')
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLessonId || !courseId) return
    setIsDeleting(true)
    try {
      await api.delete(`/courses/${courseId}/lessons/${deletingLessonId}`)
      setLessons(prev => prev.filter(l => l.id !== deletingLessonId))
      toast.success('Lesson deleted.')
      setDeletingLessonId(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lesson.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell title="Manage Lessons" description="Loading course content...">
        <div className="text-center py-12 text-muted-foreground">Loading lessons...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={course ? `Manage Lessons: ${course.title}` : 'Manage Lessons'}
      description="Create, reorder, or update lessons for this course"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/teacher/courses')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Courses
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Lesson
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Play className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold">No lessons added yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add video or text lessons to build out your course curriculum for students.
              </p>
              <Button onClick={openAddModal} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Add First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          lessons
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson, index) => (
              <Card key={lesson.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Order badge */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    #{lesson.order || index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{lesson.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium border bg-muted flex items-center gap-1">
                        {lesson.type === 'VIDEO' ? <Video className="h-3 w-3 text-blue-500" /> : <FileText className="h-3 w-3 text-amber-500" />}
                        {lesson.type}
                      </span>
                      {lesson.isPreview && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Free Preview
                        </span>
                      )}
                    </div>

                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                    )}

                    {lesson.videoUrl && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate max-w-md">
                        🎥 {lesson.videoUrl}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(lesson)}>
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingLessonId(lesson.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* ── Add / Edit Lesson Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Lesson Title *</Label>
                <Input
                  required
                  placeholder="e.g. Introduction to Derivatives"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief overview of what students will learn in this lesson..."
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Type & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lesson Type</Label>
                  <Select value={form.type} onValueChange={val => setForm({ ...form, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Lesson</SelectItem>
                      <SelectItem value="TEXT">Text / Article Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Lesson Order (#)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Video upload / URL if type === VIDEO */}
              {form.type === 'VIDEO' && (
                <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-primary" /> Video File or URL
                  </Label>

                  {/* File upload option */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Option 1: Upload Video File</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    />
                    {videoFile && (
                      <p className="text-xs text-emerald-600 font-medium">Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                    )}
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase">or</span>
                    <div className="absolute inset-0 border-t border-border -z-10" />
                  </div>

                  {/* Video URL option */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Option 2: Direct Video URL</span>
                    <Input
                      placeholder="https://res.cloudinary.com/... or https://..."
                      value={form.videoUrl}
                      onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Text content if type === TEXT */}
              {form.type === 'TEXT' && (
                <div className="space-y-1.5">
                  <Label>Lesson Text Content</Label>
                  <Textarea
                    placeholder="Enter full lesson notes or instructions..."
                    rows={6}
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                  />
                </div>
              )}

              {/* Is Preview Switch */}
              <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Free Preview</Label>
                  <p className="text-xs text-muted-foreground">Non-enrolled students can preview this lesson for free</p>
                </div>
                <Switch
                  checked={form.isPreview}
                  onCheckedChange={checked => setForm({ ...form, isPreview: checked })}
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Uploading video to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Modal buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                  {isSaving ? (isUploading ? 'Uploading Video...' : 'Saving...') : (editingLesson ? 'Update Lesson' : 'Create Lesson')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-destructive">Delete Lesson?</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeletingLessonId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}


