import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Plus, Volume2, Mic, MessageSquareText, Power } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import ReactMarkdown from 'react-markdown'
import ChatLogin from './ChatLogin';



function MultipleSidebarChatbots() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [responseComing, setResponseComing] = useState({});
  const [billingInfo, setBillingInfo] = useState(null)
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState({ x: 900, y: 50 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null);

  // this is used for speaking the output
  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState(null);
  const [currentMessageId, setCurrentMessageId] = useState(null);

  // for checking of login
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(0);


  const createNewChat = () => {
    if (isUserLoggedIn <= 1) {
      if (isUserLoggedIn === 0) {
        setIsUserLoggedIn(1);
      }
      return;
    }

    const newChat = {
      id: chats.length + 1,
      messages: [
        {
          id: 1,
          text: 'Hello! How can I assist you today?',
          sender: 'bot',
        },
      ],
    };
    setChats([...chats, newChat]);
    setActiveChat(newChat.id);
    if (responseComing[newChat.id] === undefined) {
      setResponseComing(prevData => ({ ...prevData, [newChat.id]: false }));
    }
  };

  useEffect(() => {
    console.log('isUserLoggedIn', isUserLoggedIn);
  }, [isUserLoggedIn]);

  useEffect(() => {
    console.log('chats', chats);
  }, [chats]);

  useEffect(() => {
    console.log('responseComing', JSON.stringify(responseComing));
  }, [responseComing]);

  useEffect(() => {
    // if (isUserLoggedIn !== 2) {
    //   return ;
    // }
    chrome.storage.local.get(["accessToken", "refreshToken", "id"], (result) => {
      // TODO: sahil, handle the condition where tokens are not found
      if (result.accessToken && result.refreshToken && result.id) {

        // what is the use of this
        setIsUserLoggedIn(2);
        window.localStorage.setItem('accessToken', result.accessToken);
        window.localStorage.setItem('refreshToken', result.refreshToken);
        window.localStorage.setItem('id', result.id);
        fetchBillingInfo(result.accessToken, result.id)

      } else {
        console.log("Tokens not found in chrome.storage.local");
        if (isUserLoggedIn === 2) setIsUserLoggedIn(0);
      }
    });

  }, [isUserLoggedIn]);

  useEffect(() => {

    initializeSpeechRecognition()
  }, [])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(prevMsg => prevMsg + ' ' + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        console.error('Speech recognition failed. Please try again.')
      }

      recognitionRef.current.onend = () => setIsListening(false)
    }
  }

  const fetchBillingInfo = async (token, userId) => {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBillingInfo(data.data)
    } catch (error) {
      console.error(`Error fetching billing info: ${error.message}`)
    }


  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || activeChat === null) return;

    const newMessage = {
      id: chats[activeChat - 1].messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );
    setInputMessage('');

    setResponseComing((prevData) => ({ ...prevData, [activeChat]: true }));

    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('id');

      console.log(token, userId);

      if (!userId || !token) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChat
              ? { ...chat, messages: chat.messages.slice(0, -1) }
              : chat
          )
        );
        setIsUserLoggedIn(1);
        console.log("User ID or access token is missing.");
      }

      const currentUrl = window.location.href;   // Current URL
      const title = document.title;              // Page title
      const baseUrl = window.location.origin;

      const response = await fetch('http://localhost:8000/api/v1/chat/append', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteName: baseUrl,
          question: inputMessage,
          extraInfo: `take reference from this website url ${currentUrl}`,
          model: 'Gemini 1.5',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status > 300) {
        if (data.message.includes("Unauthorized access")) {
          console.log("Cannot send the message, because access is unauthorized.");
          setIsUserLoggedIn(1);
        }
      }

      // Extracting bot's response
      const botMessage = data?.data?.conversation?.chats?.[0];
      if (!botMessage || !botMessage.answer) {
        throw new Error('Unexpected response format from backend');
      }

      const botResponse = {
        id: botMessage._id,
        text: botMessage.answer,
        sender: 'bot',
        timestamp: new Date(botMessage.timestamp),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, botResponse] }
            : chat
        )
      );
      fetchBillingInfo(token, userId)

    } catch (err) {
      console.error('Error during message send:', err.message);
    } finally {
      setResponseComing((prevData) => ({ ...prevData, [activeChat]: false }));
    }
  };


  const handleMouseDown = (e) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (dragging.current) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    } else {
      console.log('Speech recognition is not supported in this browser.')
    }
  }

  const handlePlayMessage = (id, text) => {

    console.log("id", id);
    console.log("text", text);
    console.log("currentMessageId", currentMessageId);
    console.log("speechSynthesisInstance", speechSynthesisInstance);

    // If the current message is playing, toggle pause/resume
    if (speechSynthesisInstance && currentMessageId === id) {
      console.log(0);
      if (window.speechSynthesis.speaking) {
        console.log(1);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          console.log(2);
        } else {
          console.log(3);
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

  const handleLogout = () => {
    chrome.storage.local.remove(["accessToken", "refreshToken", "id"], () => {
      console.log("User has been logged out and info has been removed");
      setIsUserLoggedIn(1);
    });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2" >
        {chats.map((chat) => (
          <button
            key={chat.id}
            className="rounded-full p-4 shadow-md flex gap-1 items-center"
            onClick={() => setActiveChat(chat.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="">Chat {chat.id}</span>
          </button>
        ))}
        <button className="rounded-full p-4 shadow-lg flex items-center gap-1" onClick={createNewChat}>
          <Plus className="h-6 w-6" />
          <span className="">New Chat</span>
        </button>
      </div>

      {isUserLoggedIn === 2 && activeChat !== null && (
        <ResizableBox
          width={400}
          height={600}
          minConstraints={[300, 400]}
          maxConstraints={[600, 600]}
          className="fixed shadow-lg bg-white "
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            position: 'fixed',
            zIndex: "1000",
            scrollbarColor: "white"
          }}
        >
          <div className="flex flex-col h-full" >
            <div
              className="flex items-center justify-between border-b px-4 py-2 cursor-move bg-white  "
              onMouseDown={handleMouseDown}
            // style={{ color: "black" }}  

            >
              <h2 className="text-lg font-semibold text-black flex items-center gap-3">

                <MessageSquareText />

                Chat Assistant {activeChat}</h2>

              <span className='text-white flex-1 ' ></span>

              <button className="p-2 text-black self " onClick={handleLogout}>
                <Power className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
              <button className="p-2 text-black" onClick={() => setActiveChat(null)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            {billingInfo && billingInfo.token < 10 && (
              <a
                href="http://localhost:5173/billingAccount"
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: 'orange', marginTop: "5px", color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', textDecoration: 'none', display: 'inline-block', textAlign: 'center', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', }}
              >
                {billingInfo.token.toFixed(2)} Tokens Left - Recharge Now
              </a>
            )}
            <div className="flex-1 p-4 overflow-y-auto  bg-white text-white "
            // style={{color: "white"}}
            >


              {chats[activeChat - 1].messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 max-w-[80%]   rounded-lg p-2 ${message.sender === 'user'
                    ? 'ml-auto bg-gray-100 text-black'
                    : 'bg-white text-black'
                    }`}

                // style={{ color: "black",  scrollbarColor: "white" }}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>

                  <button
                    onClick={() => handlePlayMessage(activeChat + ' ' + message.id, message.text)}
                    className="py-2 pr-2  text-black h-8 my-auto"
                  >
                    <Volume2 className={`h-4 w-4  block ${(currentMessageId === activeChat + ' ' + message.id) ? 'text-red-500' : 'text-gray-600'}`}

                    />
                  </button>

                </div>
              ))}
            </div>
            <div className="border-t p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 p-2 border rounded bg-white text-black "
                // style={{ color: "black" }}
                />



                <button type="submit" className="p-2  text-black"
                  // style = {{color: "black"}}
                  disabled={responseComing[activeChat]}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </button>

                <button className="p-2  text-black" onClick={startListening} disabled={isListening}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'text-black'}`} />
                </button>
              </form>
            </div>
          </div>
        </ResizableBox>
      )}

      {isUserLoggedIn === 1 && <ChatLogin setActiveChat={setActiveChat} setIsUserLoggedIn={setIsUserLoggedIn} />}
    </>
  );
}

export default MultipleSidebarChatbots;