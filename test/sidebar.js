const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const togglePageInfo = document.getElementById("togglePageInfo");
const logoutButton = document.getElementById("logoutButton");
const closeButton = document.getElementById("closeButton");
const minimizeButton = document.getElementById("minimizeButton");
const sidebar = document.getElementById("sidebar");
const openSidebarButton = document.getElementById("openSidebarButton");

// Initialize speech synthesis and recognition
const synth = window.speechSynthesis;
let recognition;

try {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
} catch (error) {
  console.error("Speech Recognition API is not supported in this browser.");
}

sendButton.addEventListener("click", sendMessage);
closeButton.addEventListener("click", closeSidebar);
logoutButton.addEventListener("click", logoutUser);
document.addEventListener("DOMContentLoaded", loadChatHistory);
minimizeButton.addEventListener("click", minimizeSidebar);
openSidebarButton.addEventListener("click", openSidebar);

messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();  // Prevents form submission or default action
      sendMessage();  // Trigger the send message function
    }
  });

async function loadChatHistory() {
  chrome.storage.local.get("chatHistory", (data) => {
    const messages = data.chatHistory || [];
    messages.forEach((msg) => appendMessage(msg.sender, msg.text, msg.className));
  });
  checkLoginStatus();
}

async function sendMessage() {
  const userMessage = messageInput.value.trim();
  if (userMessage) {
    let fullMessage = userMessage;

    if (togglePageInfo.checked) {
      const pageInfo = await getPageInfo();
      fullMessage += `\n\n[Page Info]\nTitle: ${pageInfo.title}\nURL: ${pageInfo.url}`;
    }

    appendMessage("User", fullMessage, "user-message");
    messageInput.value = "";

    setTimeout(() => {
      const botReply = `Bot: Echo - "${userMessage}"`;
      appendMessage("Bot", botReply, "bot-message");
      speak(botReply); // Speak the bot's response
      saveChatHistory();
    }, 500);

    saveChatHistory();
  }
}

function appendMessage(sender, message, className) {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${sender}: ${message}`;
  messageElement.classList.add(className);
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight;
}

function getPageInfo() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      resolve({ title: activeTab.title, url: activeTab.url });
    });
  });
}

function saveChatHistory() {
  const messages = Array.from(chat.children).map((msg) => ({
    sender: msg.textContent.split(": ")[0],
    text: msg.textContent.split(": ")[1],
    className: msg.className,
  }));
  chrome.storage.local.set({ chatHistory: messages });
}

function checkLoginStatus() {
  chrome.storage.local.get("loggedInUser", (data) => {
    if (!data.loggedInUser) {
      window.location.href = "login.html";
    }
  });
}
function logoutUser() {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      chrome.storage.local.remove("loggedInUser", () => {
        window.location.href = "login.html"; // Ensure this page exists
      });
    }
  }
  

// Speech synthesis function to speak bot responses
function speak(text) {
  if (synth.speaking) {
    console.error("Speech synthesis is already speaking.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  synth.speak(utterance);
}


// Handle speech recognition results
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  messageInput.value = transcript;
  console.log("Speech recognition result:", transcript);
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  alert("Speech recognition error: " + event.error);
};

// Stop speech recognition if it ends
recognition.onend = () => {
  console.log("Speech recognition ended.");
};

function closeSidebar() {
    sidebar.style.display = "none"; // Hide the sidebar
    openSidebarButton.style.display = "block"; // Show the 'Open Chat' button
  }
  
  function minimizeSidebar() {
    sidebar.classList.add("minimized"); // Add 'minimized' class to hide the sidebar
    openSidebarButton.style.display = "block"; // Show the open button
  }
  
  function openSidebar() {
    sidebar.style.display = "block";
    sidebar.classList.remove("minimized");
    sidebar.style.backgroundColor = "#ffffff"; // Reverts to the default background color
    openSidebarButton.style.display = "none"; // Hide the button when the sidebar is open
  }
  
  
