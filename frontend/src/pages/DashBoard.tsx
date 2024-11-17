import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, LogOut, Settings, User, Calendar, Globe, PlusIcon,Gift  } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import ReactMarkdown from 'react-markdown';
import axios from 'axios'


// Updated mock data for chat history
// const chatHistory = [
//   {
//     id: 1,
//     websiteName: "vercel.com",
//     chats: [
//       { id: 1, question: "What's Vercel's main product?", answer: "Vercel's main product is a cloud platform for static sites and Serverless Functions.", timestamp: "2024-06-01T10:30:00Z"},
//       { id: 2, question: "How does Vercel handle deployments?", answer: "Vercel handles deployments through automatic deployments triggered by git pushes, with preview deployments for pull requests.", timestamp: "2024-06-02T14:45:00Z" }
//     ]
//   },
//   {
//     id: 2,
//     websiteName: "react.dev",
//     chats: [
//       { id: 3, question: "What are React hooks?", answer: "React hooks are functions that let you use state and other React features in functional components.", timestamp: "2024-06-03T09:15:00Z"},
//       { id: 4, question: "Explain the useEffect hook", answer: "The useEffect hook in React is used for side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.", timestamp: "2024-06-04T16:20:00Z" },
//     ]
//   },
//   {
//     id: 3,
//     websiteName: "github.com",
//     chats: [
//       { id: 5, question: "How do I create a pull request?", answer: "To create a pull request on GitHub, push your changes to a new branch, go to the repository page, click 'Pull requests', then 'New pull request'. Select your branch and base branch, add a title and description, then click 'Create pull request'.", timestamp: "2024-06-05T11:05:00Z" },
//     ]
//   }
// ]

interface Chat {
  question: string;
  answer: string;
  timestamp: string; // or Date if you parse it as a Date object later
  model: string;
  _id: string;
}

interface Website {
  _id: string;
  websiteName: string;
  chats: Chat[];
}


export default function DashboardPage() {
  const [chatHistory, setChatHistory] = useState<Website[]>([]);
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isHovered, setIsHovered] = useState(false) 
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Implement actual logout logic here
    localStorage.clear();
    console.log('Logging out...')
    navigate('/login')
  }

  useEffect(() => {

    async function getConversations() {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("id");

      if (!userId || !token) {
        console.error("User ID or access token is missing, either there is some issue or user has to relogin");
        // Handle re-authentication, e.g., redirect to login
        navigate('/login'); // Use your login route

        return ;
      }
      console.log(userId,token);
      
      try {
        

      
        const response = await axios.post(
    'http://localhost:8000/api/v1/chat/all',
    { userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
        const userConversations = response.data ;

        console.log("User Info",userConversations.data.conversations);
        

        const conversations = userConversations.data.conversations;
        if (conversations.length !== 0) {

          setChatHistory(() => {

            return conversations.map((website: Website) => ({
              ...website,
              chats: website.chats.filter(chat =>
                (chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  chat.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
                (!selectedDate || format(new Date(chat.timestamp), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
              )
            })).filter((website: Website) => website.chats.length > 0)
            
          })
        }

      }
      catch (err: any) {
        console.log('error msg', err) ;
        if (err.response && err.response.data.message.includes('Unauthorized access')) {
        console.log("Access token expired or unauthorized. Redirecting to login.");
        // Handle re-authentication, e.g., redirect to login
        navigate('/login'); // Use your login route
      } else {
        console.log("Failed to get the conversations of the user", err);
        }
      }
    }

    getConversations();


  }, [])

  // useEffect(() => {
  //   if (!(chatHistory.length === 0)) {
  //     filteredChatHistory = chatHistory.map(website => ({
  //     ...website,
  //     chats: website.chats.filter(chat => 
  //       (chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       chat.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
  //       (!selectedDate || format(new Date(chat.timestamp), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
  //     )
  //   })).filter(website => website.chats.length > 0)
  //   }
  // }, [chatHistory])

  return (
    <div className="min-h-screen bg-gray-100 dark:text-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap space-y-3 md:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LLM Chrome Extension</h1>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card 
        className={`flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white transition-all duration-300 ease-in-out ${isHovered ? 'shadow-lg scale-105' : 'shadow'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="flex-1">
          <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">500 Free Tokens!</CardTitle>
          <CardDescription className="text-purple-100 text-base sm:text-lg">
            You Got 500 complimentary tokens for signIn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center mt-4 sm:mt-0">
          <Gift className="w-8 h-8 mr-4 animate-bounce" />
          <Button 
            onClick={()=>navigate("/billingAccount")} 
            variant="secondary" 
            size="lg"
            className="bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-200"
          >
            Billing Account
          </Button>
        </CardContent>
      </Card>
    </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className='flex justify-between'>
              <CardTitle>Your Chat History</CardTitle>
              <Button onClick={() => { navigate("/chat") }}>
                <PlusIcon />
                Start New Chat
              </Button>
            </div>
            <CardDescription>Review and search your past conversations with the LLM across different websites.</CardDescription>
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

            </div>
            <ScrollArea className="max-h-[600px] w-full rounded-md border p-4 overflow-auto">

              <Accordion type="single" collapsible className="w-full">
                {chatHistory.map((website) => (
                  <AccordionItem key={website._id} value={`website-${website._id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>{(website.websiteName === "self@general@123") ? "Here" : website.websiteName}</span>
                        <span className="text-sm text-muted-foreground">({website.chats.length} chats)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {website.chats.map((chat) => (
                        <Card key={chat._id} className="mb-4">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-medium">Q: {chat.question}</CardTitle>

                            </div>
                            <CardDescription>{new Date(chat.timestamp).toLocaleString()}</CardDescription>
                          </CardHeader>
                          <CardContent>
                          <ReactMarkdown>{chat.answer}</ReactMarkdown>
                            {/* <p className="text-sm"></p> */}
                          </CardContent>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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