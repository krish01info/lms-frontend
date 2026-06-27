import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/constants/navigation'

const slides = [
  {
    icon: GraduationCap,
    title: 'Learn Anywhere',
    description: 'Access courses, assignments, and resources from any device, anytime.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: BookOpen,
    title: 'Track Progress',
    description: 'Monitor your academic performance with detailed analytics and insights.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Stay Connected',
    description: 'Collaborate with teachers, parents, and classmates in real-time.',
    color: 'from-emerald-500 to-teal-600',
  },
]

export function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const slide = slides[current]
  const Icon = slide.icon

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1)
    else navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 gradient-mesh">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
          <span className="text-sm font-bold text-white">LF</span>
        </div>
        <span className="text-xl font-bold">{APP_NAME}</span>
      </div>

      <motion.div
        key={current}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className={`mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.color} shadow-xl`}>
          <Icon className="h-16 w-16 text-white" />
        </div>
        <h2 className="mb-4 text-2xl font-bold">{slide.title}</h2>
        <p className="mb-8 text-muted-foreground">{slide.description}</p>
      </motion.div>

      <div className="mb-8 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-primary' : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <Button variant="ghost" onClick={() => navigate('/login')} className="flex-1">
          Skip
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {current < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
    </div>
  )
}
