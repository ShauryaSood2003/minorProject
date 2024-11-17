import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  const handleReturnHome = () => {
    navigate("/dashboard") // Navigates to the home page
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-green-700">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReturnHome} className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
