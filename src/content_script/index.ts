import type { Message, BGOpenOptionsPageMessage } from "../../devtools";
import {
  genericDevtoolsMessagePassThrough,
  loadVisualEditorQueryParams,
  visualEditorLoadChangesetRequest,
  visualEditorOpenRequest,
  visualEditorTransformCopyRequest,
  visualEditorUpdateChangesetRequest,
} from "./pageMessageHandlers";

const DEVTOOLS_SCRIPT_ID = "gbdevtools-page-script";
const VISUAL_EDITOR_SCRIPT_ID = "gb-visual-editor-script";

// Listen for messages from the page
window.addEventListener("message", function (event: MessageEvent<Message>) {
  const data = event.data;
  switch (data?.type) {
    case "GB_REFRESH":
    case "GB_ERROR":
      genericDevtoolsMessagePassThrough(data);
      break;
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
    case "GB_OPEN_OPTIONS_PAGE":
      chrome.runtime.sendMessage<BGOpenOptionsPageMessage>({
        type: "BG_OPEN_OPTIONS_PAGE",
        data: null,
      });
      break;
    default:
      break;
  }
});

// Listen for messages from devtools, background, etc.
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  console.log("GB got message", msg);
  switch (msg.type) {
    case "GB_SET_OVERRIDES":
    case "GB_REQUEST_REFRESH":
    case "GB_REQUEST_OPEN_VISUAL_EDITOR":
    case "GB_REQUEST_CLOSE_VISUAL_EDITOR":
      // generic message pass through
      window.postMessage(msg, window.location.origin);
      break;
    default:
      break;
  }
  switch (msg.type) {
    case "GB_REQUEST_OPEN_VISUAL_EDITOR":
      injectVisualEditorScript();
      break;
  }
});

// Inject devtools content script
if (!document.getElementById(DEVTOOLS_SCRIPT_ID)) {
  const script = document.createElement("script");
  script.id = DEVTOOLS_SCRIPT_ID;
  script.async = true;
  script.src = chrome.runtime.getURL("js/devtools_embed_script.js");
  document.body.appendChild(script);
}

// Inject visual editor content script
if (
  !document.getElementById(VISUAL_EDITOR_SCRIPT_ID) &&
  !!loadVisualEditorQueryParams()
) {
  injectVisualEditorScript();
}

function injectVisualEditorScript() {
  let script: HTMLScriptElement | null = document.getElementById(VISUAL_EDITOR_SCRIPT_ID) as HTMLScriptElement;
  if (script) {
    console.log("Visual editor already loading, skipping embed.");
    return;
  }
  script = document.createElement("script");
  script.id = VISUAL_EDITOR_SCRIPT_ID;
  script.async = true;
  script.charset = "utf-8";
  script.src = chrome.runtime.getURL("js/visual_editor.js");

  document.body.appendChild(script);
}
