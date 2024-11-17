import React from "react";

const TopBar = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <h1 className="text-xl font-bold">Chat App</h1>

      <div>
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="font-medium">Tokens: 10</span>
            <button className="bg-blue-500 text-white px-4 py-1 rounded">Profile</button>
          </div>
        ) : (
          <button
            className="bg-green-500 text-white px-4 py-1 rounded"
            onClick={() => setIsLoggedIn(true)}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
