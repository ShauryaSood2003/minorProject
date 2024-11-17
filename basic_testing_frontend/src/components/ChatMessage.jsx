import React from "react";

const ChatMessage = ({ sender, text }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
