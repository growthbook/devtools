import {
  ErrorMessage,
  Message,
  RefreshMessage,
  SetOverridesMessage,
} from "../../devtools";
import MessageSender = chrome.runtime.MessageSender;

// Send message to content script
async function sendMessage(msg: Message) {
  if (chrome.tabs) {
    let tabId: number | undefined = chrome.devtools?.inspectedWindow?.tabId;
    if (!tabId) {
      await new Promise<void>((resolve) => {
        chrome.windows.getLastFocused((window) => {
          chrome.tabs.query({ active: true, windowId: window.id }, (tabs) => {
            if (tabs.length > 0) {
              const activeTab = tabs[0];
              tabId = activeTab.id;
              resolve();
            }
          });
        });
      });
    }
    await chrome.tabs.sendMessage(tabId || 0, msg);
  }
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
  }
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

export function requestOpenVisualEditor(data: {
  apiHost: string | null;
  apiKey: string | null;
  source: string;
}) {
  sendMessage({
    type: "GB_REQUEST_OPEN_VISUAL_EDITOR",
    data: {
      apiHost: data.apiHost,
      apiKey: data.apiKey,
      source: data.source,
    },
  });
}

export function requestCloseVisualEditor() {
  sendMessage({
    type: "GB_REQUEST_CLOSE_VISUAL_EDITOR",
  });
}
