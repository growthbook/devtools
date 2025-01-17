import {
  APIExperiment,
  APIVisualChangeset,
  BGLoadVisualChangsetMessage, BGTransformCopyMessage,
  BGUpdateVisualChangsetMessage, CopyMode
} from "../../devtools";
import {loadApiHost, loadApiKey, loadAppOrigin, saveAppOrigin} from "../visual_editor/lib/storage";
import {genHeaders, isSameOrigin} from "./index";
import MessageSender = chrome.runtime.MessageSender;

export async function handleLoadVisualChangeset(
  message: BGLoadVisualChangsetMessage,
  sender: MessageSender,
  sendResponse: (res: FetchVisualChangesetPayload | { error: string; }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  const res = await fetchVisualChangeset(data);
  if (res.error) return sendResponse({ error: res.error });

  const editorUrl = res.visualChangeset?.editorUrl;
  if (
    !editorUrl ||
    !senderOrigin ||
    !isSameOrigin(editorUrl, senderOrigin)
  ) {
    return sendResponse({
      error: `Unable to verify sender origin (editorUrl: ${editorUrl}; senderOrigin: ${senderOrigin})`,
    });
  }

  sendResponse(res);
}

export async function handleUpdateVisualChangeset(
  message: BGUpdateVisualChangsetMessage,
  sender: MessageSender,
  sendResponse: (res: UpdateVisualChangesetPayload | { error: string; }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  try {
    const res = await fetchVisualChangeset(data);
    if (res.error) throw new Error(res.error);

    const editorUrl = res.visualChangeset?.editorUrl;
    if (
      !editorUrl ||
      !senderOrigin ||
      !isSameOrigin(editorUrl, senderOrigin)
    )
      throw new Error(
        `Unable to verify sender origin (editorUrl: ${editorUrl}; senderOrigin: ${senderOrigin})`,
      );
    const res2 = await updateVisualChangeset(data);
    if (res2.error) throw new Error(res2.error);
    sendResponse(res2);
  } catch (e: any) {
    sendResponse({ error: e?.message || "" });
  }
}

export async function handleTransformCopy(
  message: BGTransformCopyMessage,
  sender: MessageSender,
  sendResponse: (res: TransformCopyPayload | { error: string; }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  const res = await transformCopy(data);
  if (res.error) return sendResponse({ error: res.error });
  sendResponse(res);
}


// CRUD methods
// ============

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
  experimentUrl: null;
  error: string;
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
      },
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
    let error: string = e.message;

    if (e.message === "no-api-key" || e.message === "no-api-host") {
      error = e.message;
    }

    return {
      visualChangeset: null,
      experiment: null,
      experimentUrl: null,
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
  error: string;
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
      },
    );

    const res = await resp.json();

    if (resp.status !== 200) throw new Error(res.message ?? resp.statusText);

    return {
      nModified: res.nModified,
      visualChangeset: res.visualChangeset,
      error: null,
    };
  } catch (e: any) {
    let error = e.string;

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
  error: string;
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
    let error = e.message;

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
