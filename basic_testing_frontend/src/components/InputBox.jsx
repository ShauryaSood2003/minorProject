import React, { useState } from "react";

const InputBox = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="p-4 flex items-center space-x-2 bg-white shadow-md">
      <button className="text-2xl">😊</button>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded"
      />
      <button
        onClick={() => {
          onSendMessage(inputValue);
          setInputValue("");
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default InputBox;
