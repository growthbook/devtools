import type { Message } from "../devtools";
import {
  loadApiHost,
  loadApiKey,
  saveApiHost,
  saveApiKey,
} from "./utils/storage";

// Pass along messages from content script -----> devtools, popup, etc.
window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;
  const devtoolsMessages = ["GB_REFRESH", "GB_ERROR"];

  if (devtoolsMessages.includes(data.type)) {
    chrome.runtime.sendMessage(data);
  }

  if (data.type === "GB_REQUEST_API_CREDS") {
    Promise.all([loadApiKey(), loadApiHost()]).then(([apiKey, apiHost]) => {
      window.postMessage(
        { type: "GB_RESPONSE_API_CREDS", apiKey, apiHost },
        "*"
      );
    });
  }

  if (data.type === "GB_REQUEST_OPTIONS_URL") {
    window.postMessage(
      {
        type: "GB_RESPONSE_OPTIONS_URL",
        url: chrome.runtime.getURL("options.html"),
      },
      "*"
    );
  }

  if (data.type === "GB_SAVE_API_CREDS") {
    const { apiHost, apiKey } = data;
    Promise.all([saveApiKey(apiKey), saveApiHost(apiHost)]).then(
      ([apiKey, apiHost]) => {
        window.postMessage(
          { type: "GB_RESPONSE_API_CREDS", apiKey, apiHost },
          "*"
        );
      }
    );
  }
});

// Pass along messages from devtools, popup ----> content script
chrome.runtime.onMessage.addListener(async (msg: Message) => {
  const devtoolsMessages = ["GB_REQUEST_REFRESH", "GB_SET_OVERRIDES"];
  const popupMessages = ["GB_ENABLE_VISUAL_EDITOR", "GB_DISABLE_VISUAL_EDITOR"];

  if ([...devtoolsMessages, ...popupMessages].includes(msg.type)) {
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
  return !!urlParams.get("vc-id");
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
