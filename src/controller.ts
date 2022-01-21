import {
  ErrorMessage,
  Message,
  RefreshMessage,
  SetOverridesMessage,
} from "./types";

// Send message to content script
function sendMessage(msg: Message) {
  chrome.tabs &&
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id || 0, msg);
      }
    );
}

// Listen for updates from content script and forward to any listeners
let refreshListeners: Set<(err: string, data: RefreshMessage | null) => void> =
  new Set();
export function onGrowthBookData(
  cb: (err: string, data: RefreshMessage | null) => void
) {
  refreshListeners.add(cb);
  return () => {
    refreshListeners.delete(cb);
  };
}
chrome.runtime.onMessage.addListener((msg: RefreshMessage | ErrorMessage) => {
  if (msg.type === "GB_REFRESH") {
    console.log('GB_REFRESH', msg);
    refreshListeners.forEach((cb) => {
      cb("", msg);
    });
  } else if (msg.type === "GB_ERROR") {
    refreshListeners.forEach((cb) => {
      cb(msg.error, null);
    });
  }
});

export function requestRefresh() {
  sendMessage({
    type: "GB_REQUEST_REFRESH",
  });
}

export function setOverrides(data: Omit<SetOverridesMessage, "type">) {
  sendMessage({
    type: "GB_SET_OVERRIDES",
    ...data,
  });
}
