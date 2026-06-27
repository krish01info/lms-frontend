import { motion } from 'framer-motion'
import { Award, Download, ExternalLink, GraduationCap, Star } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockCourses } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'

const certificates = [
  {
    id: '1',
    title: 'Shakespeare Analysis Quiz',
    course: 'English Literature & Composition',
    issuedDate: '2026-06-20',
    score: 95,
    credentialId: 'CERT-ENG-2026-001',
    status: 'issued' as const,
  },
  {
    id: '2',
    title: 'Newton\'s Laws Quiz',
    course: 'Physics: Mechanics & Waves',
    issuedDate: '2026-06-15',
    score: 88,
    credentialId: 'CERT-PHY-2026-002',
    status: 'issued' as const,
  },
  {
    id: '3',
    title: 'Advanced Mathematics',
    course: 'Advanced Mathematics',
    issuedDate: null,
    score: null,
    credentialId: null,
    status: 'in-progress' as const,
    progress: 72,
  },
  {
    id: '4',
    title: 'Computer Science Fundamentals',
    course: 'Computer Science Fundamentals',
    issuedDate: null,
    score: null,
    credentialId: null,
    status: 'in-progress' as const,
    progress: 60,
  },
]

export function CertificatesPage() {
  const { user } = useAuth()
  const earned = certificates.filter((c) => c.status === 'issued').length

  return (
    <div className="space-y-6">
      <PageHeader title="Certificates" description="Your earned credentials and achievements">
        <Badge variant="success" className="gap-1">
          <Award className="h-3.5 w-3.5" />
          {earned} earned
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cert.status === 'issued' ? 'border-emerald-500/20' : ''}>
              <CardContent className="p-0">
                {cert.status === 'issued' ? (
                  <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/90 to-secondary p-6 text-white">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
                    <div className="relative flex items-start justify-between">
                      <GraduationCap className="h-10 w-10 text-white/80" />
                      <Badge className="bg-white/20 text-white border-0">Verified</Badge>
                    </div>
                    <h3 className="relative mt-4 text-lg font-bold">{cert.title}</h3>
                    <p className="relative text-sm text-white/80">{cert.course}</p>
                    <div className="relative mt-4 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                      Score: {cert.score}%
                    </div>
                  </div>
                ) : (
                  <div className="rounded-t-2xl bg-muted/50 p-6">
                    <div className="flex items-center justify-between">
                      <GraduationCap className="h-10 w-10 text-muted-foreground" />
                      <Badge variant="warning">In Progress</Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground">{cert.course}</p>
                    <p className="mt-2 text-sm font-medium">{cert.progress}% complete</p>
                  </div>
                )}

                <div className="space-y-3 p-6">
                  {cert.status === 'issued' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Issued to</span>
                        <span className="font-medium">{user?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{cert.issuedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Credential ID</span>
                        <span className="font-mono text-xs">{cert.credentialId}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1 gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Complete the course to earn your certificate. You&apos;re {cert.progress}% of the way there!
                      </p>
                      <Button variant="outline" className="w-full" disabled>
                        Complete course to unlock
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">More certificates available</p>
            <p className="text-sm text-muted-foreground">
              Complete {mockCourses.length - earned} more courses to unlock additional credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
