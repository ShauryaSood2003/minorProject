import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    apiKey: '••••••••••••••••'
  })
  const [error, setError] = useState('')
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  const handleSwitchChange = (name: string) => {
    setSettings((prev: any) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      console.log('Updating settings with:', settings)
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings updated successfully')
    } catch (err) {
      setError('Failed to update settings. Please try again.')
    }
  }

  const handleDeactivate = async () => {
    if (deactivateConfirm) {
      try {
        const token = localStorage.getItem("accessToken")
        const userId = localStorage.getItem("id");

        if (!userId || !token) {
          setError("User ID or token missing.");
          return;
        }

        const response = await fetch("http://localhost:8000/api/v1/auth/deactivateAccount", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body:JSON.stringify({userId})
        })
        
        if (response.ok) {
          console.log('Account deactivated successfully')
          // Optionally navigate to a login screen or home page
          navigate("/login")
        } else {
          const data = await response.json()
          setError(data.message || 'Failed to deactivate account')
        }
      } catch (err) {
        setError('Failed to deactivate account. Please try again.')
        console.error('Error deactivating account:', err)
      }
    } else {
      setDeactivateConfirm(true)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    try {
      const token = localStorage.getItem("accessToken")
      const userId = localStorage.getItem("id");

      if (!userId || !token) {
        setError("User ID or token missing.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/v1/auth/changePassword", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          userId
        })
      })

      if (response.ok) {
        console.log('Password updated successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to update password')
      }
    } catch (err) {
      setError('Failed to update password. Please try again.')
      console.error('Error updating password:', err)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account and extension preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="flex flex-col space-y-1">
                    <span>Dark Mode</span>
                    <span className="font-normal text-sm text-gray-500 dark:text-gray-400">Use dark theme</span>
                  </Label>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={() => handleSwitchChange('darkMode')}
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deactivate Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Deactivating your account will remove all your data and cannot be undone. Please be certain.
              </p>
              {deactivateConfirm && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. All your data will be permanently removed.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                variant="destructive"
                onClick={handleDeactivate}
              >
                {deactivateConfirm ? 'Confirm Deactivation' : 'Deactivate Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
