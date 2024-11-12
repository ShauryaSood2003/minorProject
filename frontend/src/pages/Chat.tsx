// Extend the Window interface to include SpeechRecognition
declare global {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
  }

  
  import { useState, useRef, useEffect } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { Card, CardContent } from "@/components/ui/card"
  import { Avatar, AvatarFallback } from "@/components/ui/avatar"
  import { ChevronLeft, Send, Bot, User, Volume2, Mic } from 'lucide-react'
  
  // Define the Message type
  type Message = {
    id: number;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }
  
  export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isListening, setIsListening] = useState(false)
    const navigate = useNavigate()
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)
  
    useEffect(() => {
      // Initialize SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'
  
        recognitionRef.current.onresult = (event:any) => {
          const transcript = event.results[0][0].transcript
          setInputMessage(transcript)
          setIsListening(false)
        }
  
        recognitionRef.current.onerror = (event:any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
  
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }, [])
  
    const startListening = () => {
      if (recognitionRef.current) {
        setIsListening(true)
        recognitionRef.current.start()
      } else {
        alert('Speech recognition is not supported in this browser.')
      }
    }
  
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
  
      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          content: `This is a simulated response to: "${inputMessage}"`,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prevMessages => [...prevMessages, botResponse])
      }, 1000)
    }
  
    // Text-to-speech function
    const speakMessage = (text: string) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
      } else {
        alert('Text-to-speech is not supported in this browser.')
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
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center">
            <Button variant="ghost" className="mr-4" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chat with AI</h1>
          </div>
        </header>
  
        <main className="flex-grow overflow-hidden">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
              {messages.map((message) => (
                <Card key={message.id} className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="h-8 w-8 mr-2">
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <AvatarFallback>{message.sender === 'user' ? 'U' : 'B'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          {message.sender === 'user' ? 'You' : 'AI Assistant'}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => speakMessage(message.content)} className="ml-2">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
  
            <div className="p-4 bg-white dark:bg-gray-900 border-t dark:text-gray-100">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center">
                <Button variant="ghost" onClick={startListening} disabled={isListening} className="mr-2">
                  <Mic className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
                </Button>
                <Input
                  type="text"
                  placeholder="Type or say your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
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
  