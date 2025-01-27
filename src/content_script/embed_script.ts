import type { Experiment, GrowthBook } from "@growthbook/growthbook";
import type { ErrorMessage, Message, RefreshMessage } from "devtools";
import useTabState from "@/app/hooks/useTabState";
import { Attributes } from "@growthbook/growthbook";
import { update } from "lodash";
import { m } from "framer-motion";

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
  const [attributes, _setAttributes] = useTabState("attributes", gb.getAttributes());
  const [features, _setFeatures] = useTabState("attributes", gb.getFeatures());

  const msg: RefreshMessage = {
    type: "GB_REFRESH",
    attributes,
    features,
    overrides: (gb as any).context?.overrides || {},
    experiments,
    url: window.location.href,
    clientKey,
    apiHost,
  };

  return msg;
}


// Send a refresh message back to content script
function init() {
  onGrowthBookLoad((gb) => {
    setupListeners();
    pushSDKUpdate();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        pushSDKUpdate();
      }
    });
  });
}



function pushSDKUpdate(){
  onGrowthBookLoad((gb) => {
    const msg = getRefreshMessage(gb);
    chrome.runtime.sendMessage({type: "GB_SDK_UPDATED", data: msg});
  });
}
function setupListeners() {
  // listen for state change events that will effect the SDK
  chrome.runtime.onMessage.addListener((message: {type: string, data: unknown}) => {
    switch (message.type) {
      case "GB_UPDATE_ATTRIBUTES":
        updateAttributes(message.data);
      case "GB_UPDATE_FEATURES":
        updateFeatures(message.data);
      case "GB_UPDATE_EXPERIMENTS":
        updateExperiments(message.data);
      default: 
        return;
  }
  });
}

function updateAttributes(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (typeof data === "object" && data !== null) {
      gb.setAttributeOverrides(data as Attributes);
    } else {
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid attributes data",
      };
    }
  });
}

function updateFeatures(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (typeof data === "object" && data !== null) {
      gb.setForcedFeatures(new Map(Object.entries(data as Record<string, any>)));
    } else {
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid features data",
      };
    }
  });
}

function updateExperiments(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (Array.isArray(data)) {
      data.forEach((experiment) => {
        if (experiment.id && experiment.forcedVariation) {
          gb.setForcedVariations({ [experiment.id]: experiment.forcedVariation });
        } else {
          const msg: ErrorMessage = {
            type: "GB_ERROR",
            error: "Invalid experiment data",
          };
        }
      });
    } else {
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid experiments data",
      };
    }
  });
}

// start running
init();
