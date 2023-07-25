import type { Message } from "../devtools";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
  AUTH_TOKEN_KEY,
} from "./visual_editor/lib/constants";
import { loadApiKey, saveApiKey } from "./visual_editor/lib/storage";

// Pass along messages from content script -----> devtools, popup, etc.
window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;
  const devtoolsMessages = ["GB_REFRESH", "GB_ERROR"];

  if (devtoolsMessages.includes(data.type)) {
    chrome.runtime.sendMessage(data);
  }

  if (data.type === "GB_OPEN_VISUAL_EDITOR") {
    saveApiKey(data.data);
  }

  if (data.type === "GB_REQUEST_API_CREDS") {
    loadApiKey().then((apiKey) => {
      window.postMessage(
        { type: "GB_RESPONSE_API_CREDS", apiKey },
        window.location.origin
      );
    });
  }
});

// Pass along messages from devtools, popup ----> content script
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  const devtoolsMessages = ["GB_REQUEST_REFRESH", "GB_SET_OVERRIDES"];
  const visualEditorMessages = ["GB_OPEN_VISUAL_EDITOR"];

  if ([...devtoolsMessages, ...visualEditorMessages].includes(msg.type)) {
    window.postMessage(msg, "*");
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

const hasVisualEditorQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return (
    !!urlParams.get(VISUAL_CHANGESET_ID_PARAMS_KEY) &&
    !!urlParams.get(EXPERIMENT_URL_PARAMS_KEY) &&
    !!urlParams.get(API_HOST_PARAMS_KEY)
  );
};

// Inject visual editor content script
const VISUAL_EDITOR_SCRIPT_ID = "visual-editor-script";
if (
  !document.getElementById(VISUAL_EDITOR_SCRIPT_ID) &&
  hasVisualEditorQueryParams()
) {
  const script = document.createElement("script");
  script.id = VISUAL_EDITOR_SCRIPT_ID;
  script.async = true;
  script.src = chrome.runtime.getURL("js/visual_editor.js");
  document.body.appendChild(script);
}
