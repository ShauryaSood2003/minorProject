// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}


import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'  // Changed from next/navigation
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ReactMarkdown from 'react-markdown'
import { Send, Volume2, Mic, AlertCircle } from 'lucide-react'
import axios from 'axios'

// Define the Message type
type Message = {
  id: number
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  userInput?: string
}

type BillingInfo = {
  token: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()  // Changed to useNavigate from react-router-dom
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState<any>(null);
  const [currentMessageId, setCurrentMessageId] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const userId = localStorage.getItem("id")

    
    if (!userId || !token) {
      console.log("User ID or access token is missing. Please log in again.")
      navigate('/login')
      return ; 
    }
    console.log("token are there in the chat page")

    fetchBillingInfo(token, userId)
    initializeSpeechRecognition()
  }, [])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setError('Speech recognition failed. Please try again.')
      }

      recognitionRef.current.onend = () => setIsListening(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    } else {
      setError('Speech recognition is not supported in this browser.')
    }
  }

  const handlePlayMessage = (id: number, text: string) => {

    console.log("id", id) ;
    console.log("text", text) ; 
    console.log("currentMessageId", currentMessageId) ;
    console.log("speechSynthesisInstance", speechSynthesisInstance) ;

    // If the current message is playing, toggle pause/resume
    if (speechSynthesisInstance && currentMessageId === id) {
      console.log(0) ;
      if (window.speechSynthesis.speaking) {
        console.log(1) ;
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          console.log(2) ;
        } else {
          console.log(3) ;
          window.speechSynthesis.pause();
        }
      }
    } else {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Create a new utterance for the selected message
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setSpeechSynthesisInstance(null);
        setCurrentMessageId(null);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

      // Update the state
      setSpeechSynthesisInstance(utterance);
      setCurrentMessageId(id);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prevMessages => [...prevMessages, newMessage])
    setInputMessage('')

    try {
      const token = localStorage.getItem("accessToken")
      const userId = localStorage.getItem("id")

      if (!userId || !token) {
        throw new Error("User ID or access token is missing!")
      }

      const response = await axios.patch("http://localhost:8000/api/v1/chat/append", 
        {
          websiteName: "self@general@123",
          question: inputMessage,
          model: "Gemini 1.5",
          extraInfo: `This is the set of chat that has happened till now, so that you can give more context aware answer, Chats are are follows: \n ${messages} `
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      )

      const data = response.data ;
      const botReply = data.data.conversation.chats[0].answer

      const botResponse: Message = {
        id: data.data.conversation.chats[0]._id,
        content: botReply,
        sender: 'bot',
        timestamp: new Date(data.data.conversation.chats[0].timestamp)
      }
      setMessages(prevMessages => [...prevMessages, botResponse])
      fetchBillingInfo(token, userId)
    } catch (err: any) {
      console.log("error while sending message", err) ;
      if (err.response?.data?.message?.includes("Unauthorized access")) {
        setError("Your session has expired. Please log in again.")
        navigate('/login')  // Changed to navigate from react-router-dom
      } else {
        setError(`An error occurred: ${err.message}`)
      }
      
    }
  }

  const fetchBillingInfo = async (token: string, userId: string) => {

    // console.log("details", token, userId) ;

    try {
      const response = await fetch("http://localhost:8000/api/v1/billing/billingAccount", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status in chat page: ${response.status}`)
      }

      const data = await response.json() ;

      if (data.status > 300) {
        if (data.message.includes("Unauthorized access")) {
          setError("Your session has expired. Please log in again.")
          navigate('/login')  // Changed to navigate from react-router-dom
        }
      }

      setBillingInfo(data.data)
    } catch (error: any) {
      setError(`Error fetching billing info: ${error.message}`)
    }
  }

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    } else {
      setError('Text-to-speech is not supported in this browser.')
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chat with AI</h1>
          {billingInfo && (
            <Button>
              Balance: {billingInfo.token.toFixed(2)} Tokens
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow overflow-hidden">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <Card key={message.id} className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-2">
                      {message.sender === 'user' ? (
                        <AvatarImage src="/user-avatar.png" alt="User" />
                      ) : (
                        <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
                      )}
                      <AvatarFallback>{message.sender === 'user' ? 'U' : 'B'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="text-sm font-medium mb-1">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" 
                          onClick={() => handlePlayMessage(message.id, message.content)}
                          className={`ml-2  ${(currentMessageId === message.id) ? 'text-red-500' : 'text-gray-600'}  `}>
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Read aloud</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" onClick={startListening} disabled={isListening} className="mr-2">
                      <Mic className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? 'Listening...' : 'Start voice input'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
