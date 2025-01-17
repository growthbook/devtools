import type {BGMessage, Message} from "../../devtools";
import {
  loadVisualEditorQueryParams,
  visualEditorLoadChangesetRequest,
  visualEditorOpenRequest,
  visualEditorTransformCopyRequest,
  visualEditorUpdateChangesetRequest,
} from "./pageMessageHandlers";

const forceLoadVisualEditor = false;

// Listen for messages from the page
window.addEventListener("message", function (event: MessageEvent<Message | BGMessage>) {
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
});

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
