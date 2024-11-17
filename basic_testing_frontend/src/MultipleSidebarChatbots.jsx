import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Plus, Volume2, Mic } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import ReactMarkdown from 'react-markdown'
import 'react-resizable/css/styles.css';

function MultipleSidebarChatbots() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [responseComing, setResponseComing] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState({ x: 900, y: 50 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const createNewChat = () => {
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
    console.log('responseComing', JSON.stringify(responseComing));
  }, [responseComing]);

  useEffect(()=>{
    chrome.storage.local.get(["accessToken", "refreshToken", "id"], (result) => {
      if (result.accessToken && result.refreshToken && result.id) {
        console.log("Access Token:", result.accessToken);
        console.log("Refresh Token:", result.refreshToken);
        console.log("UserID:", result.id);
    
        // Now you can use these tokens and user ID in the chatbot
        // For example, store them in localStorage for use in the chatbot
        window.localStorage.setItem('accessToken', result.accessToken);
        window.localStorage.setItem('refreshToken', result.refreshToken);
        window.localStorage.setItem('id', result.id);
      } else {
        console.error("Tokens not found in chrome.storage.local");
      }
    });
    
  },[]);

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
  
      if (!userId || !token) {
        throw new Error('User ID or access token is missing!');
      }
  
      const response = await fetch('http://localhost:8000/api/v1/chat/append', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteName: 'self@general@123',
          question: inputMessage,
          model: 'Gemini 1.5',
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
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
      console.log("Chats:",chats);
      
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

      {activeChat !== null && (
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5" width={24} height={24}>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>

                Chat Assistant {activeChat}</h2>
              <button className="p-2 text-black" onClick={() => setActiveChat(null)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
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

                  <button  className="p-2  text-black h-4 my-auto"
                  >
                    <Volume2 className="h-4 w-4 block  " />
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
                <button t className="p-2  text-black"
                >
                  <Mic className="h-4 w-4" />
                </button>


                <button type="submit" className="p-2  text-black"
                  // style = {{color: "black"}}
                  disabled={responseComing[activeChat]}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </button>
              </form>
            </div>
          </div>
        </ResizableBox>
      )}
    </>
  );
}

export default MultipleSidebarChatbots;