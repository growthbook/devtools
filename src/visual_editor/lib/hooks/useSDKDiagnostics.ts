import React, { useEffect, useState } from "react";

// technically doesn't have to be the latest version but the most recent version
// with breaking changes
const LATEST_SDK_VERSION = "0.30.0";

type UseSDKDiagnosticsHook = () => {
  hasSDK: boolean;
  hasLatest: boolean;
  version: string;
};

const useSDKDiagnostics: UseSDKDiagnosticsHook = () => {
  const [{ hasSDK, hasLatest }, setSDKStatus] = useState({
    hasSDK: false,
    hasLatest: false,
  });
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (!window) return;
    const onLoad = () => {
      setSDKStatus({
        hasSDK: !!window._growthbook,
        hasLatest: window._growthbook?.version === LATEST_SDK_VERSION,
      });

      if (window._growthbook?.version)
        setVersion(window._growthbook?.version || "");
    };
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return {
    hasSDK,
    hasLatest,
    version,
  };
};

export default useSDKDiagnostics;
