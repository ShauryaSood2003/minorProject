const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const togglePageInfo = document.getElementById("togglePageInfo");

sendButton.addEventListener("click", sendMessage);
document.addEventListener("DOMContentLoaded", loadChatHistory);

async function sendMessage() {
  const userMessage = messageInput.value.trim();
  if (userMessage) {
    let fullMessage = userMessage;
    
    // Check if the toggle switch is on, and include page info if needed
    if (togglePageInfo.checked) {
      const pageInfo = await getPageInfo();
      fullMessage += `\n\n[Page Info]\nTitle: ${pageInfo.title}\nURL: ${pageInfo.url}, Here use the url and page title and give me a response for it`;
    }
    
    appendMessage("User", fullMessage, "user-message");
    messageInput.value = "";

    setTimeout(() => {
      const botReply = `Bot: Echo - "${userMessage}"`;
      appendMessage("Bot", botReply, "bot-message");
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
  const messages = Array.from(chat.children).map(msg => msg.textContent);
  chrome.storage.local.set({ chatHistory: messages });
}

function loadChatHistory() {
  chrome.storage.local.get("chatHistory", (data) => {
    const messages = data.chatHistory || [];
    messages.forEach(msg => {
      const [sender, message] = msg.split(": ");
      const className = sender === "User" ? "user-message" : "bot-message";
      appendMessage(sender, message, className);
    });
  });
}
