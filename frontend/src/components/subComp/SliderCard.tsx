'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "Priority Support",
    description: "Get faster responses and dedicated assistance for all your inquiries.",
    icon: "🚀"
  },
  {
    title: "Early Access to New AI Models",
    description: "Be among the first to try out our latest AI innovations.",
    icon: "🤖"
  },
  {
    title: "Exclusive Webinars",
    description: "Join expert-led sessions on AI trends and best practices.",
    icon: "🎓"
  },
  {
    title: "Advanced Analytics",
    description: "Gain deeper insights into your AI usage and performance.",
    icon: "📊"
  },
  {
    title: "Custom Model Training",
    description: "Get assistance in training models tailored to your specific needs.",
    icon: "🎛️"
  }
]

export default function FeatureSlider() {
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upcoming Features</CardTitle>
        <CardDescription>Exciting new capabilities coming soon!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden" style={{ height: '200px' }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${
                index === currentFeature ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
              aria-hidden={index !== currentFeature}
            >
              <div className="flex flex-col items-center text-center p-4">
                <span className="text-4xl mb-2" aria-hidden="true">{feature.icon}</span>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="icon" onClick={prevFeature} aria-label="Previous feature">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextFeature} aria-label="Next feature">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}