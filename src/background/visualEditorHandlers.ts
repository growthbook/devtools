import {
  APIExperiment,
  APIVisualChangeset,
  BGLoadVisualChangsetMessage,
  BGTransformCopyMessage,
  BGUpdateVisualChangsetMessage,
  CopyMode,
  VeDeprecationStatus,
} from "devtools";
import {
  loadApiHost,
  loadApiKey,
  loadAppOrigin,
  saveAppOrigin,
} from "@/app/storage";
import { NEW_VISUAL_EDITOR_EXTENSION_IDS } from "@/visual_editor/lib/constants";
import { genHeaders, isSameOrigin } from "@/background/index";
import MessageSender = chrome.runtime.MessageSender;

export async function handleLoadVisualChangeset(
  message: BGLoadVisualChangsetMessage,
  sender: MessageSender,
  sendResponse: (res: FetchVisualChangesetPayload | { error: string }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  const res = await fetchVisualChangeset(data);
  if (res.error) return sendResponse({ error: res.error });

  const editorUrl = res.visualChangeset?.editorUrl;
  if (!editorUrl || !senderOrigin || !isSameOrigin(editorUrl, senderOrigin)) {
    return sendResponse({
      error: `Unable to verify sender origin (editorUrl: ${editorUrl}; senderOrigin: ${senderOrigin})`,
    });
  }

  sendResponse(res);
}

export async function handleUpdateVisualChangeset(
  message: BGUpdateVisualChangsetMessage,
  sender: MessageSender,
  sendResponse: (res: UpdateVisualChangesetPayload | { error: string }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  try {
    const res = await fetchVisualChangeset(data);
    if (res.error) throw new Error(res.error);

    const editorUrl = res.visualChangeset?.editorUrl;
    if (!editorUrl || !senderOrigin || !isSameOrigin(editorUrl, senderOrigin))
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
  sendResponse: (res: TransformCopyPayload | { error: string }) => void,
) {
  const { data } = message;
  const senderOrigin = sender.origin;

  const res = await transformCopy(data);
  if (res.error) return sendResponse({ error: res.error });
  sendResponse(res);
}

// Legacy visual editor deprecation
// ================================

const VE_DEPRECATION_DISMISSED_KEY = "ve-deprecation-dismissed";
const isFirefox = navigator.userAgent.includes("Firefox");

type NewVePong = {
  type: "GB_VE_PONG";
  version: string;
  sidePanelOpen: boolean;
};

// Ping the standalone Visual Editor extension. Resolves to null when it's
// not installed (or is an older version without the ping responder — those
// users see the install notice until their copy auto-updates, which is
// acceptable since the notice is dismissible). The timeout guards against
// the (unexpected) case of an installed extension that accepts the message
// but never responds — editor launch must not hang on this.
const pingNewVisualEditor = (tabId?: number): Promise<NewVePong | null> => {
  if (isFirefox) return Promise.resolve(null); // Chrome-only extension
  const pings = NEW_VISUAL_EDITOR_EXTENSION_IDS.map(
    (id) =>
      new Promise<NewVePong | null>((resolve) => {
        try {
          chrome.runtime.sendMessage(
            id,
            { type: "GB_VE_PING", tabId },
            (resp) => {
              if (chrome.runtime.lastError || resp?.type !== "GB_VE_PONG") {
                resolve(null);
              } else {
                resolve(resp as NewVePong);
              }
            },
          );
        } catch {
          resolve(null);
        }
      }),
  );
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 1500),
  );
  return Promise.race([
    Promise.all(pings).then((results) => results.find(Boolean) ?? null),
    timeout,
  ]);
};

const loadVeDeprecationDismissed = async (): Promise<boolean> => {
  try {
    // storage.session = browser-session lifetime (survives service worker
    // restarts, cleared on browser exit) — the dismissal duration we want.
    // Unavailable on older Firefox; treat as never dismissed there.
    if (!chrome.storage.session) return false;
    const result = await chrome.storage.session.get([
      VE_DEPRECATION_DISMISSED_KEY,
    ]);
    return !!result[VE_DEPRECATION_DISMISSED_KEY];
  } catch {
    return false;
  }
};

export async function handleGetVeDeprecationStatus(
  sender: MessageSender,
  sendResponse: (res: VeDeprecationStatus) => void,
) {
  const [pong, dismissed] = await Promise.all([
    pingNewVisualEditor(sender.tab?.id),
    loadVeDeprecationDismissed(),
  ]);
  sendResponse({
    newExtensionInstalled: !!pong,
    sidePanelOpen: !!pong?.sidePanelOpen,
    dismissed,
    isFirefox,
  });
}

export async function handleDismissVeDeprecation(
  sendResponse: (res: { success: boolean }) => void,
) {
  try {
    await chrome.storage.session?.set({ [VE_DEPRECATION_DISMISSED_KEY]: true });
    sendResponse({ success: true });
  } catch {
    sendResponse({ success: false });
  }
}

// Relay "open the new extension's side panel" to the new extension. Only
// succeeds when the user's click gesture propagates across the extension
// boundary — callers fall back to pointing at the toolbar when it doesn't.
export async function handleOpenNewVePanel(
  sender: MessageSender,
  sendResponse: (res: { opened: boolean }) => void,
) {
  const tabId = sender.tab?.id;
  if (typeof tabId !== "number" || isFirefox) {
    return sendResponse({ opened: false });
  }
  const attempts = NEW_VISUAL_EDITOR_EXTENSION_IDS.map(
    (id) =>
      new Promise<boolean>((resolve) => {
        try {
          chrome.runtime.sendMessage(
            id,
            { type: "GB_VE_OPEN_PANEL", tabId },
            (resp) => {
              resolve(!chrome.runtime.lastError && !!resp?.opened);
            },
          );
        } catch {
          resolve(false);
        }
      }),
  );
  const results = await Promise.all(attempts);
  sendResponse({ opened: results.some(Boolean) });
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
