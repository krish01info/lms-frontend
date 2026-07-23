import { useState } from 'react'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/services/api'
import type { Assignment } from '@/types'

interface SubmitAssignmentModalProps {
  assignment: Assignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SubmitAssignmentModal({
  assignment,
  open,
  onOpenChange,
  onSuccess,
}: SubmitAssignmentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setError(null)
    }
  }

  function resetState() {
    setFile(null)
    setProgress(0)
    setIsSubmitting(false)
    setError(null)
  }

  function handleClose(next: boolean) {
    if (!isSubmitting) {
      resetState()
      onOpenChange(next)
    }
  }

  async function handleSubmit() {
    if (!file || !assignment) return

    setIsSubmitting(true)
    setError(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('submission', file)

    try {
      await api.post(`/assignments/${assignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      })
      resetState()
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit assignment. Try again.')
      setIsSubmitting(false)
    }
  }

  if (!assignment) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium">{assignment.title}</p>
            <p className="text-sm text-muted-foreground">{assignment.course}</p>
          </div>

          {!file ? (
            <label
              htmlFor="submission-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-primary/50"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Click to choose a file</span>
              <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, PNG, JPG up to 10MB</span>
              <input
                id="submission-file"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate text-sm">{file.name}</span>
              </div>
              {!isSubmitting && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}