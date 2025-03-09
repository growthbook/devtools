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
import packageJson from "@growthbook/growthbook/package.json";
import { paddedVersionString } from "@growthbook/growthbook";

const latestSdkVersion = packageJson.version;
const latestSdkParts = latestSdkVersion.split(".");
latestSdkParts[2] = "0";
const latestMinorSdkVersion = latestSdkParts.join(".");

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
      // Standard global state i/o
      if (message.type === "getGlobalState") {
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
      if (message.type === "setGlobalState") {
        await setState(message.property, message.value, message.persist);
        sendResponse({ success: true });
      }

      // Firefox: Proxied tab state messages (UI -> background -> content_script)
      if (
        ["getTabState", "setTabState", "COPY_TO_CLIPBOARD"].includes(
          message.type,
        )
      ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTabId = tabs[0]?.id;
          if (activeTabId) {
            chrome.tabs.sendMessage(activeTabId, {
              ...message,
              tabId: activeTabId,
            });
          }
        });
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
        if (navigator.userAgent.includes("Firefox")) {
          // Firefox: Proxied tab state messages (content_script -> background -> UI)
          chrome.runtime.sendMessage(message);
        }
        sendResponse();
        break;
    }

    // return true to indicate async response
    return true;
  },
);

const UpdateTabIconBasedOnSDK = (
  message: BGSetSDKUsageData,
  tabId?: number,
) => {
  const { data } = message;
  const status = getSdkStatus(data);
  if (!tabId) tabId = data?.tabId;

  let title = "GrowthBook DevTools";

  if (data.sdkFound) {
    if (status === "green") {
      chrome.action.setIcon({
        tabId,
        path: chrome.runtime.getURL("/logo128-connected.png"),
      });
      title = "GrowthBook DevTools\n🟢 SDK connected";
      if (data?.version) title += ` (${data.version})`;
    } else if (status === "yellow") {
      chrome.action.setIcon({
        tabId,
        path: chrome.runtime.getURL("/logo128-problem.png"),
      });
      title =
        "GrowthBook DevTools\n🟡 SDK connected\n" +
        ((!data.hasPayload ? "No SDK payload\n" : "") +
          (data.trackingCallbackParams?.length !== 2
            ? "Tracking callback issues\n"
            : "") +
          (!data.payloadDecrypted ? "Decryption issues\n" : "")) +
        (paddedVersionString(data.version) <
        paddedVersionString(latestMinorSdkVersion)
          ? "Outdated SDK version"
          : "");
    } else {
      chrome.action.setIcon({
        tabId,
        path: data.canConnect
          ? chrome.runtime.getURL("/logo128-problem.png")
          : chrome.runtime.getURL("/logo128.png"),
      });
      title =
        "GrowthBook DevTools\n🔴 " +
        (!data.canConnect ? "SDK not connected\n" : "") +
        (data.canConnect && !data.version
          ? "Unknown SDK version"
          : data.canConnect &&
              paddedVersionString(data.version) <
                paddedVersionString(latestMinorSdkVersion)
            ? "Outdated SDK version"
            : "");
    }
  } else {
    chrome.action.setIcon({
      tabId,
      path: chrome.runtime.getURL("/logo128.png"),
    });
    title = "GrowthBook DevTools\n⚪ No SDK present";
  }

  // update the badge and icon
  chrome.action.setBadgeText({ tabId, text: "" });
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

export function getSdkStatus(
  sdkData: SDKHealthCheckResult,
): "green" | "yellow" | "red" {
  if (
    !sdkData.canConnect ||
    !sdkData.version ||
    (sdkData.version &&
      paddedVersionString(sdkData.version) < paddedVersionString("0.30.0"))
  ) {
    return "red";
  }
  if (
    !sdkData.hasPayload ||
    sdkData.trackingCallbackParams?.length !== 2 ||
    !sdkData.payloadDecrypted ||
    paddedVersionString(sdkData.version) <
      paddedVersionString(latestMinorSdkVersion)
  ) {
    return "yellow";
  }
  return "green";
}

// Firefox: return tabId if asked by content_script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "GET_TAB_ID") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, {
          type: "SET_TAB_ID",
          tabId: activeTabId,
        });
      }
    });
  }
  return true;
});
