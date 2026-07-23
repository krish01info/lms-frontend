import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Smile, Paperclip } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockConversations } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

export function MessagesPage() {
  const { user } = useAuth()
  const [activeId, setActiveId] = useState(mockConversations[0].id)
  const [message, setMessage] = useState('')
  const [typing] = useState(false)
  const active = mockConversations.find((c) => c.id === activeId)!

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description="Chat with teachers and classmates" />
      <Card className="flex h-[calc(100vh-220px)] overflow-hidden">
        <div className="hidden w-80 border-r border-border md:block">
          <ScrollArea className="h-full">
            {mockConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                  activeId === conv.id && 'bg-muted'
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conv.participantAvatar} />
                    <AvatarFallback>{conv.participantName[0]}</AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conv.participantName}</p>
                    <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <Badge className="h-5 min-w-5 justify-center px-1">{conv.unread}</Badge>}
              </button>
            ))}
          </ScrollArea>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Avatar>
              <AvatarImage src={active.participantAvatar} />
              <AvatarFallback>{active.participantName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{active.participantName}</p>
              <p className="text-xs text-muted-foreground">
                {active.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {active.messages.map((msg) => {
                const isMe = msg.senderId === user?.id
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                      isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              {typing && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </span>
                  typing...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
