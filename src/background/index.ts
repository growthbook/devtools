import { isEqual } from "lodash";
import {
  fromUrl,
  parseDomain,
  ParseResultType,
  Validation,
} from "parse-domain";
import {
  BGMessage,
  BGLoadVisualChangsetMessage,
  BGUpdateVisualChangsetMessage,
  BGTransformCopyMessage,
  SDKHealthCheckResult,
  BGSetSDKUsageData,
} from "devtools";
import {
  handleLoadVisualChangeset,
  handleTransformCopy,
  handleUpdateVisualChangeset,
} from "@/background/visualEditorHandlers";

// Global state store
// Has an optional sync with chrome.storage via "persist" flag
let state: Record<string, any> = {};

// Helper functions to manage global state
async function getState(
  property: string,
  persist: boolean = false,
): Promise<{ state?: any; success: boolean }> {
  if (persist) {
    const result = await chrome.storage.sync.get([property]);
    if (property in result) {
      return { state: result?.[property], success: true };
    } else {
      return { success: false };
    }
  }
  if (property in state) {
    return { state: state?.[property], success: true };
  } else {
    return { success: false };
  }
}
async function setState(
  property: string,
  value: any,
  persist: boolean = false,
) {
  if (persist) {
    await chrome.storage.sync.set({ [property]: value });
  } else {
    state[property] = value;
  }
  chrome.runtime.sendMessage({
    type: "globalStateChanged",
    property,
    value,
  });
}

// Listen for messages from the App
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  (async () => {
    try {
      if (message.type === "getState") {
        const result = await getState(message.property, message.persist);
        const { state: stateValue, success } = result;
        if (success) {
          chrome.runtime.sendMessage({
            type: "globalStateChanged",
            property: message.property,
            value: stateValue,
          });
        } else {
          chrome.runtime.sendMessage({
            type: "globalStateChanged",
            property: message.property,
            // not found, send empty message to signal unset
          });
        }
      }
      if (message.type === "setState") {
        await setState(message.property, message.value, message.persist);
        console.log("Global state updated", message.property, message.value);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error("Error resolving global state", error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  })();
  return true;
});

/**
 * Listen for messages from the devtools and content script.
 * We have to keep the handler synchronous so we can return true to indicate an async response to chrome.
 */
chrome.runtime.onMessage.addListener(
  (message: BGMessage, sender, sendResponse) => {
    const { type, data } = message;
    const senderOrigin = sender.origin;
    let tabId = sender.tab?.id;
    switch (type) {
      case "GB_SDK_UPDATED":
        UpdateTabIconBasedOnSDK(message as BGSetSDKUsageData, tabId);
        break;

      case "BG_LOAD_VISUAL_CHANGESET":
        handleLoadVisualChangeset(
          message as BGLoadVisualChangsetMessage,
          sender,
          sendResponse,
        );
        break;
      case "BG_UPDATE_VISUAL_CHANGESET":
        handleUpdateVisualChangeset(
          message as BGUpdateVisualChangsetMessage,
          sender,
          sendResponse,
        );
        break;
      case "BG_TRANSFORM_COPY":
        handleTransformCopy(
          message as BGTransformCopyMessage,
          sender,
          sendResponse,
        );
        break;
      default:
        sendResponse();
        break;
    }

    // return true to indicate async response
    return true;
  },
);

const UpdateTabIconBasedOnSDK = (message: BGSetSDKUsageData , tabId?: number) => {
  const { data } = message;
  if (!tabId) tabId = data?.tabId;
  console.log("data background", data);
  let title = "GrowthBook DevTools";
  let text = " ";
  if (data.canConnect) {
    chrome.action.setIcon({
      tabId,
      path: chrome.runtime.getURL("/logo128-connected.png"),
    });
    title = "GrowthBook DevTools\n🟢 SDK connected";
    if (data?.version) title += ` (${data.version})`;
  } else if (data.sdkFound && data.hasPayload) {
    chrome.action.setIcon({
      tabId,
      path: chrome.runtime.getURL("/logo128-connected.png"),
    });
    title = "GrowthBook DevTools\n🟢 SDK connected with Payload \n Client Key is not connected";
  } else if (!data.canConnect) {
    chrome.action.setIcon({
      tabId,
      path: chrome.runtime.getURL("/logo128.png"),
    });
    title = "GrowthBook DevTools\n🔴 SDK not connected";
  } else if (!data.sdkFound) {
    chrome.action.setIcon({
      tabId,
      path: chrome.runtime.getURL("/logo128.png"),
    });
    title = "GrowthBook DevTools\n⚪ no SDK present";
  }

  // update the badge and icon
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setTitle({ title, tabId });
};

export const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export const isSameOrigin = (url: string, origin: string) => {
  try {
    const urlParseResult = parseDomain(fromUrl(url), {
      validation: Validation.Lax,
    });
    const originParseResult = parseDomain(fromUrl(origin), {
      validation: Validation.Lax,
    });
    if (
      urlParseResult.type === ParseResultType.Listed &&
      originParseResult.type === ParseResultType.Listed
    ) {
      const { domain: urlDomain } = urlParseResult;
      const { domain: originDomain } = originParseResult;

      return urlDomain === originDomain;
    } else if (
      urlParseResult.type === ParseResultType.Reserved &&
      originParseResult.type === ParseResultType.Reserved
    ) {
      return isEqual(urlParseResult.labels, originParseResult.labels);
    } else if (
      urlParseResult.type === ParseResultType.NotListed &&
      originParseResult.type === ParseResultType.NotListed
    ) {
      return isEqual(urlParseResult.labels, originParseResult.labels);
    } else {
      console.error('Unrecognizable domain type for either "url" or "origin"', {
        url,
        origin,
      });
      throw new Error(
        'Unrecognizable domain type for either "url" or "origin"',
      );
    }
  } catch (e) {
    console.error("isSameOrigin - Error checking origin", e);
    return false;
  }
};
