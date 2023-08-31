import {
  APIExperiment,
  APIVisualChangeset,
  BGMessage,
  CopyMode,
} from "../devtools";
import {
  loadApiHost,
  loadApiKey,
  loadAppOrigin,
  saveAppOrigin,
} from "./visual_editor/lib/storage";

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export type BGErrorCode =
  | "no-api-key"
  | "no-api-host"
  | "load-viz-changeset-failed"
  | "update-viz-changeset-failed"
  | "transform-copy-failed"
  | "transform-copy-daily-limit-reached";

export type FetchVisualChangesetPayload =
  | {
      visualChangeset: APIVisualChangeset;
      experiment: APIExperiment;
      experimentUrl: string | null;
      error: null;
    }
  | {
      visualChangeset: null;
      experiment: null;
      error: BGErrorCode;
    };

const fetchVisualChangeset = async ({
  visualChangesetId,
}: {
  visualChangesetId: string;
}): Promise<FetchVisualChangesetPayload> => {
  try {
    const [apiHost, apiKey] = await Promise.all([loadApiHost(), loadApiKey()]);

    if (!apiKey || !apiHost)
      throw new Error(!apiKey ? "no-api-key" : "no-api-host");

    const response = await fetch(
      `${apiHost}/api/v1/visual-changesets/${visualChangesetId}?includeExperiment=1`,
      {
        headers: genHeaders(apiKey),
      }
    );

    const res = await response.json();

    if (response.status !== 200)
      throw new Error(res.message ?? response.statusText);

    const { visualChangeset, experiment } = res;

    if (!visualChangeset || !experiment)
      throw new Error("load-viz-changeset-failed");

    // fetch latest appOrigin to keep up to date
    let appOrigin: string | null = await loadAppOrigin();
    try {
      appOrigin = await fetch(apiHost)
        .then((res) => res.json())
        .then((json) => json.app_origin);
      if (appOrigin) await saveAppOrigin(appOrigin);
    } catch (e) {
      // fail silently
    }

    return {
      visualChangeset,
      experiment,
      experimentUrl: appOrigin
        ? `${appOrigin}/experiment/${experiment.id}`
        : null,
      error: null,
    };
  } catch (e: any) {
    let error: BGErrorCode = "load-viz-changeset-failed";

    if (e.message === "no-api-key" || e.message === "no-api-host") {
      error = e.message;
    }

    return {
      visualChangeset: null,
      experiment: null,
      error,
    };
  }
};

export type UpdateVisualChangesetPayload =
  | {
      nModified: number;
      visualChangeset: APIVisualChangeset;
      error: null;
    }
  | {
      nModified: number;
      visualChangeset: null;
      error: BGErrorCode;
    };

const updateVisualChangeset = async ({
  visualChangesetId,
  updatePayload,
}: {
  visualChangesetId: string;
  updatePayload: Partial<APIVisualChangeset>;
}): Promise<UpdateVisualChangesetPayload> => {
  try {
    const [apiHost, apiKey] = await Promise.all([loadApiHost(), loadApiKey()]);

    if (!apiKey || !apiHost)
      throw new Error(!apiKey ? "no-api-key" : "no-api-host");

    const resp = await fetch(
      `${apiHost}/api/v1/visual-changesets/${visualChangesetId}`,
      {
        headers: genHeaders(apiKey),
        method: "PUT",
        body: JSON.stringify(updatePayload),
      }
    );

    const res = await resp.json();

    if (resp.status !== 200) throw new Error(res.message ?? resp.statusText);

    return {
      nModified: res.nModified,
      visualChangeset: res.visualChangeset,
      error: null,
    };
  } catch (e: any) {
    let error: BGErrorCode = "update-viz-changeset-failed";

    if (e.message === "no-api-key" || e.message === "no-api-host") {
      error = e.message;
    }

    return {
      nModified: 0,
      visualChangeset: null,
      error,
    };
  }
};

