import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, Clock, CreditCard, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utils/cn'
import api from '@/services/api'

const statusConfig = {
  PAID: { label: 'Paid', variant: 'success' as const, icon: CheckCircle },
  PENDING: { label: 'Pending', variant: 'warning' as const, icon: Clock },
}

export function FeesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fees-my'],
    queryFn: async () => {
      const res = await api.get('/fees/my')
      return res.data.data as {
        totalFees: number
        amountPaid: number
        outstanding: number
        percentagePaid: number
        feeItems: Array<{
          id: string
          title: string
          courseId: string
          amount: number
          status: 'PAID' | 'PENDING'
          referenceDate: string
        }>
      }
    },
  })

  const totalFees = data?.totalFees ?? 0
  const paidAmount = data?.amountPaid ?? 0
  const pendingAmount = data?.outstanding ?? 0
  const paidPct = data?.percentagePaid ?? 0
  const feeItems = data?.feeItems ?? []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fees" description="View your fee structure and payment status" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fees" description="View your fee structure and payment status" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Fees" value={`₹${totalFees.toLocaleString('en-IN')}`} icon={CreditCard} />
        <StatCard
          label="Amount Paid"
          value={`₹${paidAmount.toLocaleString('en-IN')}`}
          change={`${paidPct}% of total`}
          trend="up"
          icon={CheckCircle}
          iconClassName="bg-emerald-500/10"
        />
        <StatCard
          label="Outstanding"
          value={`₹${pendingAmount.toLocaleString('en-IN')}`}
          trend="down"
          icon={AlertCircle}
          iconClassName="bg-amber-500/10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fees paid this semester</span>
            <span className="font-semibold">{paidPct}%</span>
          </div>
          <Progress value={paidPct} className="h-3" />
        </CardContent>
      </Card>

      {feeItems.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No fees found. Enroll in a course to see fee details here.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {feeItems.map((fee, i) => {
          const config = statusConfig[fee.status]
          const Icon = config.icon

          return (
            <motion.div
              key={fee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        fee.status === 'PAID' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                      )}>
                        <Icon className={cn(
                          'h-6 w-6',
                          fee.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{fee.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Enrolled {format(parseISO(fee.referenceDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span className="text-sm">Semester 2026</span>
                    </div>
                    <span className="text-xl font-bold">₹{fee.amount.toLocaleString('en-IN')}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium">Need a fee breakdown receipt?</p>
            <p className="text-sm text-muted-foreground">Download your complete fee statement for this semester.</p>
          </div>
          <Badge variant="secondary">Available after full payment</Badge>
        </CardContent>
      </Card>
    </div>
  )
}