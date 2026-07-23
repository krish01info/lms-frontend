import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { MessageSquare, Pin, Plus, ThumbsUp } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockCourses } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

const discussionThreads = [
  {
    id: '1',
    title: 'Help with Integration by Parts',
    course: 'Advanced Mathematics',
    author: 'Alex Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Can someone explain when to use integration by parts vs substitution for ∫x·eˣ dx?',
    replies: 8,
    likes: 12,
    pinned: true,
    createdAt: '2026-06-25T10:30:00',
    tags: ['calculus', 'help'],
  },
  {
    id: '2',
    title: 'Wave Interference Lab Discussion',
    course: 'Physics: Mechanics & Waves',
    author: 'Maria Garcia',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'What were your observations on the double-slit experiment? My results showed unexpected patterns.',
    replies: 5,
    likes: 7,
    pinned: false,
    createdAt: '2026-06-24T14:15:00',
    tags: ['lab', 'waves'],
  },
  {
    id: '3',
    title: 'Modern Poetry Essay Tips',
    course: 'English Literature & Composition',
    author: 'James Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'Looking for advice on structuring a comparative analysis essay. What framework works best?',
    replies: 11,
    likes: 15,
    pinned: false,
    createdAt: '2026-06-23T09:00:00',
    tags: ['essay', 'writing'],
  },
  {
    id: '4',
    title: 'BST Implementation Best Practices',
    course: 'Computer Science Fundamentals',
    author: 'Dr. Sarah Mitchell',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: 'Share your approach to implementing delete operations in a binary search tree. Consider edge cases!',
    replies: 14,
    likes: 22,
    pinned: true,
    createdAt: '2026-06-22T16:45:00',
    tags: ['algorithms', 'project'],
  },
]

export function DiscussionPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [newThread, setNewThread] = useState('')

  const courses = ['All', ...mockCourses.map((c) => c.title)]

  const filtered = discussionThreads.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(search.toLowerCase()) ||
      thread.content.toLowerCase().includes(search.toLowerCase())
    const matchesCourse = courseFilter === 'All' || thread.course === courseFilter
    return matchesSearch && matchesCourse
  })

  const sorted = [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <div className="space-y-6">
      <PageHeader title="Discussion" description="Collaborate with peers and instructors">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          placeholder="Search discussions..."
          value={search}
          onChange={setSearch}
          className="lg:max-w-sm"
        />
        <Tabs value={courseFilter} onValueChange={setCourseFilter}>
          <TabsList className="h-auto max-w-full flex-wrap">
            {courses.slice(0, 4).map((course) => (
              <TabsTrigger key={course} value={course} className="text-xs">
                {course === 'All' ? 'All' : course.split(' ').slice(0, 2).join(' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="flex gap-3 p-4">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Start a new discussion..."
            value={newThread}
            onChange={(e) => setNewThread(e.target.value)}
            className="flex-1"
          />
          <Button disabled={!newThread.trim()}>Post</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sorted.map((thread, i) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn('transition-shadow hover:shadow-md cursor-pointer', thread.pinned && 'border-primary/30')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={thread.authorAvatar} />
                    <AvatarFallback>{thread.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {thread.pinned && (
                        <Badge variant="accent" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <Badge variant="secondary">{thread.course.split(' ').slice(0, 2).join(' ')}</Badge>
                    </div>
                    <h3 className="mt-2 font-semibold">{thread.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{thread.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>{thread.author}</span>
                      <span>{formatDistanceToNow(parseISO(thread.createdAt), { addSuffix: true })}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {thread.replies} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {thread.likes}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {thread.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
