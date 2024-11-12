'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, LogOut, Settings, User, Calendar, Filter } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

// Mock data for chat history
const chatHistory = [
  { id: 1, question: "What's the capital of France?", answer: "The capital of France is Paris.", timestamp: "2024-06-01T10:30:00Z", model: "GPT-3" },
  { id: 2, question: "How do I create a React component?", answer: "To create a React component, you can use a function or class that returns JSX...", timestamp: "2024-06-02T14:45:00Z", model: "GPT-4" },
  { id: 3, question: "What's the difference between let and const in JavaScript?", answer: "The main difference between let and const is that let allows reassignment of the variable, while const does not...", timestamp: "2024-06-03T09:15:00Z", model: "GPT-3" },
  { id: 4, question: "Explain quantum computing", answer: "Quantum computing is a type of computation that harnesses the collective properties of quantum states, such as superposition, interference, and entanglement, to perform calculations...", timestamp: "2024-06-04T16:20:00Z", model: "GPT-4" },
  { id: 5, question: "What are the benefits of exercise?", answer: "Regular exercise offers numerous benefits including improved cardiovascular health, stronger muscles and bones, better mental health, weight management, and reduced risk of chronic diseases...", timestamp: "2024-06-05T11:05:00Z", model: "GPT-3" },
]

const models = ["All Models", "GPT-3", "GPT-4"]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedModel, setSelectedModel] = useState("All Models")
  const navigate = useNavigate()

  const filteredChats = chatHistory.filter(chat => 
    (chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedDate || format(new Date(chat.timestamp), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) &&
    (selectedModel === "All Models" || chat.model === selectedModel)
  )

  const handleLogout = () => {
    // TODO: Implement actual logout logic here
    console.log('Logging out...')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap space-y-3 md:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">LLM Chrome Extension</h1>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Chat History</CardTitle>
            <CardDescription>Review and search your past conversations with the LLM.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-4">
              <Input
                type="search"
                placeholder="Search your chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(selectedDate || selectedModel !== "All Models") && (
                <Button variant="ghost" onClick={() => {
                  setSelectedDate(undefined)
                  setSelectedModel("All Models")
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
              {filteredChats.map((chat) => (
                <Card key={chat.id} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">Q: {chat.question}</CardTitle>
                      <span className="text-xs text-muted-foreground">{chat.model}</span>
                    </div>
                    <CardDescription>{new Date(chat.timestamp).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{chat.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Future Features Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Exciting new features on the horizon</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Enhanced multi-model support with real-time model switching</li>
              <li>Advanced analytics and insights from your chat history</li>
              <li>Customizable AI personas for different use cases</li>
              <li>Integration with popular note-taking and productivity apps</li>
              <li>Collaborative features for team environments</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}