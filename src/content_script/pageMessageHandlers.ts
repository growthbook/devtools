import {
  BackgroundFetchVisualChangsetMessage,
  ErrorMessage,
  OpenVisualEditorRequestMessage,
  RefreshMessage,
} from "../../devtools";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
} from "../visual_editor/lib/constants";
import { saveApiKey } from "../visual_editor/lib/storage";

export const genericDevtoolsMessagePassThrough = (
  message: RefreshMessage | ErrorMessage
) => {
  chrome.runtime.sendMessage(message);
};

// 1. save key to local storage
// 2. send response message to content script
export const visualEditorOpenRequest = (
  message: OpenVisualEditorRequestMessage
) => {
  saveApiKey(message.data);
  window.postMessage(
    { type: "GB_RESPONSE_OPEN_VISUAL_EDITOR" },
    window.location.origin
  );
};

// util to load visual editor query params from URL
export const loadVisualEditorQueryParams = () => {
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
};

export const visualEditorLoadChangesetRequest = () => {
  const visualEditorQueryParams = loadVisualEditorQueryParams();

  if (!visualEditorQueryParams) return;

  chrome.runtime.sendMessage<
    BackgroundFetchVisualChangsetMessage,
    { visualChangeset: any; experiment: any; error: any }
  >(
    {
      type: "GET_VISUAL_CHANGESET",
      data: {
        apiHost: visualEditorQueryParams.apiHost,
        visualChangesetId: visualEditorQueryParams.visualChangesetId,
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
};
