import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { toast } from 'sonner'

const schema = z.object({ email: z.string().email('Please enter a valid email') })

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('OTP sent to your email')
    navigate('/otp-verification')
    setIsLoading(false)
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a verification code">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" className="pl-11" placeholder="you@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{String(errors.email.message)}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
        </Button>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </form>
    </AuthLayout>
  )
}
