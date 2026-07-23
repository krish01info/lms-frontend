import { Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { toast } from 'sonner'

export function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('OTP verified!')
    navigate('/reset-password')
    setIsLoading(false)
  }

  return (
    <AuthLayout title="Verify OTP" subtitle="Enter the 6-digit code sent to your email">
      <div className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className="flex h-14 w-12 items-center justify-center rounded-2xl border border-input bg-card text-center text-xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ))}
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={isLoading || otp.some((d) => !d)}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive code?{' '}
          <button type="button" onClick={() => toast.info('Code resent!')} className="font-medium text-primary hover:underline">
            Resend
          </button>
        </p>
        <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
