import type { Message } from "../types";

// On message from page
window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;
  //console.log("content script received message from page", data.type, data);

  // Forward onto devtools
  if (data.type === "GB_REFRESH") {
    chrome.runtime.sendMessage(data);
  }
});

// On message from devtools
chrome.runtime.onMessage.addListener((msg: Message) => {
  //console.log("content script received message from devtools", msg.type, msg);

  // Forward onto page
  if (msg.type === "GB_REQUEST_REFRESH") {
    window.postMessage(msg, "*");
  } else if (msg.type === "GB_SET_OVERRIDES") {
    window.postMessage(msg, "*");
  }
});

// Inject page script
const script = document.createElement('script');
script.async = true;
script.src = chrome.runtime.getURL('static/js/page.js');
document.body.appendChild(script);