import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Home, RefreshCcw } from 'lucide-react'

export default function PaymentFailure() {
  const navigate = useNavigate()


  const handleReturnHome = () => {
    navigate("/dashboard") // Navigates to the home page
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-red-700">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            We're sorry, but your payment could not be processed. Please try again or contact support if the issue persists.
          </p>
        </CardContent>
        <CardFooter >
         
          <Button onClick={handleReturnHome} className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
