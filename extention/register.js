document.getElementById("registerButton").addEventListener("click", () => {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();

    if (username && password) {
        chrome.storage.local.get("users", (data) => {
            const users = data.users || {};
            if (users[username]) {
                alert("Username already exists.");
            } else {
                users[username] = password;
                chrome.storage.local.set({ users: users }, () => {
                    alert("Registration successful! You can now log in.");
                    window.location.href = "popup.html";
                });
            }
        });
    } else {
        alert("Please enter a valid username and password.");
    }
});
