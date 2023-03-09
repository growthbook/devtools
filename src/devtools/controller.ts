import {
  ErrorMessage,
  Message,
  RefreshMessage,
  SetOverridesMessage,
} from "../../devtools";

const isProd = process.env.NODE_ENV === "production";

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

if (isProd) {
  chrome.runtime.onMessage.addListener(
    async (msg: RefreshMessage | ErrorMessage) => {
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
}

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

if (!isProd) {
  const mockData: RefreshMessage = {
    type: "GB_REFRESH",
    features: {
      isCoolFeatureEnabled: {
        defaultValue: false,
        rules: [],
      },
    },
    experiments: {},
    attributes: {
      test: 123,
    },
    overrides: {},
  };

  setTimeout(() => {
    refreshListeners.forEach((cb) => {
      cb("", mockData);
    });
  }, 1000);
}
