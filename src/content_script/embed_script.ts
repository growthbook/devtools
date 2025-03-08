import type {
  Experiment,
  FeatureApiResponse,
  FeatureResult,
  GrowthBook,
  LogUnion,
  Options,
  Result,
  TrackingCallback,
} from "@growthbook/growthbook";
import type { ErrorMessage, SDKHealthCheckResult } from "devtools";
import { Attributes } from "@growthbook/growthbook";

declare global {
  interface Window {
    _growthbook?: GrowthBook;
    growthbook_config?: any;
  }
}

function getValidGrowthBookInstance(cb: (gb: GrowthBook) => void) {
  if (!window._growthbook) return false;

  if (!window._growthbook.setAttributeOverrides) {
    const msg: ErrorMessage = {
      type: "GB_ERROR",
      error: "Requires minimum Javascript SDK version of 0.16.0",
    };
    window.postMessage(msg, window.location.origin);
  } else {
    cb(window._growthbook);
  }
  return true;
}

// Wait for window._growthbook to be available
function onGrowthBookLoad(cb: (gb: GrowthBook) => void) {
  if (getValidGrowthBookInstance(cb)) return;
  let timer = window.setTimeout(() => {
    updateTabState("sdkData", {
      canConnect: false,
      hasPayload: false,
      sdkFound: false,
      errorMessage: "SDK not found",
    });
    const msg: ErrorMessage = {
      type: "GB_ERROR",
      error:
        "Unable to locate GrowthBook SDK instance. Please ensure you are using either the Javascript or React SDK, and Dev Mode is enabled.",
    };
  }, 5000);

  document.addEventListener(
    "gbloaded",
    () => {
      clearTimeout(timer);
      getValidGrowthBookInstance(cb);
    },
    false,
  );
}

// Send a refresh message back to content script
function init() {
  setupListeners();
  pushAppUpdates();
  hydrateApp();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pushAppUpdates();
    }
  });
}

function hydrateApp() {
  const hydratedState = getQueryState();
  if (!hydratedState) {
    pullOverrides();
    return;
  }

  onGrowthBookLoad((gb) => {
    if (hydratedState?.attributes && Object.keys(hydratedState?.attributes || {}).length) {
      gb?.setAttributeOverrides?.(hydratedState.attributes);
    }
    if (hydratedState?.forcedFeatures && Object.keys(hydratedState?.forcedFeatures || {}).length) {
      let forcedFeaturesMap = new Map(Object.entries(hydratedState.forcedFeatures));
      gb?.setForcedFeatures?.(forcedFeaturesMap);
    }
    if (hydratedState?.forcedVariations && Object.keys(hydratedState?.forcedVariations || {}).length) {
      gb?.setForcedVariations?.(hydratedState.forcedVariations);
    }
  });
}

function pushAppUpdates() {
  updateTabState("url", window.location.href || "");
  onGrowthBookLoad((gb) => {
    pushSDKUpdate(gb);
    if (gb) {
      subscribeToSdkChanges(gb);
      updateTabState("features", gb.getFeatures?.() || {});
      updateTabState("experiments", gb.getExperiments?.() || []);

      if (Object.keys(gb.getAttributes() || {}).length) {
        updateTabState("attributes", gb.getAttributes() || {});
      }
      if (
        gb.getForcedFeatures &&
        Object.keys(gb.getForcedFeatures() || {}).length
      ) {
        updateTabState(
          "forcedFeatures",
          Object.fromEntries(gb.getForcedFeatures?.() || new Map()),
        );
      }
      if (
        gb.getForcedVariations &&
        Object.keys(gb.getForcedVariations() || {}).length
      ) {
        updateTabState("forcedVariations", gb.getForcedVariations());
      }
    }
  });
}

async function pushSDKUpdate(gb?: GrowthBook) {
  const sdkData = await SDKHealthCheck(gb);
  updateTabState("sdkData", sdkData);
  updateBackgroundSDK(sdkData);
}

