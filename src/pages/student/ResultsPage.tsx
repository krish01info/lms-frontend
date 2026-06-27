import { motion } from 'framer-motion'
import { Award, Download, Medal, TrendingUp, Trophy } from 'lucide-react'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { subjectScores } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'

const chartData = subjectScores.map((s) => ({
  name: s.subject,
  value: s.score,
}))

const gradeBreakdown = [
  { grade: 'A', count: 2, color: 'bg-emerald-500' },
  { grade: 'A-', count: 1, color: 'bg-emerald-400' },
  { grade: 'B+', count: 1, color: 'bg-blue-500' },
]

export function ResultsPage() {
  const { user } = useAuth()
  const gpa = 3.85
  const classRank = 12
  const totalStudents = 156
  const percentile = Math.round(((totalStudents - classRank) / totalStudents) * 100)

  return (
    <div className="space-y-6">
      <PageHeader title="Results" description="View your academic performance and rankings">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download Report Card
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current GPA" value={gpa.toFixed(2)} change="Top 15% of class" trend="up" icon={Award} />
        <StatCard label="Class Rank" value={`#${classRank}`} change={`of ${totalStudents} students`} icon={Medal} iconClassName="bg-amber-500/10" />
        <StatCard label="Percentile" value={`${percentile}th`} trend="up" icon={TrendingUp} />
        <StatCard label="Honors" value="Dean's List" icon={Trophy} iconClassName="bg-secondary/10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gradeBreakdown.map((item) => (
              <div key={item.grade} className="flex items-center gap-3">
                <Badge variant="outline" className="w-10 justify-center">{item.grade}</Badge>
                <div className="flex-1">
                  <Progress value={(item.count / 4) * 100} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{item.count} subjects</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ChartCard title="Subject Scores" data={chartData} type="bar" dataKey="value" xKey="name" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectScores.map((subject, i) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl border border-border p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                  {subject.subject[0]}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="font-bold">{subject.score}/{subject.fullMark}</span>
                  </div>
                  <Progress value={subject.score} />
                </div>
                <Badge variant={subject.score >= 90 ? 'success' : subject.score >= 80 ? 'secondary' : 'warning'}>
                  {subject.score >= 90 ? 'A' : subject.score >= 80 ? 'B+' : 'B'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-primary text-white">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Congratulations, {user?.name?.split(' ')[0]}!</h3>
            <p className="text-white/80">
              You&apos;re ranked #{classRank} in your class with a GPA of {gpa}. Keep up the excellent work!
            </p>
          </div>
          <Button variant="glass" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
