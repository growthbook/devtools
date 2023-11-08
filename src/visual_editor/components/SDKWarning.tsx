import React from "react";
import { RxExclamationTriangle } from "react-icons/rx";

export default function SDKWarning({
  hasSDK,
  hasLatest,
}: {
  hasSDK: boolean;
  hasLatest: boolean;
}) {
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
