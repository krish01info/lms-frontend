import { Building2, Mail, Phone, Users, FolderOpen, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockOrganization } from '@/constants/superAdminMockData'
import { format } from 'date-fns'

export function OrganizationPage() {
  const { name, totalBranches, totalUsers, subscriptionPlan, status, contactEmail, contactPhone, createdAt } = mockOrganization

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
          <p className="text-muted-foreground">Manage global organization settings and view summary</p>
        </div>
        <Button>Edit Organization</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">{name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                  {status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm">Since {format(new Date(createdAt), 'MMM yyyy')}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Total Branches
              </p>
              <p className="text-2xl font-bold">{totalBranches}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Users
              </p>
              <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact Email
              </p>
              <p className="font-medium">{contactEmail}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact Phone
              </p>
              <p className="font-medium">{contactPhone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{subscriptionPlan} Plan</span>
                <Badge>Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlimited access to all features, priority support, and advanced analytics.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Manage Billing
            </Button>
            <Button variant="outline" className="w-full">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
