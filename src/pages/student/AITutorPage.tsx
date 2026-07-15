import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Bot,
  Brain,
  Clock,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
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

type TutorMessage = {
  id: string
  role: 'student' | 'tutor'
  content: string
  timestamp: string
}

const subjects = ['Mathematics', 'Science', 'English', 'History']

const suggestedPrompts = [
  'Explain quadratic equations with an example',
  'Quiz me on today\'s science topic',
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
        <p className="leading-relaxed">{message.content}</p>
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
  const [activeSubject, setActiveSubject] = useState(subjects[0])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<TutorMessage[]>(initialMessages)
  const [isThinking, setIsThinking] = useState(false)

  const greeting = useMemo(() => {
    const firstName = user?.name?.split(' ')[0] || 'there'
    return `Personalized help for ${firstName}'s lessons`
  }, [user?.name])

  const sendMessage = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isThinking) return

    const studentMessage: TutorMessage = {
      id: `student-${Date.now()}`,
      role: 'student',
      content: trimmed,
      timestamp: 'Now',
    }

    setMessages((current) => [...current, studentMessage])
    setMessage('')
    setIsThinking(true)

    window.setTimeout(() => {
      const tutorMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        content: `Great question. For ${activeSubject}, I would start by identifying the key idea, then work through one example, and finally test your understanding with a short practice question. Backend AI responses can replace this placeholder later.`,
        timestamp: 'Now',
      }
      setMessages((current) => [...current, tutorMessage])
      setIsThinking(false)
    }, 700)
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Study Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/60',
                    activeSubject === subject && 'border-primary/40 bg-primary/10 text-primary'
                  )}
                >
                  <span className="font-medium">{subject}</span>
                  {activeSubject === subject && <Sparkles className="h-4 w-4" />}
                </button>
              ))}
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
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-2xl px-3 py-2 text-left text-sm"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Button>
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
                  <p className="text-xs text-muted-foreground">{activeSubject} mode</p>
                </div>
              </div>
              <Badge variant="outline">Preview</Badge>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((item) => (
                  <TutorMessageBubble key={item.id} message={item} />
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
