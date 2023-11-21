import React, { useEffect, useState } from "react";
import {
  APIExperiment,
  ErrorMessage,
  Message,
  RefreshMessage,
  SetOverridesMessage,
} from "../../../../devtools";
import MessageSender = chrome.runtime.MessageSender;

// technically doesn't have to be the latest version but the most recent version
// with breaking changes
const LATEST_SDK_VERSION = "0.30.0";

type UseSDKDiagnosticsHook = (args: { experiment: APIExperiment | null }) => {
  hasSDK: boolean;
  hasLatest: boolean;
  version: string;
  hashAttribute: string;
  hasHashAttribute: boolean;
};

const useSDKDiagnostics: UseSDKDiagnosticsHook = ({ experiment }) => {
  const [{ hasSDK, hasLatest }, setSDKStatus] = useState({
    hasSDK: false,
    hasLatest: false,
  });
  const [version, setVersion] = useState("");
  const [hashAttribute, setHashAttr] = useState("");
  const [hasHashAttribute, setHasHashAttr] = useState(false);

  useEffect(() => {
    setHashAttr(experiment?.hashAttribute || "");
  }, [experiment]);

  useEffect(() => {
    const sdkAttributes = hasSDK ? window._growthbook?.getAttributes() : {};
    setHasHashAttr(
      hasSDK
        ? !!sdkAttributes?.hasOwnProperty(experiment?.hashAttribute || "")
        : false
    );
  }, [hasSDK, hashAttribute]);

  useEffect(() => {
    const update = () => {
      setSDKStatus({
        hasSDK: !!window._growthbook,
        hasLatest:
          (window._growthbook?.version || "0.0.0") > LATEST_SDK_VERSION,
      });
      if (window._growthbook?.version)
        setVersion(window._growthbook?.version || "");
    };

    const messageHandler = async (event: MessageEvent<any>) => {
      const data = event.data ?? {};
      if (data.type !== "GB_REFRESH") return;
      update();
    };

    window.addEventListener("message", messageHandler);

    // send ping to SDK
    window.postMessage("GB_REQUEST_REFRESH", "*");
    update();

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return {
    hasSDK,
    hasLatest,
    version,
    hashAttribute,
    hasHashAttribute,
  };
};

export default useSDKDiagnostics;
