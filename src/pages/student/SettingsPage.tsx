import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Eye, EyeOff, Lock, Moon, Shield, Sun } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/utils/cn'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    assignments: true,
    quizzes: true,
    announcements: true,
    payments: true,
    messages: false,
    emailDigest: true,
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setPasswordForm({ current: '', new: '', confirm: '' })
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences and account security" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how LearnFlow looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all',
                  theme === 'light' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Sun className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all',
                  theme === 'dark' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                  <Moon className="h-6 w-6 text-slate-300" />
                </div>
                <span className="text-sm font-medium">Dark</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Current theme: <span className="font-medium capitalize">{theme}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what you want to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: 'assignments' as const, label: 'Assignment reminders', desc: 'Due dates and grade updates' },
              { key: 'quizzes' as const, label: 'Quiz alerts', desc: 'New quizzes and results' },
              { key: 'announcements' as const, label: 'Announcements', desc: 'School and class updates' },
              { key: 'payments' as const, label: 'Payment reminders', desc: 'Fee due dates and receipts' },
              { key: 'messages' as const, label: 'Messages', desc: 'New chat messages' },
              { key: 'emailDigest' as const, label: 'Weekly email digest', desc: 'Summary of your week' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={() => toggleNotification(item.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="mx-auto max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {saved ? 'Password Updated!' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Active sessions</p>
              <p className="text-xs text-muted-foreground">Manage devices logged into your account</p>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
          <Separator />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4"
          >
            <p className="text-sm font-medium text-destructive">Danger Zone</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" size="sm" className="mt-3">
              Delete Account
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
