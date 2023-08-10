import {
  APIExperiment,
  APIVisualChangeset,
  BGMessage,
  CopyMode,
} from "../devtools";
import { loadApiKey } from "./visual_editor/lib/storage";

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export type BGErrorCode =
  | "no-api-key"
  | "load-viz-changeset-failed"
  | "update-viz-changeset-failed"
  | "transform-copy-failed"
  | "transform-copy-daily-limit-reached";

export type FetchVisualChangesetPayload =
  | {
      visualChangeset: APIVisualChangeset;
      experiment: APIExperiment;
      error: null;
    }
  | {
      visualChangeset: null;
      experiment: null;
      error: BGErrorCode;
    };

const fetchVisualChangeset = async ({
  apiHost,
  visualChangesetId,
}: {
  apiHost: string;
  visualChangesetId: string;
}): Promise<FetchVisualChangesetPayload> => {
  try {
    const apiKey = await loadApiKey();

    if (!apiKey) {
      return {
        visualChangeset: null,
        experiment: null,
        error: "no-api-key",
      };
    }

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
    return {
      visualChangeset,
      experiment,
      error: null,
    };
  } catch (e) {
    return {
      visualChangeset: null,
      experiment: null,
      error: "load-viz-changeset-failed",
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
  apiHost,
  visualChangesetId,
  updatePayload,
}: {
  apiHost: string;
  visualChangesetId: string;
  updatePayload: Partial<APIVisualChangeset>;
}): Promise<UpdateVisualChangesetPayload> => {
  try {
    const apiKey = await loadApiKey();

    if (!apiKey) {
      return {
        nModified: 0,
        visualChangeset: null,
        error: "no-api-key",
      };
    }

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
  } catch (e) {
    return {
      nModified: 0,
      visualChangeset: null,
      error: "update-viz-changeset-failed",
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
  apiHost,
  visualChangesetId,
  copy,
  mode,
}: {
  apiHost: string;
  visualChangesetId: string;
  copy: string;
  mode: CopyMode;
}): Promise<TransformCopyPayload> => {
  try {
    const apiKey = await loadApiKey();

    if (!apiKey) {
      return {
        visualChangeset: null,
        transformed: null,
        dailyLimitReached: null,
        error: "no-api-key",
      };
    }

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
  } catch (e) {
    return {
      visualChangeset: null,
      transformed: null,
      dailyLimitReached: null,
      error: "transform-copy-failed",
    };
  }
};

/**
 * Listen for messages from the devtools. We have to keep the handler synchronous
 * so we can return true to indicate an async response.
 */
chrome.runtime.onMessage.addListener(
  (message: BGMessage, _sender, sendResponse) => {
    const { type, data } = message;

    switch (type) {
      case "BG_LOAD_VISUAL_CHANGESET":
        fetchVisualChangeset(data).then((res) => {
          if (res.error) return sendResponse({ error: res.error });
          sendResponse(res);
        });
        break;
      case "BG_UPDATE_VISUAL_CHANGESET":
        updateVisualChangeset(data).then((res) => {
          if (res.error) return sendResponse({ error: res.error });
          sendResponse(res);
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
        break;
      default:
        break;
    }

    // return true to indicate async response
    return true;
  }
);
