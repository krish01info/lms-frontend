import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Lock,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockPayments } from '@/constants/mockData'
import { cn } from '@/utils/cn'

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
]

export function PaymentsPage() {
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)

  const pendingPayment = mockPayments.find((p) => p.status === 'pending')!
  const paidPayments = mockPayments.filter((p) => p.status === 'paid')
  const overduePayment = mockPayments.find((p) => p.status === 'overdue')

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setPaid(true)
    }, 2000)
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
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Amount payable</p>
                  <p className="text-3xl font-bold">₹{pendingPayment.amount.toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{pendingPayment.title}</p>
                </div>
                {overduePayment && (
                  <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <FileText className="h-4 w-4 shrink-0" />
                    {overduePayment.title} (₹{overduePayment.amount.toLocaleString('en-IN')}) is overdue
                  </div>
                )}
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{pendingPayment.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{pendingPayment.amount.toLocaleString('en-IN')}</span>
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
                    Secured
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
                      Transaction ID: pay_{Date.now().toString(36)}
                    </p>
                    <Button variant="outline" className="mt-4 gap-2">
                      <Download className="h-4 w-4" />
                      Download Receipt
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

                    <Button className="w-full h-12 text-base" onClick={handlePay} disabled={processing}>
                      {processing ? 'Processing...' : `Pay ₹${pendingPayment.amount.toLocaleString('en-IN')}`}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By proceeding, you agree to Razorpay&apos;s terms of service
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 space-y-4">
          {mockPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Invoice #{payment.id.padStart(4, '0')} · Due {format(parseISO(payment.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{payment.amount.toLocaleString('en-IN')}</span>
                  <Badge variant={payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'destructive' : 'warning'}>
                    {payment.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="receipts" className="mt-6 space-y-4">
          {paidPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid on {format(parseISO(payment.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">₹{payment.amount.toLocaleString('en-IN')}</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
