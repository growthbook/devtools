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

type LogUnionWithSource = LogUnion & { source?: string; clientKey?: string };

type StateObj = {
  attributes?: Record<string, any>;
  features?: Record<string, any>;
  experiments?: Record<string, number>;
  payload?: FeatureApiResponse;
  patchPayload?: FeatureApiResponse;
  logs?: LogUnionWithSource[];
};

type ExternalSdkInfo = {
  apiHost: string;
  clientKey: string;
  version?: string;
  payload?: FeatureApiResponse;
  attributes?: Attributes;
};

type LogEvent = {
  logs: LogUnion[];
  source?: string;
  sdkInfo?: ExternalSdkInfo;
};

declare global {
  interface Window {
    _growthbook?: GrowthBook;
    growthbook_config?: any;
    _gbdebugEvents: LogEvent[] & {
      push: ((...events: LogEvent[]) => number) & { _patched?: boolean };
    };
  }
}

const externalSdks: Record<string, ExternalSdkInfo> = {};

function getValidGrowthBookInstance(cb: (gb: GrowthBook) => void) {
  if (!window._growthbook) return false;
  cb(window._growthbook);
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
      externalSdks: externalSdks,
      devModeEnabled: false,
      errorMessage: "SDK not found",
    });
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

  const injectSdkConfig = getCookie<{ apiHost: string; clientKey: string }>(
    "_gbInjectSdk",
  );
  if (injectSdkConfig) {
    injectSdk({ ...injectSdkConfig, fromCookie: true });
  }

  pushAppUpdates();
  const queryState = getQueryState();
  if (!queryState) {
    pullOverrides();
  } else {
    hydrateApp(queryState);
  }

  // ingest existing backend events
  let existingEvents = [...window._gbdebugEvents];
  window._gbdebugEvents.length = 0;
  window._gbdebugEvents.push(...existingEvents);
}

function hydrateApp(state: StateObj) {
  onGrowthBookLoad((gb) => {
    if (state?.attributes && typeof state.attributes === "object") {
      gb?.setAttributeOverrides?.(state.attributes);
    }
    if (state?.features && typeof state.features === "object") {
      let forcedFeaturesMap = new Map(Object.entries(state.features));
      gb?.setForcedFeatures?.(forcedFeaturesMap);
    }
    if (state?.experiments && typeof state.experiments === "object") {
      gb?.setForcedVariations?.(state.experiments);
    }
    if (state?.payload && typeof state.payload === "object") {
      setPayload(state.payload);
    }
    if (state?.patchPayload && typeof state.patchPayload === "object") {
      patchPayload(state.patchPayload);
    }
    // logs are imported by hydration only
    if (state?.logs && Array.isArray(state.logs)) {
      importLogs(state.logs);
    }
  });
}

function importLogs(logs: LogUnionWithSource[]) {
  const logsWithSource = logs.map((log: any) => ({
    ...log,
    source: log.source ? log.source : "external",
  }));
  updateTabState("logEvents", logsWithSource, true);
}

function ingestLogEvent(event: LogEvent) {
  const sdkInfo = event.sdkInfo;
  if (sdkInfo) {
    externalSdks[sdkInfo?.clientKey || "unknown"] = sdkInfo;
    pushSdkHealthUpdate(window._growthbook);
  }
  if (typeof sdkInfo?.attributes === "object" && sdkInfo.attributes !== null) {
    if (!window._growthbook) {
      updateTabState("attributes", sdkInfo.attributes);
    }
  }
  if (sdkInfo?.payload) {
    if (!window._growthbook) {
      updateTabState("features", sdkInfo.payload?.features || {});
      updateTabState("experiments", sdkInfo.payload?.experiments || []);
    } else {
      // todo: smarter patching, tag by source
      patchPayload(sdkInfo.payload);
    }
  }
  importLogs(event.logs);
}

