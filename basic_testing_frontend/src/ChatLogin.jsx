import React, { useState, useRef } from "react";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { X } from 'lucide-react';

// Login component
function ChatLogin({setActiveChat, setIsUserLoggedIn}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [position, setPosition] = useState({ x: 900, y: 50 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });


  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          setSuccessMessage(data.message) ;
          if (data.data && data.data.accessToken && data.data.refreshToken) {

            console.log(data.data) ;


            chrome.storage.local.set(
              {
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
                id: data.data._id
              },
              () => {
                console.log("Tokens saved to chrome.storage.local");
                setSuccessMessage("Logged in successfully!"); // Set success message
                setIsUserLoggedIn(2);
                setTimeout(() => setSuccessMessage(""), 3000);
              }
            );

            

          } else {
            console.error("Failed to save tokens: Invalid response data");
          }
        })
        .catch((error) => {
          console.error("Error during login request:", error);
        });
      
    } else {
      setError("Please enter a valid email and password.");
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

    <ResizableBox
  width={400}
  height={450}
  minConstraints={[400, 450]}
  maxConstraints={[600, 550]}
  className="fixed shadow-lg bg-white "
  style={{
    top: `${position.y}px`,
    left: `${position.x}px`,
    position: "fixed",
    zIndex: "1000",
    scrollbarColor: "white",
  }}
>
  <div className="flex flex-col h-full">
    <div
      className="flex items-center justify-between border-b px-4 py-2 cursor-move bg-white  "
      onMouseDown={handleMouseDown}
      // style={{ color: "black" }}
    >
      <h2 className="text-lg font-semibold text-black flex items-center gap-3">
        
        Login Page
      </h2>

      <button className="p-2 text-black" onClick={() => setIsUserLoggedIn(0)}>
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>
    </div>
    
    {/* add code here */}
    
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 h-auto mx-auto mt-0">
      <h2 className="text-2xl font-semibold text-center mb-6 text-black">Login</h2>
       {successMessage && (
        <div className=" text-center text-green-500">{successMessage}</div> // Display success message
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border bg-white text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border bg-white text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-500">
          Don't have an account?{" "}
          <a
            href="http://localhost:5174/register"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </a>
        </span>
      </div>
    </div>

  </div>
</ResizableBox>




  );
}

export default ChatLogin;
