import type { BGMessage, Message } from "devtools";
import {
  loadVisualEditorQueryParams,
  visualEditorLoadChangesetRequest,
  visualEditorOpenRequest,
  visualEditorTransformCopyRequest,
  visualEditorUpdateChangesetRequest,
} from "@/content_script/pageMessageHandlers";

const forceLoadVisualEditor = false;
let tabId: number | undefined;

export const SESSION_STORAGE_TAB_STATE_KEY = "growthbook-devtools-tab-state";

// Special state variables will push their updates to the embed script / SDK when changed:
const propertiesWithCustomMessage: Record<string, string> = {
  overriddenAttributes: "GB_UPDATE_ATTRIBUTES", // setOverriddenAttributes
  forcedFeatures: "GB_UPDATE_FEATURES", // setForcedFeatures
  forcedVariations: "GB_UPDATE_EXPERIMENTS", // setForcedVariations
};

// Tab-specific state store
// has a write-through cache in memory and is persisted to sessionStorage
let state: Record<string, any> = {};
try {
  state = JSON.parse(
    window.sessionStorage.getItem(SESSION_STORAGE_TAB_STATE_KEY) || "{}",
  );
} catch (e) {
  console.error("Failed to parse saved tab state");
}
// Listen for messages from the Embed script
window.addEventListener(
  "message",
  function (event: MessageEvent<Message | BGMessage>) {
    const data = event.data;
    if (data?.type === "UPDATE_TAB_STATE") {
      const { property, value } = data.data;
      const shouldAppend = data.append;
      const { state: currentValue, success } = getState(property);
      if (
        shouldAppend &&
        (Array.isArray(currentValue) || currentValue === undefined || !success)
      ) {
        if (currentValue === undefined || !success) {
          setState(property, [value], true);
        } else {
          setState(property, [...currentValue, value], true);
        }
      } else {
        setState(property, value, true);
      }
    }
  },
);

// Helper functions to manage tab state
function getState(property: string): { state?: any; success: boolean } {
  if (property in state) {
    return { state: state?.[property], success: true };
  } else {
    return { success: false };
  }
}
function setState(property: string, value: any, skipPostMessage?: boolean) {
  state[property] = value;
  window.sessionStorage.setItem(
    SESSION_STORAGE_TAB_STATE_KEY,
    JSON.stringify(state),
  );
  chrome.runtime.sendMessage({
    type: "tabStateChanged",
    property,
    value,
    tabId,
  });
  // send custom messages to Embed script for specific properties so that the Embed script can update the GB SDK
  if (!skipPostMessage && property in propertiesWithCustomMessage) {
    const customMessage =
      propertiesWithCustomMessage[
        property as keyof typeof propertiesWithCustomMessage
      ];
    window.postMessage(
      { type: customMessage, data: value },
      window.location.origin,
    );
  }
}

function pushAllOverrides() {
  Object.keys(propertiesWithCustomMessage).forEach((stateProp) => {
    const { state: stateValue, success } = getState(stateProp);
    if (success) {
      window.postMessage(
        { type: propertiesWithCustomMessage[stateProp], data: stateValue },
        window.location.origin,
      );
    }
  });
}

// Listen for messages from the App
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  try {
    if (message.type === "getTabState") {
      const result = getState(message.property); // Get state based on property
      const { state: stateValue, success } = result;
      if (success) {
        chrome.runtime.sendMessage({
          type: "tabStateChanged",
          property: message.property,
          value: stateValue,
          tabId,
        });
      } else {
        chrome.runtime.sendMessage({
          type: "tabStateChanged",
          property: message.property,
          tabId,
          // not found, send empty message to signal unset
        });
      }
    }
    if (message.type === "setTabState") {
      setState(message.property, message.value); // Update the state property
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Error resolving tab state", error);
    sendResponse({ success: false, error: (error as Error).message });
  }
});

// Listen for messages from the page
window.addEventListener(
  "message",
  function (event: MessageEvent<Message | BGMessage>) {
    const data = event.data;
    switch (data?.type) {
      case "GB_REQUEST_OPEN_VISUAL_EDITOR":
        visualEditorOpenRequest(data);
        break;
      case "GB_REQUEST_LOAD_VISUAL_CHANGESET":
        visualEditorLoadChangesetRequest(data);
        break;
      case "GB_REQUEST_UPDATE_VISUAL_CHANGESET":
        visualEditorUpdateChangesetRequest(data);
        break;
      case "GB_REQUEST_TRANSFORM_COPY":
        visualEditorTransformCopyRequest(data);
        break;
      case "GB_ERROR":
      case "GB_SDK_UPDATED":
        // passthrough to background worker
        chrome.runtime.sendMessage(data);
        break;
      case "GB_REQUEST_OVERRIDES":
        pushAllOverrides();
        break;
      default:
        break;
    }
  },
);

// Listen for messages from devtools, background, etc.
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  switch (msg.type) {
    case "GB_SET_OVERRIDES":
      window.postMessage(msg, window.location.origin);
      break;
    case "GB_REQUEST_REFRESH":
      refreshSDK();
      break;
    case "COPY_TO_CLIPBOARD":
      window.postMessage(msg, window.location.origin);
      break;
    default:
      break;
  }
});

// Inject devtools content script
const DEVTOOLS_SCRIPT_ID = "gbdevtools-page-script";
if (!document.getElementById(DEVTOOLS_SCRIPT_ID)) {
  const script = document.createElement("script");
  script.id = DEVTOOLS_SCRIPT_ID;
  script.async = true;
  script.src = chrome.runtime.getURL("js/devtools_embed_script.js");
  document.body.appendChild(script);
}

// Inject visual editor content script
const VISUAL_EDITOR_SCRIPT_ID = "visual-editor-script";
if (
  !document.getElementById(VISUAL_EDITOR_SCRIPT_ID) &&
  (!!loadVisualEditorQueryParams() || forceLoadVisualEditor)
) {
  const script = document.createElement("script");
  script.id = VISUAL_EDITOR_SCRIPT_ID;
  script.async = true;
  script.charset = "utf-8";
  script.src = chrome.runtime.getURL("js/visual_editor.js");

  document.body.appendChild(script);
}
// check if the storage has been removed and reload the data from embed script
window.addEventListener("storage", (event) => {
  if (event.key === SESSION_STORAGE_TAB_STATE_KEY) {
    try {
      state = JSON.parse(
        window.sessionStorage.getItem(SESSION_STORAGE_TAB_STATE_KEY) || "{}",
      );
      if (!state) {
        refreshSDK();
      }
    } catch (e) {
      console.error("Failed to parse saved tab state");
    }
  }
});

function refreshSDK() {
  window.postMessage({ type: "GB_REQUEST_REFRESH" }, window.location.origin);
}

// Firefox: ask the background for the current tabId.
if (navigator.userAgent.includes("Firefox")) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SET_TAB_ID") {
      tabId = message.tabId;
    }
  });
  chrome.runtime.sendMessage({action: "GET_TAB_ID"});
}
