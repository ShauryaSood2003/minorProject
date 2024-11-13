if (!document.getElementById("chatbot-sidebar")) {
    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("sidebar.html");
    iframe.id = "chatbot-sidebar";
    iframe.style.cssText = `
      position: fixed;
      right: 0;
      top: 0;
      width: 300px;
      height: 100%;
      border: none;
      z-index: 10000;
    `;
    document.body.appendChild(iframe);
  }
  