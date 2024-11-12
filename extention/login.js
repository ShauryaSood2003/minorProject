document.getElementById("loginButton").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    chrome.storage.local.get("users", (data) => {
        const users = data.users || {};
        if (users[username] === password) {
            chrome.storage.local.set({ loggedInUser: username }, () => {
                window.location.href = "chat.html";
            });
        } else {
            alert("Invalid username or password.");
        }
    });
});

