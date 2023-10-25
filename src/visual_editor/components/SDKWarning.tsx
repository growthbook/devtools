import { RxExclamationTriangle } from "react-icons/rx";
import React, { useEffect, useState } from "react";

// technically doesn't have to be the latest version but the most recent version
// with breaking changes
const LATEST_SDK_VERSION = "0.30.0";

export default function SDKWarning() {
  const [{ hasSDK, hasLatest }, setSDKStatus] = useState({
    hasSDK: false,
    hasLatest: false,
  });

  useEffect(() => {
    if (!window) return;
    setSDKStatus({
      hasSDK: !!window._growthbook,
      hasLatest: window._growthbook?.version === LATEST_SDK_VERSION,
    });
  }, []);

  if (hasSDK && hasLatest) return null;

  return (
    <div className="gb-text-xs gb-flex gb-text-yellow-600 gb-items-center gb-py-2">
      <div>
        <RxExclamationTriangle className="gb-mr-1" />
      </div>
      <div>
        {!hasSDK ? (
          <>GrowthBook SDK not detected on this page.</>
        ) : (
          <>
            GrowthBook SDK on this page is out of date. Features may not work as
            expected.
          </>
        )}
      </div>
    </div>
  );
}
