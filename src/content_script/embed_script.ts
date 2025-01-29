import type { Experiment, GrowthBook } from "@growthbook/growthbook";
import type { ErrorMessage, SDKHealthCheckResult } from "devtools";
import useTabState from "@/app/hooks/useTabState";
import { Attributes } from "@growthbook/growthbook";
import { at, has, update } from "lodash";
import { m } from "framer-motion";
import { version } from "node_modules/@types/react";

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

// Send a refresh message back to content script
function init() {
  setupListeners();
  pushAppUpdates();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pushAppUpdates();
    }
  });
}

function pushAppUpdates() {
  onGrowthBookLoad((gb) => {
    pushSDKUpdate(gb);
    if (gb) {
      updateTabState("attributes", gb.getAttributes());
      updateTabState("features", gb.getForcedFeatures());
      updateTabState("experiments", gb.getForcedVariations());
    }
  });
}

async function pushSDKUpdate(gb?: GrowthBook) {
  const sdkData = await SDKHealthCheck(gb);
  const { canConnect, hasPayload, sdkFound, errorMessage } = sdkData;

  updateTabState("sdkData", sdkData);
  updateTabState("sdkVersion", gb?.version);
  updateBackgroundSDK(sdkData);
}

function setupListeners() {
  // listen for state change events that will effect the SDK
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (typeof message !== "object" || message === null) return;

    switch (message.type) {
      case "GB_UPDATE_ATTRIBUTES":
        updateAttributes(message.data);
        break;
      case "GB_UPDATE_FEATURES":
        updateFeatures(message.data);
        break;
      case "GB_UPDATE_EXPERIMENTS":
        updateExperiments(message.data);
        break;
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
      gb.setForcedFeatures(
        new Map(Object.entries(data as Record<string, any>)),
      );
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
          gb.setForcedVariations({
            [experiment.id]: experiment.forcedVariation,
          });
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

async function updateBackgroundSDK(data: SDKHealthCheckResult) {
  window.postMessage(
    {
      type: "GB_SDK_UPDATED",
      data,
    },
    window.location.origin
  );
}

// send a message that the tabstate has been updated
function updateTabState(property: string, value: unknown) {
    window.postMessage(
      {
        type: "UPDATE_TAB_STATE",
        data: {
          property,
          value,
        },
      },
      window.location.origin,
    );
}

async function SDKHealthCheck(gb?: GrowthBook): Promise<SDKHealthCheckResult> {
  if (!gb) {
    return {
      canConnect: false,
      hasPayload: false,
      sdkFound: false,
      errorMessage: "SDK not found"
    }
  } 
  const [apiHost, clientKey] = gb.getApiInfo();
  const hasPayload =  !!gb.getDecryptedPayload?.() || (Object.keys(gb.getFeatures()).length > 0 && gb.getExperiments().length > 0);

  if (!clientKey) {
    return {
      canConnect: false,
      hasClientKey: false,
      hasPayload,
      sdkFound: true,
      version: gb?.version,
      errorMessage: "No API Client Key found"
    };
  }
 const res = await fetch(`${apiHost}/api/features/${clientKey}`)
  if(res.status === 200) {
    return {
      canConnect: true,
      hasClientKey: true,
      hasPayload,
      version: gb?.version,
      sdkFound: true,
    };
  }
  else {
    const data = await res.json();

    return {
      canConnect: false,
      hasPayload,
      hasClientKey: true,
      errorMessage: data.error,
      version: gb?.version,
      sdkFound: true,
    };
  }
}

// start running
init();
