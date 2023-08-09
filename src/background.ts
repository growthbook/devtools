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

export type FetchVisualChangesetPayload =
  | {
      visualChangeset: APIVisualChangeset;
      experiment: APIExperiment;
      error: null;
    }
  | {
      visualChangeset: null;
      experiment: null;
      error: string;
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

    if (!apiKey) throw new Error("No API key found");

    const response = await fetch(
      `${apiHost}/api/v1/visual-changesets/${visualChangesetId}?includeExperiment=1`,
      {
        headers: genHeaders(apiKey),
      }
    );

    if (response.status !== 200) throw new Error(response.statusText);

    const res = await response.json();
    const { visualChangeset, experiment } = res;
    return {
      visualChangeset,
      experiment,
      error: null,
    };
  } catch (e) {
    return { visualChangeset: null, experiment: null, error: `${e}` };
  }
};

const updateVisualChangeset = async ({
  apiHost,
  visualChangesetId,
  updatePayload,
}: {
  apiHost: string;
  visualChangesetId: string;
  updatePayload: Partial<APIVisualChangeset>;
}) => {
  try {
    const apiKey = await loadApiKey();

    if (!apiKey) throw new Error("No API key found");

    const resp = await fetch(
      `${apiHost}/api/v1/visual-changesets/${visualChangesetId}`,
      {
        headers: genHeaders(apiKey),
        method: "PUT",
        body: JSON.stringify(updatePayload),
      }
    );

    const { nModified } = await resp.json();

    if (resp.status !== 200) {
      return { visualChangeset: null, error: resp.statusText };
    }

    return {
      nModified,
      error: null,
    };
  } catch (e) {
    return { error: `${e}` };
  }
};

const transformCopy = async ({
  apiHost,
  copy,
  mode,
}: {
  apiHost: string;
  copy: string;
  mode: CopyMode;
}) => {
  try {
    const apiKey = await loadApiKey();

    if (!apiKey) throw new Error("No API key found");

    const response = await fetch(`${apiHost}/api/v1/transform-copy`, {
      headers: genHeaders(apiKey),
      method: "POST",
      body: JSON.stringify({
        copy,
        mode,
        metadata: {
          url: window.location.href,
          title: document.title,
          description: document
            .querySelector("meta[name='description']")
            ?.getAttribute("content"),
        },
      }),
    });

    if (response.status !== 200) throw new Error(response.statusText);

    const res = await response.json();

    return {
      transformed: res.transformed,
      dailyLimitReached: !!res.dailyLimitReached,
      error: null,
    };
  } catch (e) {
    return {
      transformed: null,
      dailyLimitReached: null,
      error: `There was an error transforming the copy: ${e}`,
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
      default:
        break;
    }

    // return true to indicate async response
    return true;
  }
);
