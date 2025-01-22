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
} from "devtools";
import {
  handleLoadVisualChangeset,
  handleTransformCopy,
  handleUpdateVisualChangeset,
} from "@/background/visualEditorHandlers";


// Global state store
let state: Record<string, any> = {};

// Helper functions to manage global state
async function getState(property: string, persist: boolean = false) {
  if (persist) {
    const result = await chrome.storage.sync.get([property]);
    return result?.[property];
  }
  return state?.[property];
}
async function setState(property: string, value: any, persist: boolean = false) {
  if (persist) {
    await chrome.storage.sync.set({ [property]: value });
  } else {
    state[property] = value;
  }

  // Notify all listeners about the state change
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
        const stateValue = await getState(message.property, message.persist);
        chrome.runtime.sendMessage({
          type: "globalStateChanged",
          property: message.property,
          value: stateValue,
        });
      }
      if (message.type === "setState") {
        await setState(message.property, message.value, message.persist);
        sendResponse({success: true});
      }
    } catch (error) {
      console.error("Error resolving global state", error);
      sendResponse({success: false, error: (error as Error).message});
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
      case "BG_SET_SDK_USAGE_DATA":
        if (!tabId) tabId = data?.tabId;

        let title = "GrowthBook DevTools";
        let text = data?.totalItems ? data.totalItems + "" : "";

        if (data.sdkFound) {
          chrome.action.setIcon({
            tabId,
            path: chrome.runtime.getURL("/logo128-connected.png"),
          });
          title = "GrowthBook DevTools\n🟢 SDK connected";
          if (data?.sdkVersion) title += ` (${data.sdkVersion})`;
        } else {
          chrome.action.setIcon({
            tabId,
            path: chrome.runtime.getURL("/logo128.png"),
          });
          title = "GrowthBook DevTools\n⚪ no SDK present";
          text = "";
        }

        chrome.action.setBadgeText({ tabId, text });
        chrome.action.setTitle({ title, tabId });
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
