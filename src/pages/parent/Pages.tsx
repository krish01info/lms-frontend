export { PerformancePage as ParentPerformancePage } from '@/pages/teacher/Pages'
export { AttendancePage as ParentAttendancePage } from '@/pages/student/AttendancePage'
export { AssignmentsPage as ParentAssignmentsPage } from '@/pages/student/AssignmentsPage'
export { PaymentsPage as ParentPaymentsPage } from '@/pages/student/PaymentsPage'
export { MessagesPage as ParentMessagesPage } from '@/pages/student/MessagesPage'
export { ProgressPage as ParentProgressPage } from '@/pages/student/ProgressPage'
export { NotificationsPage as ParentNotificationsPage } from '@/pages/student/NotificationsPage'
export { CalendarPage as ParentCalendarPage } from '@/pages/student/CalendarPage'
export { ProfilePage as ParentProfilePage } from '@/pages/student/ProfilePage'

import { PageShell } from '@/components/common/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download } from 'lucide-react'

export function ReportsPage() {
  return (
    <PageShell title="Reports" description="Download academic reports for your child">
      <div className="grid gap-4 sm:grid-cols-2">
        {['Semester Report Card', 'Attendance Report', 'Fee Statement', 'Progress Report'].map((report) => (
          <Card key={report} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-5">
              <span className="font-medium">{report}</span>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
