import { Message, RefreshMessage, SetOverridesMessage } from "./types";

// Send message to content script
function sendMessage(msg: Message) {
  chrome.tabs &&
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        console.log(
          "sending message to content script",
          tabs[0].id,
          msg.type,
          msg
        );
        chrome.tabs.sendMessage(tabs[0].id || 0, msg);
      }
    );
}

// Listen for updates from content script and forward to any listeners
let refreshListeners: Set<(data: RefreshMessage) => void> = new Set();
export function onGrowthBookData(cb: (data: RefreshMessage)=>void) {
  refreshListeners.add(cb);
  return () => {
    refreshListeners.delete(cb);
  }
}
chrome.runtime.onMessage.addListener((msg: RefreshMessage) => {
  console.log("received message in devtools", msg.type, msg);

  if(msg.type === "GB_REFRESH") {
    refreshListeners.forEach((cb) => {
      cb(msg);
    })
  }
});

export function requestRefresh() {
  sendMessage({
    type: "GB_REQUEST_REFRESH"
  });
}

export function setOverrides(data: Omit<SetOverridesMessage, "type">) {
  sendMessage({
    type: "GB_SET_OVERRIDES",
    ...data
  });
}