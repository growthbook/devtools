import type { BGMessage, Message } from "devtools";
import {
  loadVisualEditorQueryParams,
  visualEditorLoadChangesetRequest,
  visualEditorOpenRequest,
  visualEditorTransformCopyRequest,
  visualEditorUpdateChangesetRequest,
} from "@/content_script/pageMessageHandlers";

const forceLoadVisualEditor = false;
export const SESSION_STORAGE_TAB_STATE_KEY = "growthbook-devtools-tab-state";

// Tab-specific state store
// has a write-through cache in memory and is persisted to sessionStorage
let state: Record<string, any> = {};
try {
  state = JSON.parse(
    window.sessionStorage.getItem(SESSION_STORAGE_TAB_STATE_KEY) || "{}"
  );
} catch (e) {
  console.error("Failed to parse saved tab state");
}

function getState(property: string): { state?: any; success: boolean } {
  if (property in state) {
    return { state: state?.[property], success: true };
  } else {
    return { success: false };
  }
}
function setState(property: string, value: any) {
  state[property] = value;
  window.sessionStorage.setItem(
    SESSION_STORAGE_TAB_STATE_KEY,
    JSON.stringify(state)
  );
}

// Listen for messages from the App
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "getState") {
    const result = getState(message.property); // Get state based on property
    const { state: stateValue, success } = result;
    if (success) {
      sendResponse({ state: stateValue });
    } else {
      sendResponse({});
    }
  }
  if (message.type === "setState") {
    setState(message.property, message.value); // Update the state property
    sendResponse({ success: true });
  }
  return true;
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
      case "GB_REFRESH":
      case "GB_ERROR":
      case "BG_SET_SDK_USAGE_DATA":
        // passthrough to background worker:
        chrome.runtime.sendMessage(data);
        break;
      default:
        break;
    }
  }
);

// Listen for messages from devtools, background, etc.
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  switch (msg.type) {
    case "GB_SET_OVERRIDES":
    case "GB_REQUEST_REFRESH":
      // generic message pass through
      window.postMessage(msg, window.location.origin);
      break;
    default:
      break;
  }
  return true;
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