function pushAppUpdates() {
  // todo: push payload for multiple sdks / clientKeys?
  updateTabState("url", window.location.href || "");
  onGrowthBookLoad((gb) => {
    pushSdkHealthUpdate(gb);
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

async function pushSdkHealthUpdate(gb?: GrowthBook) {
  const sdkData = await sdkHealthCheck(gb);
  updateTabState("sdkData", sdkData);
  updateBackgroundSdk(sdkData);
}

function injectSdk(message: any) {
  if (window._growthbook) return;
  const { apiHost, clientKey, autoInject } = message;
  const script = document.createElement("script");
  script.id = "injected_sdk";
  script.dataset.apiHost = apiHost;
  script.dataset.clientKey = clientKey;
  script.src =
    "https://cdn.jsdelivr.net/npm/@growthbook/growthbook/dist/bundles/auto.min.js";
  document.head.appendChild(script);
  if (autoInject) {
    const payloadObj = { apiHost, clientKey };
    const cookiePayload = encodeURIComponent(JSON.stringify(payloadObj));
    document.cookie = `_gbInjectSdk=${cookiePayload}; path=/; domain=${window.location.hostname}`;
  }

  onGrowthBookLoad((gb) => {
    if (!gb) return;
    // @ts-expect-error
    gb.injected = true;
    // @ts-expect-error
    gb.autoInjected = message.autoInject || message.fromCookie;
    pushAppUpdates();
  });
}

function clearInjectedSdk() {
  if (!window._growthbook) return;
  document.cookie = `_gbInjectSdk=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  updateTabState("sdkData", {
    canConnect: false,
    hasPayload: false,
    sdkFound: false,
    externalSdks: externalSdks,
    devModeEnabled: false,
    errorMessage: "SDK not found",
  });
  updateTabState("features", {});
  updateTabState("experiments", []);
  updateTabState("attributes", {});
  updateTabState("forcedFeatures", new Map());
  updateTabState("forcedVariations", {});
  updateTabState("overriddenAttributes", {});
  writeStateToCookie({}, true);
  window.location.reload();
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
      case "GB_INJECT_SDK":
        injectSdk(message);
        break;
      case "GB_CLEAR_INJECTED_SDK":
        clearInjectedSdk();
        break;
      case "COPY_TO_CLIPBOARD":
        if (message.value) {
          window.focus();
          navigator.clipboard.writeText(message.value);
        }
        break;
      case "SET_PAYLOAD":
        if (message.data) {
          setPayload(message.data);
        }
        break;
      case "PATCH_PAYLOAD":
        if (message.data) {
          patchPayload(message.data);
        }
        break;
      default:
        return;
    }
  });

  // Listen to tab/window focus, force refresh
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pushAppUpdates();
    }
  });

  // Create the backend events array and listen to changes
  window._gbdebugEvents = window._gbdebugEvents || [];
  if (!window._gbdebugEvents.push._patched) {
    window._gbdebugEvents.push = (...events: LogEvent[]) => {
      events.forEach((event) => ingestLogEvent(event));
      return events.length;
    };
    window._gbdebugEvents.push._patched = true;
  }
}

function updateAttributes(data: unknown) {
  if (typeof data === "object" && data !== null) {
    writeStateToCookie({ attributes: data });
    onGrowthBookLoad((gb) => {
      gb.setAttributeOverrides?.(data as Attributes); // {} to reset
      updateTabState("attributes", gb.getAttributes?.() || {}); // so that when we reset it will reset back to the original attributes
    });
  }
}

function updateFeatures(data: unknown) {
  if (!data) return;
  writeStateToCookie({ features: data });
  onGrowthBookLoad((gb) => {
    gb.setForcedFeatures?.(
      new Map(Object.entries(data as Record<string, any>)),
    );
  });
}

function updateExperiments(data: unknown) {
  if (!data) return;
  writeStateToCookie({ experiments: data as Record<string, number> });
  onGrowthBookLoad((gb) => {
    gb.setForcedVariations?.(data as Record<string, number>);
  });
}

function setPayload(data: FeatureApiResponse) {
  if (!data) return;
  onGrowthBookLoad((gb) => {
    if (gb.setPayload) {
      gb.setPayload(data);
    } else {
      if (gb.setFeatures && data.features) {
        gb.setFeatures(data.features);
      }
      if (gb.setExperiments && data.experiments) {
        gb.setExperiments(data.experiments);
      }
    }
  });
}

function patchPayload(data: FeatureApiResponse) {
  if (!data) return;
  onGrowthBookLoad((gb) => {
    const payload = gb.getDecryptedPayload?.() || {
      features: gb.getFeatures?.(),
      experiments: gb.getExperiments?.(),
    };
    Object.keys(data).forEach((key) => {
      const k = key as keyof FeatureApiResponse;
      if (!payload[k]) {
        // @ts-ignore
        payload[k] = data[k];
      } else {
        if (typeof payload[k] === "object") {
          // @ts-ignore
          payload[k] = { ...payload[k], ...data[k] };
        }
      }
    });

    if (gb.setPayload) {
      gb.setPayload(payload);
    } else {
      if (gb.setFeatures && payload.features) {
        gb.setFeatures(payload.features);
      }
      if (gb.setExperiments && payload.experiments) {
        gb.setExperiments(payload.experiments);
      }
    }
  });
}

async function updateBackgroundSdk(data: SDKHealthCheckResult) {
  window.postMessage({ type: "GB_SDK_UPDATED", data }, window.location.origin);
}

// send a message that the tabstate has been updated
function updateTabState(property: string, value: unknown, append = false) {
  window.postMessage(
    {
      type: "UPDATE_TAB_STATE",
      data: { property, value },
      append,
    },
    window.location.origin,
  );
}

// Prompt the content script to send the existing overrides on pageload
function pullOverrides() {
  window.postMessage({ type: "GB_REQUEST_OVERRIDES" }, window.location.origin);
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
    writeStateToCookie({ attributes });
  };

  const _setForcedFeatures = gb.setForcedFeatures;
  gb.setForcedFeatures = (map: Map<string, any>) => {
    _setForcedFeatures?.call(gb, map);
    const features = Object.fromEntries(gb.getForcedFeatures?.() || new Map());
    updateTabState("forcedFeatures", features);
    writeStateToCookie({ features });
  };

  const _setForcedVariations = gb.setForcedVariations;
  gb.setForcedVariations = async (vars: Record<string, number>) => {
    await _setForcedVariations?.call(gb, vars);
    const experiments = gb.getForcedVariations?.() || {};
    updateTabState("forcedVariations", experiments);
    writeStateToCookie({ experiments });
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
async function sdkHealthCheck(gb?: GrowthBook): Promise<SDKHealthCheckResult> {
  if (!gb) {
    return {
      canConnect: false,
      hasPayload: false,
      sdkFound: false,
      externalSdks: externalSdks,
      devModeEnabled: false,
      errorMessage: "SDK not found",
    };
  }
  // @ts-expect-error
  const gbContext = gb.context;

  const devModeEnabled = gbContext?.enableDevMode;

  // @ts-expect-error
  const sdkInjected = !!gb?.injected;
  // @ts-expect-error
  const sdkAutoInjected = !!gb?.autoInjected;

  const [apiHost, clientKey] = gb.getApiInfo();

  const payload = gb.getDecryptedPayload?.() || {
    features: gb.getFeatures?.(),
    experiments: gb.getExperiments?.(),
  };
  const hasPayload =
    Object.keys(payload?.features || {}).length > 0 ||
    (payload?.experiments || []).length > 0;

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
    typeof onFeatureUsage === "function" && !onFeatureUsage.isNoopCallback;

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
    sdkInjected,
    sdkAutoInjected,
    externalSdks: externalSdks,
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

function getQueryState(): StateObj | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("_gbdebug");
    if (!state) return null;
    const decoded = decodeURIComponent(state);
    const data = JSON.parse(decoded);
    params.delete("_gbdebug");
    window.history.replaceState(
      null,
      "",
      window.location.pathname +
        (params.toString() ? "?" + params.toString() : ""),
    );
    return data;
  } catch (e) {
    console.error("Failed to parse query state", e);
    return null;
  }
}

// state vars:
function writeStateToCookie(state: StateObj, reset?: boolean) {
  let existingState: StateObj = (reset ? {} : getCookie("_gbdebug")) || {};

  const attributes = state.attributes ?? existingState.attributes;
  const features = state.features ?? existingState.features;
  const experiments = state.experiments ?? existingState.experiments;

  const payloadObj: StateObj = {
    ...(Object.keys(attributes || {}).length ? { attributes } : {}),
    ...(Object.keys(features || {}).length ? { features } : {}),
    ...(Object.keys(experiments || {}).length ? { experiments } : {}),
  };
  if (Object.keys(payloadObj || {}).length) {
    const cookiePayload = encodeURIComponent(JSON.stringify(payloadObj));
    document.cookie = `_gbdebug=${cookiePayload}; path=/; domain=${window.location.hostname}`;
  } else {
    document.cookie = `_gbdebug=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  }
}

function getCookie<T = string>(name: string): T | null {
  try {
    const cookieString = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`));
    if (!cookieString) return null;
    return JSON.parse(
      decodeURIComponent(cookieString.substring(name.length + 1)),
    ) as T;
  } catch (e) {
    console.error("Failed to parse cookie", e);
    return null;
  }
}

// start running
init();
