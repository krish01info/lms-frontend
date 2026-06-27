import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
  href?: string
}

export function CourseCard({ course, href }: CourseCardProps) {
  const content = (
    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-3 left-3" variant="secondary">
          {course.category}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1">{course.title}</h3>
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={course.instructorAvatar}
            alt={course.instructor}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-sm text-muted-foreground">{course.instructor}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.students}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} />
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Link to={href}>{content}</Link>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      {content}
    </motion.div>
  )
}
