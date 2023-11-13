import React from "react";
import { RxExclamationTriangle } from "react-icons/rx";
import Tooltip from "./Tooltip";

export default function SDKWarning({
  hasSDK,
  hasLatest,
  hasHashAttribute,
  hashAttribute,
}: {
  hasSDK: boolean;
  hasLatest: boolean;
  hasHashAttribute: boolean;
  hashAttribute: string;
}) {
  if (hasSDK && hasLatest && hasHashAttribute) return null;

  return (
    <Tooltip label="An issue has been detected that will prevent visual experiments from rendering correctly for users. Your changes will be saved however they may not work as expected when the experiment is run.">
      <div className="gb-text-xs gb-flex gb-text-yellow-600 gb-items-center  gb-py-2">
        <div>
          <RxExclamationTriangle className="gb-mr-1" />
        </div>
        <div className="gb-text-left gb-px-2">
          {!hasSDK ? (
            <>GrowthBook SDK not detected on this page.</>
          ) : !hasHashAttribute ? (
            <>
              Your GrowthBook SDK is missing its hash attribute. Please be sure
              to set the attribute '{hashAttribute}' when loading the SDK.
            </>
          ) : (
            <>
              GrowthBook SDK on this page is out of date. Features may not work
              as expected.
            </>
          )}
        </div>
      </div>
    </Tooltip>
  );
}