export type TransformCopyPayload =
  | {
      visualChangeset: APIVisualChangeset;
      transformed: string;
      dailyLimitReached: boolean;
      error: null;
    }
  | {
      visualChangeset: null;
      transformed: null;
      dailyLimitReached: null;
      error: BGErrorCode;
    };

const transformCopy = async ({
  visualChangesetId,
  copy,
  mode,
}: {
  visualChangesetId: string;
  copy: string;
  mode: CopyMode;
}): Promise<TransformCopyPayload> => {
  try {
    const [apiHost, apiKey] = await Promise.all([loadApiHost(), loadApiKey()]);

    if (!apiKey || !apiHost)
      throw new Error(!apiKey ? "no-api-key" : "no-api-host");

    const response = await fetch(`${apiHost}/api/v1/transform-copy`, {
      headers: genHeaders(apiKey),
      method: "POST",
      body: JSON.stringify({
        visualChangesetId,
        copy,
        mode,
      }),
    });

    const res = await response.json();

    if (response.status !== 200)
      throw new Error(res.message ?? response.statusText);

    return {
      visualChangeset: res.visualChangeset,
      transformed: res.transformed,
      dailyLimitReached: !!res.dailyLimitReached,
      error: null,
    };
  } catch (e: any) {
    let error: BGErrorCode = "transform-copy-failed";

    if (e.message === "no-api-key" || e.message === "no-api-host") {
      error = e.message;
    }

    return {
      visualChangeset: null,
      transformed: null,
      dailyLimitReached: null,
      error,
    };
  }
};

const isSameOrigin = (url: string, origin: string) => {
  try {
    const urlHostname = new URL(url).hostname;
    const originHostname = new URL(origin).hostname;
    const urlMainDomain = urlHostname.split(".").slice(-2).join(".");
    const originMainDomain = originHostname.split(".").slice(-2).join(".");
    return urlMainDomain === originMainDomain;
  } catch (e) {
    console.error("isSameOrigin - Error checking origin", e);
    return false;
  }
};

/**
 * Listen for messages from the devtools. We have to keep the handler synchronous
 * so we can return true to indicate an async response to chrome.
 */
chrome.runtime.onMessage.addListener(
  (message: BGMessage, sender, sendResponse) => {
    const { type, data } = message;
    const senderOrigin = sender.origin;

    switch (type) {
      case "BG_LOAD_VISUAL_CHANGESET":
        fetchVisualChangeset(data).then((res) => {
          const editorUrl = res.visualChangeset?.editorUrl;
          if (
            !editorUrl ||
            !senderOrigin ||
            !isSameOrigin(editorUrl, senderOrigin)
          )
            return sendResponse({
              error: `Unable to verify sender origin (editorUrl: ${editorUrl}; senderOrigin: ${senderOrigin})`,
            });
          if (res.error) return sendResponse({ error: res.error });
          sendResponse(res);
        });
        break;
      case "BG_UPDATE_VISUAL_CHANGESET":
        fetchVisualChangeset(data)
          .then((res) => {
            const editorUrl = res.visualChangeset?.editorUrl;
            if (
              !editorUrl ||
              !senderOrigin ||
              !isSameOrigin(editorUrl, senderOrigin)
            )
              throw new Error(
                `Unable to verify sender origin (editorUrl: ${editorUrl}; senderOrigin: ${senderOrigin})`
              );
            if (res.error) throw new Error(res.error);
            return updateVisualChangeset(data);
          })
          .then((res) => {
            if (res.error) throw new Error(res.error);
            sendResponse(res);
          })
          .catch((e) => {
            sendResponse({ error: e });
          });
        break;
      case "BG_TRANSFORM_COPY":
        transformCopy(data).then((res) => {
          if (res.error) return sendResponse({ error: res.error });
          sendResponse(res);
        });
        break;
      case "BG_OPEN_OPTIONS_PAGE":
        chrome.runtime.openOptionsPage();
        sendResponse();
        break;
      default:
        sendResponse();
        break;
    }

    // return true to indicate async response
    return true;
  }
);
