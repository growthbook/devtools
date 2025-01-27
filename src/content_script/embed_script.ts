import type { Experiment, GrowthBook } from "@growthbook/growthbook";
import type { ErrorMessage, Message, RefreshMessage } from "devtools";

declare global {
  interface Window {
    _growthbook?: GrowthBook;
  }
}

function getValidGrowthBookInstance(cb: (gb: GrowthBook) => void) {
  if (!window._growthbook) return false;

  if (!window._growthbook.setAttributeOverrides) {
    const msg: ErrorMessage = {
      type: "GB_ERROR",
      error: "Requires minimum Javascript SDK version of 0.16.0",
    };
    window.postMessage(msg, window.location.origin);
  } else {
    cb(window._growthbook);
  }
  return true;
}

// Wait for window._growthbook to be available
function onGrowthBookLoad(cb: (gb: GrowthBook) => void) {
  if (getValidGrowthBookInstance(cb)) return;
  let timer = window.setTimeout(() => {
    const msg: ErrorMessage = {
      type: "GB_ERROR",
      error:
        "Unable to locate GrowthBook SDK instance. Please ensure you are using either the Javascript or React SDK, and Dev Mode is enabled.",
    };
    window.postMessage(msg, window.location.origin);
  }, 5000);

  document.addEventListener(
    "gbloaded",
    () => {
      clearTimeout(timer);
      getValidGrowthBookInstance(cb);
    },
    false,
  );
}

function getRefreshMessage(gb: GrowthBook): RefreshMessage {
  const [apiHost, clientKey] = gb.getApiInfo();

  let experiments: Record<string, Experiment<any>> = {};
  gb.getAllResults().forEach((v, k) => {
    experiments[k] = v.experiment;
  });

  const msg: RefreshMessage = {
    type: "GB_REFRESH",
    attributes: gb.getAttributes(),
    features: gb.getFeatures(),
    overrides: (gb as any).context?.overrides || {},
    experiments,
    url: window.location.href,
    clientKey,
    apiHost,
  };

  return msg;
}

function handleSdkChange(gb?: GrowthBook) {
  if (document.visibilityState !== "visible") return;
  const msg = {
    type: "BG_SET_SDK_USAGE_DATA",
    data: {
      // todo: sdk health check data
      sdkFound: !!gb,
      sdkVersion: gb?.version,
    },
  };
  window.postMessage(msg, window.location.origin);
}

// Sync changes to devtools if there are any
function syncToDevtools(gb: GrowthBook) {
  if (document.visibilityState !== "visible") return;
  const msg = getRefreshMessage(gb);
    window.postMessage(msg, window.location.origin);
}

// Send a refresh message back to content script
function requestRefresh() {
  onGrowthBookLoad((gb) => {
    syncToDevtools(gb);
  });
}

// Listen for events from content script
window.addEventListener("message", function (event: MessageEvent<Message>) {
  if (document.visibilityState !== "visible") return;
  const data = event.data;
  if (data.type === "GB_REQUEST_REFRESH") {
    requestRefresh();
  } else if (data.type === "GB_SET_OVERRIDES") {
    onGrowthBookLoad((gb) => {
      gb.setForcedFeatures(new Map(Object.entries(data.features || {})));
      gb.setForcedVariations(data.variations || {});
      gb.setAttributeOverrides(data.attributes || {});

      syncToDevtools(gb);
    });
  }
});

// Sync changes to devtools every second
onGrowthBookLoad((gb) => {
  window.setInterval(() => {
    syncToDevtools(gb);
    handleSdkChange(gb);
  }, 1000);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    handleSdkChange();
  }
});

// Request a refresh on load
requestRefresh();

// Keep a connection to
window.setInterval(() => {
  if (window._growthbook) return;
  handleSdkChange();
}, 1000);
