import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import InputBox from "./InputBox";

const ChatContainer = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (text) => {
    const userMessage = { sender: "user", text };
    setMessages([...messages, userMessage]);

    // Simulate API call with a delay
    setTimeout(() => {
      const botMessage = { sender: "bot", text: "This is a response!" };
      setMessages((prev) => [...prev, botMessage]);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <InputBox onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatContainer;