function setupListeners() {
  // listen for state change events that will affect the SDK
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (typeof message !== "object" || message === null) return;

    switch (message.type) {
      case "GB_UPDATE_ATTRIBUTES":
        // setAttributes:
        updateAttributes(message.data);
        break;
      case "GB_UPDATE_FEATURES":
        // setForcedFeatures:
        updateFeatures(message.data);
        break;
      case "GB_UPDATE_EXPERIMENTS":
        // setForcedVariations:
        updateExperiments(message.data);
        break;
      case "GB_REQUEST_REFRESH":
        pushAppUpdates();
        break;
      case "COPY_TO_CLIPBOARD":
        if (message.value) {
          window.focus();
          navigator.clipboard.writeText(message.value);
        }
        break;
      default:
        return;
    }
  });
}

function updateAttributes(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (typeof data === "object" && data !== null) {
      gb.setAttributeOverrides?.(data as Attributes); // {} to reset
      updateTabState("attributes", gb.getAttributes?.() || {}); // so that when we reset it will reset back to the original attributes
    }
  });
}

function updateFeatures(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (data) {
      gb.setForcedFeatures?.(
        new Map(Object.entries(data as Record<string, any>)),
      );
    }
  });
}

function updateExperiments(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (data) {
      gb.setForcedVariations?.(data as Record<string, number>);
    }
  });
}

async function updateBackgroundSDK(data: SDKHealthCheckResult) {
  window.postMessage(
    {
      type: "GB_SDK_UPDATED",
      data,
    },
    window.location.origin,
  );
}

// send a message that the tabstate has been updated
function updateTabState(property: string, value: unknown, append = false) {
  window.postMessage(
    {
      type: "UPDATE_TAB_STATE",
      data: {
        property,
        value,
      },
      append,
    },
    window.location.origin,
  );
}

// Prompt the content script to send the existing overrides on pageload
function pullOverrides() {
  window.postMessage(
    {
      type: "GB_REQUEST_OVERRIDES",
    },
    window.location.origin,
  );
}

