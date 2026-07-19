import {
  BGUpdateVisualChangsetMessage,
  LoadVisualChangesetRequestMessage,
  OpenVisualEditorRequestMessage,
  UpdateVisualChangesetRequestMessage,
  TransformCopyRequestMessage,
  BGTransformCopyMessage,
  BGLoadVisualChangsetMessage,
  UpdateVisualChangesetResponseMessage,
  LoadVisualChangesetResponseMessage,
  TransformCopyResponseMessage,
} from "devtools";
import {
  FetchVisualChangesetPayload,
  TransformCopyPayload,
  UpdateVisualChangesetPayload,
} from "@/background/visualEditorHandlers";
import { VeDeprecationStatus } from "devtools";
import { VISUAL_CHANGESET_ID_PARAMS_KEY } from "@/visual_editor/lib/constants";
import { saveApiHost, saveApiKey } from "@/app/storage";

// 1. save key to local storage
// 2. send response message to content script
export const visualEditorOpenRequest = (
  message: OpenVisualEditorRequestMessage,
) => {
  if (!message.data?.apiKey || !message.data?.apiHost) {
    // TODO send error message back
    console.error(
      "For some reason, the message data is missing either the API key or API host.",
      message.data,
    );
    return;
  }

  saveApiHost(message.data.apiHost);
  saveApiKey(message.data.apiKey);

  window.postMessage(
    { type: "GB_RESPONSE_OPEN_VISUAL_EDITOR" },
    window.location.origin,
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
  msg: LoadVisualChangesetRequestMessage,
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
    },
  );
};

export const visualEditorUpdateChangesetRequest = (
  msg: UpdateVisualChangesetRequestMessage,
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
    },
  );
};

// Deprecation status for the legacy visual editor. The injection gate in
// index.ts fetches this from the background (which pings the standalone
// Visual Editor extension) before injecting the editor, and caches it here
// so the editor's own status request doesn't repeat the cross-extension ping.
let cachedVeDeprecationStatus: VeDeprecationStatus | null = null;

export const fetchVeDeprecationStatus = (): Promise<VeDeprecationStatus> =>
  new Promise((resolve) => {
    const fallback: VeDeprecationStatus = {
      newExtensionInstalled: false,
      dismissed: false,
      isFirefox: navigator.userAgent.includes("Firefox"),
    };
    try {
      chrome.runtime.sendMessage(
        { type: "BG_GET_VE_DEPRECATION_STATUS" },
        (resp?: VeDeprecationStatus) => {
          if (chrome.runtime.lastError || !resp) {
            resolve(fallback);
          } else {
            cachedVeDeprecationStatus = resp;
            resolve(resp);
          }
        },
      );
    } catch {
      resolve(fallback);
    }
  });

export const veDeprecationStatusRequest = async () => {
  const status =
    cachedVeDeprecationStatus ?? (await fetchVeDeprecationStatus());
  window.postMessage(
    {
      type: "GB_RESPONSE_VE_DEPRECATION_STATUS",
      data: {
        showNotice: !status.dismissed,
        isFirefox: status.isFirefox,
      },
    },
    window.location.origin,
  );
};

export const veDeprecationDismissRequest = () => {
  if (cachedVeDeprecationStatus) cachedVeDeprecationStatus.dismissed = true;
  chrome.runtime.sendMessage({ type: "BG_DISMISS_VE_DEPRECATION" }, () => {
    // touch lastError so Chrome doesn't log an unchecked-error warning
    void chrome.runtime.lastError;
  });
};

export const visualEditorTransformCopyRequest = (
  msg: TransformCopyRequestMessage,
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
    },
  );
};
