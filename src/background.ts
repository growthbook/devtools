import { VisualChangesetApiResponse } from "../devtools";
import { loadApiKey } from "./visual_editor/lib/storage";

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

const fetchVisualChangeset = async (
  apiHost: string,
  visualChangesetId: string
): Promise<
  | VisualChangesetApiResponse
  | { visualChangeset: null; experiment: null; error: string }
> => {
  const apiKey = await loadApiKey();

  try {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, data } = message;

  if (type === "GET_VISUAL_CHANGESET") {
    const { apiHost, visualChangesetId } = data;

    fetchVisualChangeset(apiHost, visualChangesetId).then((res) => {
      if (res.error) {
        sendResponse({ error: res.error });
        return;
      }
      // security check
      if (
        !sender.origin ||
        !res.visualChangeset?.editorUrl.startsWith(sender.origin)
      ) {
        sendResponse({ error: "Invalid origin" });
        return;
      }
      sendResponse(res);
    });

    // return true to indicate async response
    return true;
  }
});