// add a proxy to the SDKs methods so we know when anything important has been changed programmatically
function subscribeToSdkChanges(
  gb: GrowthBook & { patchedMethods?: boolean; logs?: LogUnion[] },
) {
  if (gb.patchedMethods) return;
  gb.patchedMethods = true;
  // @ts-expect-error
  gb.context.debug = true;
  // @ts-expect-error
  gb.context.enableDevMode = true;
  const _setAttributes = gb.setAttributes;
  gb.setAttributes = async (attributes: Attributes) => {
    await _setAttributes?.call(gb, attributes);
    updateTabState("attributes", gb.getAttributes());
  };
  if (gb.setAttributes) {
    const _setAttributes = gb.setAttributes;
    gb.setAttributes = async (attributes: Attributes) => {
      await _setAttributes?.call(gb, attributes);
      updateTabState("attributes", gb.getAttributes());
    };
  }
  if (gb.updateAttributes) {
    const _updateAttributes = gb.updateAttributes;
    gb.updateAttributes = async (attributes: Attributes) => {
      await _updateAttributes?.call(gb, attributes);
      updateTabState("attributes", gb.getAttributes());
    };
  }

  const _setAttributeOverrides = gb.setAttributeOverrides;
  gb.setAttributeOverrides = async (attributes: Attributes) => {
    await _setAttributeOverrides?.call(gb, attributes);
    updateTabState("attributes", gb.getAttributes());
    updateTabState("overriddenAttributes", attributes);
  };

  const _setForcedFeatures = gb.setForcedFeatures;
  gb.setForcedFeatures = (map: Map<string, any>) => {
    _setForcedFeatures?.call(gb, map);
    updateTabState(
      "forcedFeatures",
      Object.fromEntries(gb.getForcedFeatures?.() || new Map()),
    );
  };

  const _setForcedVariations = gb.setForcedVariations;
  gb.setForcedVariations = async (vars: Record<string, number>) => {
    await _setForcedVariations?.call(gb, vars);
    updateTabState("forcedVariations", gb.getForcedVariations?.() || {});
  };

  const _setPayload = gb.setPayload;
  if (!_setPayload) {
    // legacy SDK, start polling
    window.setInterval(() => {
      pushAppUpdates();
    }, 5000);
  } else {
    // patch for immediate updates
    gb.setPayload = async (incomingPayload: FeatureApiResponse) => {
      await _setPayload.call(gb, incomingPayload);
      pushAppUpdates();
    };
  }

  const {
    trackingCallback,
    onFeatureUsage,
    // @ts-expect-error Context is private but we still need to read from it
  }: Options = gb.context;

  // Monkeypatches for logging on outdated sdk versions
  let hasSdkLogSupport = false;
  if (gb.logs) {
    hasSdkLogSupport = true;
  }
  if (!gb.logs) {
    gb.logs = [];

    // Event logs
    const _logEvent = gb.logEvent;
    gb.logEvent = async (
      eventName: string,
      properties?: Record<string, unknown>,
    ) => {
      gb.logs!.push({
        eventName,
        properties,
        timestamp: Date.now().toString(),
        logType: "event",
      });
      _logEvent?.call(gb, eventName, properties);
    };
  }

  // Experiment tracking callbacks
  const _setTrackingCallback = gb.setTrackingCallback || (() => {});
  // Create a helper to automatically patch any callbacks the user sets
  gb.setTrackingCallback = (callback: TrackingCallback) => {
    const patchedCallBack = (
      experiment: Experiment<any>,
      result: Result<any>,
    ) => {
      if (!hasSdkLogSupport) {
        gb.logs!.push({
          experiment,
          result,
          timestamp: Date.now().toString(),
          logType: "experiment",
        });
      }
      if ("isNoopCallback" in callback && callback.isNoopCallback) {
        gb.setDeferredTrackingCalls?.([
          ...gb.getDeferredTrackingCalls(),
          { experiment, result },
        ]);
      }
      callback(experiment, result);
    };
    if ("isNoopCallback" in callback && callback.isNoopCallback) {
      patchedCallBack.isNoopCallback = true;
    } else {
      patchedCallBack.originalParams = callback
        .toString()
        .match(/\(([^)]+)\)/)?.[1]
        .split(",")
        .map((param: string) => param.trim());
    }
    _setTrackingCallback?.call(gb, patchedCallBack);
    pushAppUpdates();
  };
  // Apply the patch helper above to the existing callback
  if (typeof trackingCallback === "function") {
    gb.setTrackingCallback(trackingCallback);
  } else {
    const noop = () => {};
    // This flag is checked to see if the user has specified their own tracking callback or if it's using the noop
    noop.isNoopCallback = true;
    gb.setTrackingCallback(noop);
  }

  // Feature usage callbacks
  // @ts-expect-error Context is private but we still need to write it here
  gb.context.onFeatureUsage = (key: string, result: FeatureResult<any>) => {
    if (!hasSdkLogSupport) {
      gb.logs!.push({
        featureKey: key,
        result,
        timestamp: Date.now().toString(),
        logType: "feature",
      });
    }
    if (typeof onFeatureUsage === "function") {
      onFeatureUsage(key, result);
    }
  };
  if (!onFeatureUsage || typeof onFeatureUsage !== "function") {
    // @ts-expect-error
    gb.context.onFeatureUsage.isNoopCallback = true;
  }

  // Watch for incoming log events and send to tabstate
  updateTabState("logEvents", []);
  const onLogEvent = (event: LogUnion) => {
    updateTabState("logEvents", event, true);
  };
  gb.logs.forEach(onLogEvent);
  gb.logs.push = (...events: LogUnion[]) => {
    const retVal = Array.prototype.push.apply(gb.logs, events);
    events.forEach(onLogEvent);
    return retVal;
  };
}

