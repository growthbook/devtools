import {
  BGUpdateVisualChangsetMessage,
  ErrorMessage,
  LoadVisualChangesetRequestMessage,
  OpenVisualEditorRequestMessage,
  RefreshMessage,
  UpdateVisualChangesetRequestMessage,
  TransformCopyRequestMessage,
  BGTransformCopyMessage,
  BGLoadVisualChangsetMessage,
  UpdateVisualChangesetResponseMessage,
  LoadVisualChangesetResponseMessage,
  TransformCopyResponseMessage,
} from "../../devtools";
import {
  FetchVisualChangesetPayload,
  TransformCopyPayload,
  UpdateVisualChangesetPayload,
} from "../background";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
} from "../visual_editor/lib/constants";
import {
  saveApiHost,
  saveApiKey,
  saveExperimentUrl,
} from "../visual_editor/lib/storage";

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
  if (!message.data?.apiKey || !message.data?.apiHost) {
    // TODO send error message back
    console.error(
      "For some reason, the message data is missing either the API key or API host.",
      message.data
    );
    return;
  }

  saveApiHost(message.data.apiHost);
  saveApiKey(message.data.apiKey);
  saveExperimentUrl(message.data.experimentUrl);

  window.postMessage(
    { type: "GB_RESPONSE_OPEN_VISUAL_EDITOR" },
    window.location.origin
  );
};

// util to load visual editor query params from URL
export const loadVisualEditorQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const visualChangesetId = urlParams.get(VISUAL_CHANGESET_ID_PARAMS_KEY);

  if (!visualChangesetId) {
    return null;
  }

  return {
    visualChangesetId: decodeURIComponent(visualChangesetId),
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
        visualChangesetId: msg.data.visualChangesetId,
      },
    },
    (resp) => {
      const message: LoadVisualChangesetResponseMessage = {
        type: "GB_RESPONSE_LOAD_VISUAL_CHANGESET",
        data: {
          ...resp,
        },
      };

      window.postMessage(message, window.location.origin);
    }
  );
};

export const visualEditorUpdateChangesetRequest = (
  msg: UpdateVisualChangesetRequestMessage
) => {
  chrome.runtime.sendMessage<
    BGUpdateVisualChangsetMessage,
    UpdateVisualChangesetPayload
  >(
    {
      type: "BG_UPDATE_VISUAL_CHANGESET",
      data: {
        visualChangesetId: msg.data.visualChangesetId,
        updatePayload: msg.data.updatePayload,
      },
    },
    (resp) => {
      const message: UpdateVisualChangesetResponseMessage = {
        type: "GB_RESPONSE_UPDATE_VISUAL_CHANGESET",
        data: {
          ...resp,
        },
      };

      window.postMessage(message, window.location.origin);
    }
  );
};

export const visualEditorTransformCopyRequest = (
  msg: TransformCopyRequestMessage
) => {
  chrome.runtime.sendMessage<BGTransformCopyMessage, TransformCopyPayload>(
    {
      type: "BG_TRANSFORM_COPY",
      data: {
        visualChangesetId: msg.data.visualChangesetId,
        copy: msg.data.copy,
        mode: msg.data.mode,
      },
    },
    (resp) => {
      const message: TransformCopyResponseMessage = {
        type: "GB_RESPONSE_TRANSFORM_COPY",
        data: {
          ...resp,
        },
      };
      window.postMessage(message, window.location.origin);
    }
  );
};
