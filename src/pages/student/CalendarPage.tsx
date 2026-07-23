import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockCalendarEvents } from '@/constants/mockData'
import { cn } from '@/utils/cn'

const eventTypeLabels = {
  class: 'Class',
  exam: 'Exam',
  deadline: 'Deadline',
  event: 'Event',
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 5, 25))

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return mockCalendarEvents.filter((e) => isSameDay(parseISO(e.date), selectedDate))
  }, [selectedDate])

  const upcomingEvents = mockCalendarEvents
    .map((e) => ({ ...e, parsed: parseISO(e.date) }))
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime())

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="View your classes, exams, and deadlines" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = mockCalendarEvents.filter((e) =>
                  isSameDay(parseISO(e.date), day)
                )
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date(2026, 5, 25))

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative flex min-h-[72px] flex-col items-center rounded-xl p-1 text-sm transition-colors hover:bg-muted/50',
                      !isSameMonth(day, currentMonth) && 'text-muted-foreground/40',
                      isSelected && 'bg-primary/10 ring-2 ring-primary/30',
                      isToday && !isSelected && 'bg-muted'
                    )}
                  >
                    <span className={cn('mb-1 font-medium', isToday && 'text-primary')}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
              {Object.entries(eventTypeLabels).map(([type, label]) => {
                const color = mockCalendarEvents.find((e) => e.type === type)?.color ?? '#2563eb'
                return (
                  <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events on this day.</p>
              ) : (
                selectedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-border p-3"
                  >
                    <div className="mt-1 h-8 w-1 rounded-full" style={{ backgroundColor: event.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        {eventTypeLabels[event.type]}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-[10px] font-bold text-white"
                    style={{ backgroundColor: event.color }}
                  >
                    <span>{format(event.parsed, 'MMM')}</span>
                    <span className="text-sm">{format(event.parsed, 'd')}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