let cachedHostRes: any = undefined;
let cachedStreamingHostRes: any = undefined;
async function SDKHealthCheck(gb?: GrowthBook): Promise<SDKHealthCheckResult> {
  if (!gb) {
    return {
      canConnect: false,
      hasPayload: false,
      sdkFound: false,
      devModeEnabled: false,
      errorMessage: "SDK not found",
    };
  }
  // @ts-expect-error
  const gbContext = gb.context;

  const devModeEnabled = gbContext?.enableDevMode;

  const [apiHost, clientKey] = gb.getApiInfo();

  const payload = gb.getDecryptedPayload?.() || {
    features: gb.getFeatures?.(),
    experiments: gb.getExperiments?.(),
  };
  const hasPayload =
    !!gb.getDecryptedPayload?.() ||
    (Object.keys(gb.getFeatures?.() || {}).length > 0 ||
      (gb.getExperiments?.() || []).length > 0);
  // check if payload was decrypted
  const hasDecryptionKey = !!gbContext?.decryptionKey;
  let payloadDecrypted = true;
  try {
    JSON.stringify(payload);
  } catch (e) {
    payloadDecrypted = false;
  }

  const _trackingCallback = gbContext?.trackingCallback;
  const hasTrackingCallback =
    typeof _trackingCallback === "function" &&
    !_trackingCallback.isNoopCallback;
  const trackingCallbackParams = hasTrackingCallback
    ? _trackingCallback.originalParams
    : undefined;

  const usingLogEvent = typeof gbContext?.eventLogger === "function";

  const onFeatureUsage = gbContext?.onFeatureUsage;
  const usingOnFeatureUsage =
    typeof onFeatureUsage === "function" &&
    !onFeatureUsage.isNoopCallback;

  const isRemoteEval = !!gb.isRemoteEval?.();

  const usingStickyBucketing = gbContext?.stickyBucketService !== undefined;
  const stickyBucketAssignmentDocs = gbContext?.stickyBucketAssignmentDocs;

  const apiRequestHeaders = gbContext?.apiRequestHeaders;
  let res = undefined;
  if (clientKey) {
    try {
      res =
        cachedHostRes ??
        (await fetch(`${apiHost}/api/features/${clientKey}`, {
          headers: apiRequestHeaders,
        }));
      if (res.status === 200) {
        cachedHostRes = res;
      }
    } catch (e) {
      // ignore
    }
  }

  const streaming = !!gbContext.backgroundSync;
  const streamingHost = gbContext?.streamingHost || apiHost;
  const streamingHostRequestHeaders = gbContext?.streamingHostRequestHeaders;
  let streamingRes = undefined;
  if (streaming) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        headers: streamingHostRequestHeaders,
      },
      body: JSON.stringify(payload),
    };
    streamingRes =
      cachedHostRes ??
      (await fetch(`${streamingHost}/api/eval/${clientKey}`, options));
    if (streamingRes.status === 200) {
      cachedStreamingHostRes = streamingRes;
    }
  }
  const canConnect = !!(res?.status === 200 || streamingRes?.status === 200);

  return {
    canConnect,
    hasClientKey: !!clientKey,
    hasPayload,
    devModeEnabled,
    version: gb?.version,
    hasWindowConfig: !!window?.growthbook_config,
    sdkFound: true,
    clientKey,
    payload,
    hasTrackingCallback,
    trackingCallbackParams,
    hasDecryptionKey,
    payloadDecrypted,
    usingLogEvent,
    usingOnFeatureUsage,
    isRemoteEval,
    usingStickyBucketing,
    stickyBucketAssignmentDocs,
    streaming,
    apiHost,
    streamingHost,
    apiRequestHeaders,
    streamingHostRequestHeaders,
    errorMessage:
      res?.error || !!clientKey ? undefined : "No Client Key was found",
  };
}

export function getQueryState() {
  try {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("_gbdebug");
    if (!state) return null;
    const decoded = decodeURIComponent(state);
    const data = JSON.parse(decoded);
    params.delete("_gbdebug");
    window.history.replaceState(null, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
    return data;
  } catch (e) {
    console.error("Failed to parse query state", e);
    return null;
  }
}

// start running
init();
