import React from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";

export default function SdkTab() {
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const { sdkFound, version, errorMessage, canConnect, hasPayload } = sdkData as SDKHealthCheckResult;
  return (
    <div className="box mb-3 Z">
      <div className="label">GrowthBook SDK</div>
      {sdkFound ? (
        canConnect ? (
          <div>
            <h4>🟢 SDK connected</h4>
            <strong>{version}</strong>
          </div>
        ) :  hasPayload ?(
          <div>
            <h4>🟠 SDK Not connecting Payload Found </h4>
            <em>We where able to find a payload but unable to connect to Growthbook with API client Key</em>
            <strong>API error message: </strong><em> {errorMessage}</em>
          </div>
        ) : (
          <div>
            <h4>🔴 SDK not connected</h4>
            <strong>API error message: </strong><em> {errorMessage}</em>
          </div>)
      ) : sdkFound === false ? (
        <h4>⚪ no SDK present</h4>
      ) : (
        <div>
          <em>Loading...</em>
        </div>
      )}
    </div>
  );
}
