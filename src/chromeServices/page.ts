import type { Experiment, GrowthBook } from "@growthbook/growthbook";
import type { ErrorMessage, Message, RefreshMessage } from "../types";

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
    window.postMessage(msg, "*");
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
      error: "Timed out waiting for GrowthBook SDK instance",
    };
    window.postMessage(msg, "*");
  }, 5000);

  document.addEventListener(
    "gbloaded",
    () => {
      clearTimeout(timer);
      getValidGrowthBookInstance(cb);
    },
    false
  );
}


function getRefreshMessage(gb: GrowthBook): RefreshMessage {
  let experiments: Record<string, Experiment> = {};
  gb.getAllResults().forEach((v, k) => {
    experiments[k] = v.experiment;
  });

  const msg: RefreshMessage = {
    type: "GB_REFRESH",
    attributes: gb.getAttributes(),
    features: gb.getFeatures(),
    overrides: (gb as any).context?.overrides || {},
    experiments,
  };

  return msg;
}

// Sync changes to devtools if there are any
let lastMsg: string = "";
function syncToDevtools(gb: GrowthBook) {
  const msg = getRefreshMessage(gb);
  const hash = JSON.stringify(msg);
  if (hash !== lastMsg) {
    lastMsg = hash;
    window.postMessage(msg, "*");
  }
}

// Send a refresh message back to content script
function requestRefresh() {
  onGrowthBookLoad((gb) => {
    syncToDevtools(gb);
  });
}

// Listen for events from content script
window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;
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
  }, 1000);
});

// Request a refresh on load
requestRefresh();
