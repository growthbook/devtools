import {
  BGUpdateVisualChangsetMessage,
  ErrorMessage,
  LoadVisualChangesetRequestMessage,
  OpenVisualEditorRequestMessage,
  RefreshMessage,
  UpdateVisualChangesetRequestMessage,
  ApiUpdateVisualChangesetResponse,
  TransformCopyRequestMessage,
  BGTransformCopyMessage,
  ApiTransformCopyResponse,
  BGLoadVisualChangsetMessage,
} from "../../devtools";
import { FetchVisualChangesetPayload } from "../background";
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

export const visualEditorLoadChangesetRequest = (
  msg: LoadVisualChangesetRequestMessage
) => {
  chrome.runtime.sendMessage<
    BGLoadVisualChangsetMessage,
    FetchVisualChangesetPayload
  >(
    {
      type: "BG_LOAD_VISUAL_CHANGESET",
      data: {
        apiHost: msg.data.apiHost,
        visualChangesetId: msg.data.visualChangesetId,
      },
    },
    (resp) => {
      const { visualChangeset, experiment, error } = resp;
      window.postMessage(
        {
          type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET",
          data: {
            visualChangeset,
            experiment,
            error,
          },
        },
        window.location.origin
      );
    }
  );
};

export const visualEditorUpdateChangesetRequest = (
  msg: UpdateVisualChangesetRequestMessage
) => {
  chrome.runtime.sendMessage<
    BGUpdateVisualChangsetMessage,
    ApiUpdateVisualChangesetResponse
  >(
    {
      type: "BG_UPDATE_VISUAL_CHANGESET",
      data: {
        apiHost: msg.data.apiHost,
        visualChangesetId: msg.data.visualChangesetId,
        updatePayload: msg.data.updatePayload,
      },
    },
    (resp) => {
      window.postMessage(
        {
          type: "GB_RESPONSE_UPDATE_VISUAL_CHANGESET",
          data: {
            error: resp.error,
          },
        },
        window.location.origin
      );
    }
  );
};

export const visualEditorTransformCopyRequest = (
  msg: TransformCopyRequestMessage
) => {
  chrome.runtime.sendMessage<BGTransformCopyMessage, ApiTransformCopyResponse>(
    {
      type: "BG_TRANSFORM_COPY",
      data: {
        apiHost: msg.data.apiHost,
        copy: msg.data.copy,
        mode: msg.data.mode,
      },
    },
    (resp) => {
      window.postMessage(
        {
          type: "GB_RESPONSE_TRANSFORM_COPY",
          data: {
            transformed: resp.transformed,
            dailyLimitReached: resp.dailyLimitReached,
            error: resp.error,
          },
        },
        window.location.origin
      );
    }
  );
};
