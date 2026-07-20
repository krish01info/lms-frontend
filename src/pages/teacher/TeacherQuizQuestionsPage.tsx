import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuiz, useQuizQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '@/hooks/useQuizData'
import type { ApiQuestionFull } from '@/types'

const questionSchema = z
  .object({
    text: z.string().trim().min(1, 'Question text is required'),
    options: z
      .array(z.object({ value: z.string().trim().min(1, 'Option cannot be empty') }))
      .min(2, 'At least 2 options are required'),
    answer: z.string().min(1, 'Select the correct answer'),
    order: z.string().min(1),
  })
  .refine((data) => data.options.some((o) => o.value === data.answer), {
    message: 'The correct answer must match one of the options',
    path: ['answer'],
  })
type QuestionFormValues = z.infer<typeof questionSchema>

export function TeacherQuizQuestionsPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ApiQuestionFull | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const quizQuery = useQuiz(quizId)
  const questionsQuery = useQuizQuestions(quizId)
  // Instructor role always gets the full shape (answer included) from this endpoint.
  const questions = ((questionsQuery.data ?? []) as ApiQuestionFull[]).slice().sort((a, b) => a.order - b.order)

  const createQuestion = useCreateQuestion(quizId!)
  const updateQuestion = useUpdateQuestion(quizId!)
  const deleteQuestion = useDeleteQuestion(quizId!)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: '', options: [{ value: '' }, { value: '' }], answer: '', order: '1' },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const optionValues = watch('options')
  const currentAnswer = watch('answer')

  const openCreateDialog = () => {
    setEditing(null)
    reset({ text: '', options: [{ value: '' }, { value: '' }], answer: '', order: String(questions.length + 1) })
    setDialogOpen(true)
  }

  const openPreview = () => {
    setPreviewIndex(0)
    setPreviewOpen(true)
  }

  const openEditDialog = (question: ApiQuestionFull) => {
    setEditing(question)
    reset({
      text: question.text,
      options: question.options.map((value) => ({ value })),
      answer: question.answer,
      order: String(question.order),
    })
    setDialogOpen(true)
  }

  // If the answer's option gets edited/removed mid-form, don't leave a stale answer selected.
  useEffect(() => {
    if (currentAnswer && !optionValues.some((o) => o.value === currentAnswer)) {
      setValue('answer', '')
    }
  }, [optionValues, currentAnswer, setValue])

  const onSubmit = (values: QuestionFormValues) => {
    const payload = {
      text: values.text,
      options: values.options.map((o) => o.value),
      answer: values.answer,
      order: Number(values.order),
    }

    const onSuccess = () => {
      toast.success(editing ? 'Question updated.' : 'Question added.')
      setDialogOpen(false)
      setEditing(null)
    }
    const onError = () => toast.error('Could not save the question. Please check the details and try again.')

    if (editing) {
      updateQuestion.mutate({ questionId: editing.id, payload }, { onSuccess, onError })
    } else {
      createQuestion.mutate(payload, { onSuccess, onError })
    }
  }

  const handleDelete = (question: ApiQuestionFull) => {
    if (!window.confirm(`Delete this question? This can't be undone.`)) return
    deleteQuestion.mutate(question.id, {
      onSuccess: () => toast.success('Question deleted.'),
      onError: () => toast.error('Could not delete the question.'),
    })
  }

  if (quizQuery.isLoading || questionsQuery.isLoading) return <PageSkeleton />

  if (quizQuery.isError || questionsQuery.isError || !quizQuery.data) {
    return (
      <ErrorState
        title="Couldn't load this quiz"
        message="Something went wrong fetching this quiz's questions. Please go back and try again."
      />
    )
  }

  const quiz = quizQuery.data
  const isSaving = createQuestion.isPending || updateQuestion.isPending

  return (
    <div className="space-y-6">
      <Link to="/teacher/quiz-builder" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Quiz Builder
      </Link>

      <PageHeader
        title={quiz.title}
        description={`${quiz.course.title} · ${quiz.timeLimit ? `${quiz.timeLimit} min` : 'Untimed'} · Pass at ${quiz.passMark}%`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={openPreview}
            disabled={questions.length === 0}
            title={questions.length === 0 ? 'Add a question first' : 'Preview as a student would see it'}
          >
            <Eye className="h-4 w-4" /> Preview
          </Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setEditing(null)
          }}
        >
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Question' : 'Add Question'}</DialogTitle>
              <DialogDescription>
                Add at least 2 options and mark which one is correct.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input placeholder="What is the capital of France?" {...register('text')} />
                {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {fields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input placeholder={`Option ${i + 1}`} {...register(`options.${i}.value` as const)} />
                    {fields.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove option">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {errors.options && (
                  <p className="text-xs text-destructive">
                    {errors.options.message || errors.options.root?.message || 'Check your options'}
                  </p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Option
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select value={currentAnswer || undefined} onValueChange={(v) => setValue('answer', v, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionValues
                        .map((o) => o.value)
                        .filter((v) => v.trim().length > 0)
                        .map((v, i) => (
                          <SelectItem key={`${v}-${i}`} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input type="number" min={1} {...register('order')} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Add Question'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </PageHeader>

      {questions.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No questions yet"
          description="Add your first question so students have something to answer."
          actionLabel="Add Question"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{q.order}</Badge>
                      <p className="font-medium">
                        {i + 1}. {q.text}
                      </p>
                    </div>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {q.options.map((option, oi) => (
                        <div
                          key={oi}
                          className={
                            option === q.answer
                              ? 'flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-400'
                              : 'flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-muted-foreground'
                          }
                        >
                          {option === q.answer && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)} aria-label="Edit question">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(q)}
                      disabled={deleteQuestion.isPending}
                      aria-label="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Preview</DialogTitle>
            <DialogDescription>
              This is exactly how students will see each question — no answers shown.
            </DialogDescription>
          </DialogHeader>

          {questions.length > 0 && (
            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setPreviewIndex(i)}
                    className={
                      i === previewIndex
                        ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-medium text-white'
                        : 'flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-sm font-medium text-muted-foreground'
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-2 text-sm text-muted-foreground">
                    Question {previewIndex + 1} of {questions.length}
                  </div>
                  <h3 className="mb-6 text-lg font-semibold">{questions[previewIndex].text}</h3>
                  <div className="space-y-3">
                    {questions[previewIndex].options.map((option, i) => (
                      <div
                        key={i}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-medium">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  disabled={previewIndex === questions.length - 1}
                  onClick={() => setPreviewIndex((i) => Math.min(questions.length - 1, i + 1))}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
