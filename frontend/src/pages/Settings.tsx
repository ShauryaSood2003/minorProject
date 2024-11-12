'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react'
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

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  const handleSwitchChange = (name: string) => {
    setSettings((prev:any) => ({ ...prev, [name]: !prev[name] }))
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

  const handleDeactivate = () => {
    if (deactivateConfirm) {
      console.log('Deactivating account...')
      // Implement account deactivation logic here
    } else {
      setDeactivateConfirm(true)
    }
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