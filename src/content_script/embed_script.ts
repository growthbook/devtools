import type {
  Experiment,
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
    false
  );
}

// Send a refresh message back to content script
function init() {
  setupListeners();
  pushAppUpdates();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pushAppUpdates();
    }
  });
}

function pushAppUpdates() {
  updateTabState("url", window.location.href || "");
  onGrowthBookLoad((gb) => {
    pushSDKUpdate(gb);
    if (gb) {
      subscribeToSdkChanges(gb);
      updateTabState("attributes", gb.getAttributes());
      updateTabState("features", gb.getFeatures());
      updateTabState("experiments", gb.getExperiments());
      updateTabState("forcedFeatures", gb.getForcedFeatures());
      updateTabState("forcedVariations", gb.getForcedVariations());
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
      default:
        return;
    }
  });
}

function updateAttributes(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (typeof data === "object" && data !== null) {
      gb.setAttributes(data as Attributes);
    } else {
      // todo: do something with these messages or remove them
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid attributes data",
      };
    }
  });
}

function updateFeatures(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (data) {
      gb.setForcedFeatures(
        new Map(Object.entries(data as Record<string, any>))
      );
    } else {
      // todo: do something with these messages or remove them
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid features data",
      };
    }
  });
}

function updateExperiments(data: unknown) {
  onGrowthBookLoad((gb) => {
    if (data) {
      gb.setForcedVariations(data as Record<string, number>);
    } else {
      // todo: do something with these messages or remove them
      const msg: ErrorMessage = {
        type: "GB_ERROR",
        error: "Invalid experiments data",
      };
    }
  });
}

async function updateBackgroundSDK(data: SDKHealthCheckResult) {
  window.postMessage(
    {
      type: "GB_SDK_UPDATED",
      data,
    },
    window.location.origin
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
    window.location.origin
  );
}

// add a proxy to the SDKs methods so we know when anything important has been changed programmatically
function subscribeToSdkChanges(
  gb: GrowthBook & { patchedMethods?: boolean; logs?: LogUnion[] }
) {
  if (gb.patchedMethods) return;
  gb.patchedMethods = true;
  // @ts-expect-error
  gb.context.debug = true;
  // @ts-expect-error
  gb.context.enableDevMode = true;
  const _setAttributes = gb.setAttributes;
  gb.setAttributes = async (attributes: Attributes) => {
    await _setAttributes.call(gb, attributes);
    updateTabState("attributes", gb.getAttributes());
  };
  if (gb.updateAttributes) {
    const _updateAttributes = gb.updateAttributes;
    gb.updateAttributes = async (attributes: Attributes) => {
      await _updateAttributes.call(gb, attributes);
      updateTabState("attributes", gb.getAttributes());
    };
  }
  gb.setAttributeOverrides = async (attributes: Attributes) => {
    const _setAttributeOverrides = gb.setAttributeOverrides;
    await _setAttributeOverrides.call(gb, attributes);
    updateTabState("attributes", gb.getAttributes());
  };

  const {
    trackingCallback,
    onFeatureUsage,
    // @ts-expect-error Context is private but we still need to read from it
  }: Options = gb.context;

  // Monkeypatches for logging on outdated sdk versions
  if (!gb.logs) {
    gb.logs = [];

    // Debug logs
    const _log = gb.log;
    gb.log = (msg: string, ctx: Record<string, unknown>) => {
      _log.call(gb, msg, ctx);
      gb.logs!.push({
        debug: { msg, ctx },
        timestamp: Date.now().toString(),
        logType: "debug",
      });
    };

    // Event logs
    const _logEvent = gb.logEvent;
    gb.logEvent = async (
      eventName: string,
      properties?: Record<string, unknown>
    ) => {
      gb.logs!.push({
        eventName,
        properties,
        timestamp: Date.now().toString(),
        logType: "event",
      });
      _logEvent.call(gb, eventName, properties);
    };

    // Experiment tracking callbacks
    const _setTrackingCallback = gb.setTrackingCallback;
    // Create a helper to automatically patch any callbacks the user sets
    gb.setTrackingCallback = (callback: TrackingCallback) => {
      const patchedCallBack = (
        experiment: Experiment<any>,
        result: Result<any>
      ) => {
        gb.logs!.push({
          experiment,
          result,
          timestamp: Date.now().toString(),
          logType: "experiment",
        });
        callback(experiment, result);
      };
      _setTrackingCallback.call(gb, patchedCallBack);
    };
    // Apply the patch helper above to the existing callback
    if (typeof trackingCallback === "function")
      gb.setTrackingCallback(trackingCallback);

    // Feature usage callbacks
    if (typeof onFeatureUsage === "function") {
      // @ts-expect-error Context is private but we still need to write it here
      gb.context.onFeatureUsage = (key: string, result: FeatureResult<any>) => {
        gb.logs!.push({
          featureKey: key,
          result,
          timestamp: Date.now().toString(),
          logType: "feature",
        });
        onFeatureUsage(key, result);
      };
    }
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
  const [apiHost, clientKey] = gb.getApiInfo();
  const payload = gb.getDecryptedPayload?.() || {
    features: gb.getFeatures(),
    experiments: gb.getExperiments(),
  };
  const hasPayload =
    !!gb.getDecryptedPayload?.() ||
    (Object.keys(gb.getFeatures()).length > 0 &&
      gb.getExperiments().length > 0);
  // @ts-expect-error
  const devModeEnabled = gb.context.enableDevMode;

  if (!clientKey) {
    return {
      canConnect: false,
      hasClientKey: false,
      hasPayload,
      devModeEnabled,
      sdkFound: true,
      version: gb?.version,
      errorMessage: "No API Client Key found",
    };
  }
  const res = await fetch(`${apiHost}/api/features/${clientKey}`);
  if (res.status === 200) {
    return {
      canConnect: true,
      hasClientKey: true,
      hasPayload,
      devModeEnabled,
      version: gb?.version,
      sdkFound: true,
      clientKey,
      payload,
    };
  } else {
    const data = await res.json();

    return {
      canConnect: false,
      hasPayload,
      devModeEnabled,
      hasClientKey: true,
      errorMessage: data.error,
      version: gb?.version,
      sdkFound: true,
      clientKey,
      payload,
    };
  }
}

// start running
init();
