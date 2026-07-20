import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Bot,
  Brain,
  Check,
  Clock,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'
import api from '@/services/api'
import { toast } from 'sonner'

type TutorMessage = {
  id: string
  role: 'student' | 'tutor'
  content: string
  timestamp: string
}

interface AIDocument {
  id: string
  title: string
  originalName: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  createdAt: string
}

const suggestedPrompts = [
  'Explain deep learning',
  "Quiz me on today's science topic",
  'Summarize my lesson in simple points',
  'Help me plan a 30-minute study session',
]

const studyTools = [
  { title: 'Explain', description: 'Break down tough concepts', icon: Lightbulb },
  { title: 'Practice', description: 'Generate quick questions', icon: Brain },
  { title: 'Review', description: 'Summarize lesson notes', icon: BookOpen },
]

const initialMessages: TutorMessage[] = [
  {
    id: 'welcome',
    role: 'tutor',
    content:
      'Hi! I am your AI Tutor. Ask me about a topic, request a practice quiz, or paste a confusing paragraph and I will help you work through it step by step.',
    timestamp: 'Now',
  },
]

function TutorMessageBubble({ message }: { message: TutorMessage }) {
  const isStudent = message.role === 'student'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isStudent ? 'justify-end' : 'justify-start')}
    >
      {!isStudent && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-3 text-sm sm:max-w-[70%]',
          isStudent
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-muted'
        )}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'mt-2 text-[10px]',
            isStudent ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {message.timestamp}
        </p>
      </div>
      {isStudent && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}

