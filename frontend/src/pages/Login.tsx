import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const history = useNavigate() // Using useHistory hook for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Implement actual login logic here
    console.log('Login attempt with:', { email, password })


    axios.post('http://localhost:8000/api/v1/auth/login', {
      email,
      password,
    })
      .then((response) => {
        // console.log(0) ;
        // console.log(response) ;
        if (response.data.data && response.data.data.accessToken && response.data.data.refreshToken) {
          // Save the token in localStorage
          localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('id', response.data.data._id);
            // For now, we'll just redirect to a hypothetical dashboard
            
            history('/dashboard') // Navigate to dashboard using react-router-dom
          }
      }).catch((err) => {
      
        console.log("error while logging in", err) ;
        alert(err.response.data.message)
        
      }) ;
      
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Your Account</CardTitle>
          <CardDescription>Enter your email and password to access your LLM Chrome Extension dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e:any) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e:any) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">Log In</Button>
            <p className="text-sm text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
