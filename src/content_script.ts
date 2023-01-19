import type { Message } from "../devtools";

// On message from embed_script
window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;

  // Forward onto devtools
  if (data.type === "GB_REFRESH") {
    chrome.runtime.sendMessage(data);
  } else if (data.type === "GB_ERROR") {
    chrome.runtime.sendMessage(data);
  }
});

// On message from devtools
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  // Forward onto embed_script
  if (msg.type === "GB_REQUEST_REFRESH") {
    window.postMessage(msg, "*");
  } else if (msg.type === "GB_SET_OVERRIDES") {
    window.postMessage(msg, "*");
  }
});

// Inject embed_script script
const SCRIPT_ID = "gbdevtools-page-script";
if (!document.getElementById(SCRIPT_ID)) {
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = chrome.runtime.getURL("js/devtools_embed_script.js");
  document.body.appendChild(script);
}
