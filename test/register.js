document.getElementById("registerButton").addEventListener("click", registerUser);

function registerUser() {
  const newUsername = document.getElementById("newUsername").value;
  const newPassword = document.getElementById("newPassword").value;

  chrome.storage.local.get("users", (data) => {
    const users = data.users || {};
    if (users[newUsername]) {
      alert("Username already exists.");
    } else {
      users[newUsername] = newPassword;
      chrome.storage.local.set({ users: users }, () => {
        alert("User registered successfully!");
        window.location.href = "login.html";  // Redirect to login page after registration
      });
    }
  });
}
