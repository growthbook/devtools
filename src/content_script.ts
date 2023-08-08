import type { Message } from "../devtools";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
} from "./visual_editor/lib/constants";
import { loadApiKey, saveApiKey } from "./visual_editor/lib/storage";

const visualEditorQueryParams = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const visualChangesetId = urlParams.get(VISUAL_CHANGESET_ID_PARAMS_KEY);
  const experimentUrl = urlParams.get(EXPERIMENT_URL_PARAMS_KEY);
  const apiHost = urlParams.get(API_HOST_PARAMS_KEY);

  if (!visualChangesetId || !experimentUrl || !apiHost) {
    return null;
  }

  return {
    visualChangesetId: decodeURIComponent(visualChangesetId),
    experimentUrl: decodeURIComponent(experimentUrl),
    apiHost: decodeURIComponent(apiHost),
  };
})();

window.addEventListener("message", function (msg: MessageEvent<Message>) {
  const data = msg.data;
  const devtoolsMessages = ["GB_REFRESH", "GB_ERROR"];

  if (devtoolsMessages.includes(data.type)) {
    chrome.runtime.sendMessage(data);
  }

  // TODO clean up
  if (data?.type === "GB_REQUEST_OPEN_VISUAL_EDITOR") {
    saveApiKey(data.data);
    window.postMessage(
      { type: "GB_RESPONSE_OPEN_VISUAL_EDITOR" },
      window.location.origin
    );
  }

  // TODO move to separate file
  if (data.type === "GB_REQUEST_LOAD_VISUAL_CHANGESET") {
    // fetch visual changesets (via background script)
    // 1. send message to background script
    // 2. background script fetches visual changeset
    // 3. background script sends response message to content script
    // 4. content script sends response message to visual editor
    // TODO refine typing
    chrome.runtime.sendMessage<
      any,
      { visualChangeset: any; experiment: any; error: any }
    >(
      {
        type: "GET_VISUAL_CHANGESET",
        data: {
          apiHost: visualEditorQueryParams?.apiHost,
          visualChangesetId: visualEditorQueryParams?.visualChangesetId,
        },
      },
      (resp) => {
        if (!resp || resp?.error) {
          return;
        }

        const { visualChangeset, experiment } = resp;

        window.postMessage(
          {
            type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET",
            data: {
              visualChangeset,
              experiment,
            },
          },
          window.location.origin
        );
      }
    );
  }
});

chrome.runtime.onMessage.addListener(async (msg: Message) => {
  const devtoolsMessages = ["GB_REQUEST_REFRESH", "GB_SET_OVERRIDES"];

  if (devtoolsMessages.includes(msg.type)) {
    window.postMessage(msg, window.location.origin);
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
  !!visualEditorQueryParams
) {
  const script = document.createElement("script");
  script.id = VISUAL_EDITOR_SCRIPT_ID;
  script.async = true;
  script.src = chrome.runtime.getURL("js/visual_editor.js");

  document.body.appendChild(script);
}
