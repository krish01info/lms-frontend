import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  CheckCircle,
  CreditCard,
  FileText,
  Lock,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import api from '@/services/api'
import { transformCourse } from '@/utils/transformers'

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
]

// NOTE: no Fee model exists — sample amount, since there's no real "amount due" concept yet.
// Selecting a real enrolled course still creates a real Payment record on submit.
const SAMPLE_AMOUNT = 499

export function PaymentsPage() {
  const queryClient = useQueryClient()
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = useQuery({
    queryKey: ['payments-my'],
    queryFn: async () => {
      const res = await api.get('/payments/my')
      return res.data.data.payments
    },
  })

  const { data: courseData } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const res = await api.get('/courses/enrolled')
      return res.data.data.courses.map(transformCourse)
    },
  })

  const payMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.post('/payments', {
        courseId,
        amount: SAMPLE_AMOUNT,
        status: 'COMPLETED',
        gateway: selectedMethod,
        gatewayId: `pay_${Date.now().toString(36)}`,
      })
      return res.data.data.payment
    },
    onSuccess: () => {
      setPaid(true)
      queryClient.invalidateQueries({ queryKey: ['payments-my'] })
    },
  })

  const courses = courseData || []
  const allPayments = payments || []
  const completedPayments = allPayments.filter((p: any) => p.status === 'COMPLETED')

  const handlePay = () => {
    if (!selectedCourseId) return
    payMutation.mutate(selectedCourseId)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Pay fees securely and manage invoices" />

      <Tabs defaultValue="pay">
        <TabsList>
          <TabsTrigger value="pay">Make Payment</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="pay" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Summary (sample)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select course</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                    value={selectedCourseId || ''}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    <option value="" disabled>Choose an enrolled course</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Amount payable</p>
                  <p className="text-3xl font-bold">₹{SAMPLE_AMOUNT.toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sample fee — no fee structure exists in backend yet
                  </p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{SAMPLE_AMOUNT.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{SAMPLE_AMOUNT.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-[#072654] px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold text-sm">
                      R
                    </div>
                    <span className="font-semibold">Razorpay</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <Lock className="h-3 w-3" />
                    Simulated
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                {paid ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Payment Successful!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Recorded in your payment history
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => { setPaid(false); setSelectedCourseId(null) }}
                    >
                      Make Another Payment
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <Label>Payment method</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                              'flex flex-col items-center gap-2 rounded-2xl border p-3 text-sm transition-all',
                              selectedMethod === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30'
                            )}
                          >
                            <method.icon className="h-5 w-5" />
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedMethod === 'upi' && (
                      <div className="space-y-2">
                        <Label htmlFor="upi">UPI ID</Label>
                        <Input id="upi" placeholder="yourname@upi" defaultValue="alex@okaxis" />
                      </div>
                    )}

                    {selectedMethod === 'card' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="card">Card Number</Label>
                          <Input id="card" placeholder="4111 1111 1111 1111" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="***" type="password" />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 text-base"
                      onClick={handlePay}
                      disabled={payMutation.isPending || !selectedCourseId}
                    >
                      {payMutation.isPending ? 'Processing...' : `Pay ₹${SAMPLE_AMOUNT.toLocaleString('en-IN')}`}
                    </Button>

                    {!selectedCourseId && (
                      <p className="text-center text-xs text-muted-foreground">
                        Select a course above to continue
                      </p>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                      Simulated gateway — no real payment provider is connected yet
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 space-y-4">
          {isPaymentsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {isPaymentsError && (
            <EmptyState icon={FileText} title="Failed to load payments" description="Could not connect to the server." />
          )}

          {!isPaymentsLoading && !isPaymentsError && allPayments.length === 0 && (
            <EmptyState icon={FileText} title="No payments yet" description="Your payment history will appear here." />
          )}

          {allPayments.map((payment: any) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.course?.title || 'Course'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      {payment.gateway ? ` · ${payment.gateway}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
                  <Badge variant={payment.status === 'COMPLETED' ? 'success' : payment.status === 'FAILED' ? 'destructive' : 'warning'}>
                    {payment.status.toLowerCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="receipts" className="mt-6 space-y-4">
          {!isPaymentsLoading && completedPayments.length === 0 && (
            <EmptyState icon={CheckCircle} title="No receipts yet" description="Completed payments will appear here." />
          )}

          {completedPayments.map((payment: any) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.course?.title || 'Course'}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid on {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600">
                  ₹{Number(payment.amount).toLocaleString('en-IN')}
                </span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}