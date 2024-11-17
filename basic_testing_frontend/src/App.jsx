import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  // Check chrome.storage.local for user details on component mount
  useEffect(() => {
    chrome.storage.local.get(["user"], (result) => {
      if (result.user) {
        setUser(result.user);
      }
      setLoading(false); // Stop loading after checking
    });
  }, []);

  // Handle login
  const handleLogin = (email) => {
    const userDetails = { email };
    setUser(userDetails);
    chrome.storage.local.set({ user: userDetails }, () => {
      console.log("User saved to chrome.storage.local");
    });
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    chrome.storage.local.remove("user", () => {
      console.log("User removed from chrome.storage.local");
    });
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 h-auto mx-auto mt-10">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-gray-800 text-center">Welcome Back!</h1>
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-700">Hello, {user.email}!</span>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>
      <div className="text-center text-sm text-gray-500">
        <small>Chrome Extension Demo</small>
      </div>
    </div>
  );
}

// Login component
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
          if (data.data && data.data.accessToken && data.data.refreshToken) {

            chrome.storage.local.set(
              {
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
                id: data.data._id
              },
              () => {
                console.log("Tokens saved to chrome.storage.local");
                setSuccessMessage("Logged in successfully!"); // Set success message
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
  

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 h-auto mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
       {successMessage && (
        <div className="mb-4 text-center text-green-500">{successMessage}</div> // Display success message
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
}

export default App;
