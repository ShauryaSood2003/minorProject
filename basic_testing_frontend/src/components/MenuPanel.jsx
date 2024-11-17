import React from "react";

const MenuPanel = ({ chats, activeChat, setActiveChat, handleAddNewChat }) => {
  return (
    <div className="w-64 bg-white shadow-lg h-full p-4">
      <h3 className="text-lg font-bold mb-4">Chats</h3>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`p-2 cursor-pointer ${
              activeChat && activeChat.id === chat.id ? "bg-blue-200" : ""
            }`}
            onClick={() => setActiveChat(chat)}
          >
            {chat.name}
          </li>
        ))}
      </ul>
      <button
        onClick={handleAddNewChat}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
      >
        Add New Chat
      </button>
    </div>
  );
};

export default MenuPanel;
