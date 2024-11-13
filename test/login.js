document.getElementById("loginButton").addEventListener("click", loginUser);

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  chrome.storage.local.get("users", (data) => {
    const users = data.users || {};
    if (users[username] === password) {
      chrome.storage.local.set({ loggedInUser: username }, () => {
        window.location.href = "sidebar.html";
      });
    } else {
      alert("Invalid credentials.");
    }
  });
}
