import type { Experiment, GrowthBook } from "@growthbook/growthbook";
import type { ErrorMessage, Message, RefreshMessage } from "devtools";
import useTabState from "@/app/hooks/useTabState";
import { Attributes } from "@growthbook/growthbook";
import { at, has, update } from "lodash";
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
  updateTabState("url", window.location.href || "");
  onGrowthBookLoad((gb) => {
    pushSDKUpdate(gb);
    if (gb) {
      updateTabState("attributes", gb.getAttributes());
      updateTabState("features", gb.getFeatures());
      updateTabState("experiments", gb.getExperiments());
      updateTabState("forcedFeatures", gb.getForcedFeatures());
      updateTabState("forcedVariations", gb.getForcedVariations());
    }
  });
}

function pushSDKUpdate(gb?: GrowthBook) {
  updateTabState("sdkFound", !!gb);
  updateTabState("sdkVersion", gb?.version);
  updateBackgroundSDK(gb);
}

function setupListeners() {
  // listen for state change events that will affect the SDK
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (typeof message !== "object" || message === null) return;

    switch (message.type) {
      case "GB_UPDATE_ATTRIBUTES":
        // setAttributes:
        updateAttributes(message.data);
        break;
      case "GB_UPDATE_FEATURES":
        // setForcedFeatures:
        updateFeatures(message.data);
        break;
      case "GB_UPDATE_EXPERIMENTS":
        // setForcedVariations:
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
      gb.setAttributes(data as Attributes);
    } else {
      // todo: do something with these messages or remove them
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid attributes data",
      };
    }
  });
}

function updateFeatures(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (data) {
      gb.setForcedFeatures(
        data instanceof Map
          ? data
          : new Map(Object.entries(data as Record<string, any>)),
      );
    } else {
      // todo: do something with these messages or remove them
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
          // todo: do something with these messages or remove them
          const msg: ErrorMessage = {
            type: "GB_ERROR",
            error: "Invalid experiment data",
          };
        }
      });
    } else {
      // todo: do something with these messages or remove them
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid experiments data",
      };
    }
  });
}

function updateBackgroundSDK(gb?: GrowthBook) {
  window.postMessage(
    {
      type: "GB_SDK_UPDATED",
      data: {
        sdkFound: !!gb,
        sdkVersion: gb?.version || null,
      },
    },
    window.location.origin,
  );
}

// send a message that the tabstate has been updated
function updateTabState(property: string, value: unknown) {
  try {
    console.log("posting message");
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
  } catch (error) {
    console.log("shoot this is not working");
  }
}

// start running
init();