export function AITutorPage() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<TutorMessage[]>(initialMessages)
  const [isThinking, setIsThinking] = useState(false)

  // AI Knowledge Base state
  const [documents, setDocuments] = useState<AIDocument[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const greeting = useMemo(() => {
    const firstName = user?.name?.split(' ')[0] || 'there'
    return `Personalized help for ${firstName}'s lessons`
  }, [user?.name])

  // Fetch documents from backend on mount
  const fetchDocuments = async (silent = false) => {
    if (!silent) setIsLoadingDocs(true)
    try {
      const { data } = await api.get('/ai-tutor/documents')
      const docList: AIDocument[] = data.data?.documents || []
      setDocuments(docList)
      
      // Auto-select newly uploaded or ready documents if nothing is selected
      setSelectedDocIds((prevSelected) => {
        const readyIds = docList.filter((d) => d.status === 'READY').map((d) => d.id)
        if (prevSelected.length === 0) {
          return readyIds
        }
        // Filter out any selected IDs that no longer exist
        return prevSelected.filter((id) => docList.some((d) => d.id === id))
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch learning materials')
    } finally {
      setIsLoadingDocs(false)
    }
  }

  useEffect(() => {
    fetchDocuments()

    // Poll document indexing status if any document is processing
    const interval = setInterval(() => {
      setDocuments((currentDocs) => {
        const hasProcessing = currentDocs.some((doc) => doc.status === 'PROCESSING')
        if (hasProcessing) {
          fetchDocuments(true)
        }
        return currentDocs
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported for AI tutoring')
      return
    }

    const formData = new FormData()
    formData.append('pdf', file)

    setIsUploading(true)
    try {
      await api.post('/ai-tutor/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('Document uploaded successfully! Indexing has started.')
      await fetchDocuments()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setIsUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  const handleDeleteDocument = async (id: string) => {
    setIsDeleting(id)
    try {
      await api.delete(`/ai-tutor/documents/${id}`)
      toast.success('Document deleted successfully')
      setSelectedDocIds((prev) => prev.filter((docId) => docId !== id))
      await fetchDocuments()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document')
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    )
  }

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isThinking) return

    const studentMessage: TutorMessage = {
      id: `student-${Date.now()}`,
      role: 'student',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((current) => [...current, studentMessage])
    setMessage('')
    setIsThinking(true)

    try {
      // Backend throws 400 if no documents are uploaded
      const readyDocs = documents.filter((d) => d.status === 'READY')
      if (readyDocs.length === 0) {
        setIsThinking(false)
        const noDocsMessage: TutorMessage = {
          id: `tutor-${Date.now()}`,
          role: 'tutor',
          content: 'Please upload at least one PDF study document in the **Knowledge Base** panel on the left so I have source material to tutor you on!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((current) => [...current, noDocsMessage])
        return
      }

      // Filter selections to only ready documents
      const activeSelections = selectedDocIds.filter((id) =>
        readyDocs.some((d) => d.id === id)
      )

      const { data } = await api.post('/ai-tutor/chat', {
        question: trimmed,
        documentIds: activeSelections.length > 0 ? activeSelections : undefined,
      })

      const responseData = data.data
      let finalContent = responseData.answer

      // Append source references cleanly if they exist
      if (responseData.sources && responseData.sources.length > 0) {
        finalContent += '\n\n**Sources Referenced:**'
        responseData.sources.forEach((src: any, index: number) => {
          const pageStr = src.page ? ` (page ${src.page})` : ''
          finalContent += `\n${index + 1}. *${src.title}*${pageStr} — *${src.snippet.trim()}...*`
        })
      }

      const tutorMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: finalContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((current) => [...current, tutorMessage])
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to get AI Tutor response.'
      toast.error(errMsg)
      const errorTutorMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: `Sorry, I encountered an error connecting to the AI backend:\n\n*${errMsg}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((current) => [...current, errorTutorMessage])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Tutor" description={greeting}>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Student support
        </Badge>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          {/* Knowledge Base Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Knowledge Base
                </span>
                {isLoadingDocs && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Upload PDFs for your lessons. The AI Tutor will base its answers strictly on selected documents.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Uploader */}
              <div className="relative">
                <input
                  type="file"
                  id="pdf-upload"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="pdf-upload"
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-xs font-semibold text-foreground transition-all hover:bg-muted/50 hover:border-primary/40',
                    isUploading && 'pointer-events-none opacity-50'
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>Uploading & Indexing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span>Upload Study PDF</span>
                    </>
                  )}
                </label>
              </div>

              {/* Documents List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {documents.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    No documents uploaded yet.
                  </p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        'group flex items-center justify-between rounded-xl border border-border p-2.5 transition-colors hover:bg-muted/20',
                        selectedDocIds.includes(doc.id) && doc.status === 'READY' && 'border-primary/40 bg-primary/5'
                      )}
                    >
                      <button
                        onClick={() => toggleDocSelection(doc.id)}
                        className="flex flex-1 items-center gap-2.5 text-left disabled:cursor-not-allowed"
                        disabled={doc.status !== 'READY'}
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input transition-colors',
                            selectedDocIds.includes(doc.id) && doc.status === 'READY' && 'border-primary bg-primary text-primary-foreground'
                          )}
                        >
                          {selectedDocIds.includes(doc.id) && doc.status === 'READY' && (
                            <Check className="h-3 w-3 stroke-[3px]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground pr-1">
                            {doc.title}
                          </p>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            {doc.status === 'READY' && (
                              <span className="text-green-600 font-semibold">Ready</span>
                            )}
                            {doc.status === 'PROCESSING' && (
                              <span className="text-amber-600 animate-pulse flex items-center gap-1">
                                <Loader2 className="h-2 w-2 animate-spin" /> Indexing
                              </span>
                            )}
                            {doc.status === 'FAILED' && (
                              <span className="text-red-500 font-semibold">Failed</span>
                            )}
                          </div>
                        </div>
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={isDeleting === doc.id}
                      >
                        {isDeleting === doc.id ? (
                          <Loader2 className="h-3 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tutor Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studyTools.map((tool) => (
                <div key={tool.title} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tool.title}</p>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Quick Prompts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start with one tap, then refine your question in chat.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  onClick={() => sendMessage(prompt)}
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="flex h-[calc(100vh-220px)] min-h-[560px] overflow-hidden">
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="gradient-primary text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">LearnLMS Tutor</p>
                  <p className="text-xs text-muted-foreground">Learning assistant</p>
                </div>
              </div>
              <Badge variant="outline">Live</Badge>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 font-sans">
                {messages.map((item) => (
                  <TutorMessageBubble key={item.id} message={item} />
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin animate-duration-1000" />
                    Tutor is thinking...
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendMessage(message)
                    }
                  }}
                  placeholder="Ask a question or paste a lesson topic..."
                  className="min-h-11 flex-1 resize-none rounded-2xl bg-card"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-2xl"
                  disabled={!message.trim() || isThinking}
                  onClick={() => sendMessage(message)}
                >
                  {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
