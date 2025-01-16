import {
  BGMessage,
  ErrorMessage,
  Message,
  RefreshMessage,
  SetOverridesMessage,
} from "../../devtools";
import MessageSender = chrome.runtime.MessageSender;

// Send message to content script
function sendMessage(msg: Message) {
  if (chrome.tabs && chrome.devtools?.inspectedWindow) {
    const { tabId } = chrome.devtools.inspectedWindow;
    chrome.tabs.sendMessage(tabId || 0, msg);
  }
}

// Send message to background worker
function sendBGMessage(msg: BGMessage) {
  chrome.runtime.sendMessage(msg);
}

// Listen for updates from content script and forward to any listeners
let refreshListeners: Set<(err: string, data: RefreshMessage | null) => void> =
  new Set();
export function onGrowthBookData(
  cb: (err: string, data: RefreshMessage | null) => void,
) {
  refreshListeners.add(cb);
  return () => {
    refreshListeners.delete(cb);
  };
}

chrome.runtime.onMessage.addListener(
  async (msg: RefreshMessage | ErrorMessage, sender: MessageSender) => {
    if (sender.tab?.id !== chrome.devtools?.inspectedWindow?.tabId) {
      return;
    }

    if (msg.type === "GB_REFRESH") {
      refreshListeners.forEach((cb) => {
        cb("", msg);
      });
    } else if (msg.type === "GB_ERROR") {
      refreshListeners.forEach((cb) => {
        cb(msg.error, null);
      });
    }
  },
);

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

export function setSDKUsageData(data: Record<string, any>) {
  const tabId = chrome.devtools.inspectedWindow.tabId;
  sendBGMessage({
    type: "BG_SET_SDK_USAGE_DATA",
    data: { tabId, ...data },
  });
}
