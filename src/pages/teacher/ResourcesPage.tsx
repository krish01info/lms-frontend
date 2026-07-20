import { useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, File, FileArchive, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyCourses } from '@/hooks/useCourseData'
import { useDeleteResource, useUploadResources } from '@/hooks/useResourceData'
// import { getResources } from '@/services/resources.api'
import { getResources } from '../../services/resources.api'
//
import type { ApiResource } from '@/types'

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip'
const MAX_FILES = 10
const MAX_FILE_MB = 10

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIconFor(fileType: string) {
  if (fileType.startsWith('image/')) return ImageIcon
  if (fileType === 'application/zip' || fileType === 'application/x-zip-compressed') return FileArchive
  if (fileType === 'application/pdf' || fileType.includes('word')) return FileText
  return File
}

export function TeacherResourcesPage() {
  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  // No "all my resources" endpoint exists — same fan-out pattern as
  // Quiz Builder: one request per owned course, run in parallel.
  const resourceQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['resources', course.id],
      queryFn: () => getResources(course.id),
      enabled: courses.length > 0,
    })),
  })

  const uploadResources = useUploadResources()
  const deleteResource = useDeleteResource()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCourseId, setUploadCourseId] = useState<string>('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const [deleteTarget, setDeleteTarget] = useState<{ courseId: string; resource: ApiResource } | null>(null)

  if (coursesQuery.isLoading) {
    return (
      <PageShell title="Resources" description="Course materials for your students">
        <PageSkeleton />
      </PageShell>
    )
  }

  if (coursesQuery.isError) {
    return (
      <PageShell title="Resources" description="Course materials for your students">
        <ErrorState message="Could not load your courses. Please try again." onRetry={() => coursesQuery.refetch()} />
      </PageShell>
    )
  }

  const openUploadDialog = () => {
    setUploadCourseId(courses[0]?.id ?? '')
    setPendingFiles([])
    setUploadOpen(true)
  }

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (picked.length === 0) return

    if (picked.length > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} files at once.`)
      return
    }
    const tooBig = picked.find((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) {
      toast.error(`"${tooBig.name}" is over ${MAX_FILE_MB} MB.`)
      return
    }
    setPendingFiles(picked)
  }

  const submitUpload = () => {
    if (!uploadCourseId) {
      toast.error('Select a course first.')
      return
    }
    if (pendingFiles.length === 0) {
      toast.error('Choose at least one file to upload.')
      return
    }
    uploadResources.mutate(
      { courseId: uploadCourseId, files: pendingFiles },
      {
        onSuccess: (uploaded) => {
          toast.success(`${uploaded.length} file${uploaded.length === 1 ? '' : 's'} uploaded!`)
          setUploadOpen(false)
          setPendingFiles([])
        },
        onError: () => toast.error('Upload failed. Please check file types/sizes and try again.'),
      }
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteResource.mutate(
      { courseId: deleteTarget.courseId, resourceId: deleteTarget.resource.id },
      {
        onSuccess: () => {
          toast.success('Resource deleted.')
          setDeleteTarget(null)
        },
        onError: () => toast.error('Could not delete the resource.'),
      }
    )
  }

  const anyLoading = resourceQueries.some((q) => q.isLoading)
  const anyError = resourceQueries.some((q) => q.isError)
  const totalResources = resourceQueries.reduce((sum, q) => sum + (q.data?.length ?? 0), 0)

  return (
    <PageShell
      title="Resources"
      description="Course materials for your students"
      actions={
        <Button onClick={openUploadDialog} disabled={courses.length === 0}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Resource
        </Button>
      }
    >
      {courses.length === 0 ? (
        <EmptyState icon={File} title="Create a course first" description="Resources are attached to a course — create one before uploading files." />
      ) : anyLoading ? (
        <PageSkeleton />
      ) : anyError ? (
        <ErrorState message="Could not load resources for some courses. Please try again." />
      ) : totalResources === 0 ? (
        <EmptyState icon={File} title="No resources yet" description="Upload lecture slides, PDFs, or other materials for your students." />
      ) : (
        <div className="space-y-6">
          {courses.map((course, i) => {
            const resources = resourceQueries[i]?.data ?? []
            if (resources.length === 0) return null
            return (
              <div key={course.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <Badge variant="secondary">{resources.length} file{resources.length === 1 ? '' : 's'}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.map((resource) => {
                    const Icon = fileIconFor(resource.fileType)
                    return (
                      <Card key={resource.id}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium" title={resource.title}>{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(resource.fileSize)}</p>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Download">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ courseId: course.id, resource })}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>PDF, DOC, DOCX, PNG, JPEG, or ZIP — up to {MAX_FILE_MB} MB each, {MAX_FILES} files max.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={uploadCourseId} onValueChange={setUploadCourseId}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Files</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {pendingFiles.length > 0 ? `${pendingFiles.length} file(s) selected` : 'Choose files'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFilePick}
              />
              {pendingFiles.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {pendingFiles.map((f) => (
                    <li key={f.name} className="truncate">{f.name} · {formatBytes(f.size)}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={submitUpload} disabled={uploadResources.isPending}>
                {uploadResources.isPending ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete resource?</DialogTitle>
            <DialogDescription>
              {deleteTarget && `"${deleteTarget.resource.title}" will be permanently removed. This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteResource.isPending}>
              {deleteResource.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
