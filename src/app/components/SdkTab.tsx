import React from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";

export default function SdkTab() {
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const { sdkFound, version, errorMessage, canConnect, hasPayload } = sdkData as SDKHealthCheckResult;
  console.log("data for sdk", sdkData);
  return (
    <div className="box mb-3 Z">
      <div className="label">GrowthBook SDK</div>
      {sdkFound ? (
        canConnect ? (
          <div>
            <h4>🟢 SDK connected</h4>
            <div><strong>SDK Version: </strong> <em>{version}</em></div>
          </div>
        ) :  hasPayload ?(
          <div>
            <h4>🟠 SDK Not connecting Payload Found </h4>
            <em>We where able to find a payload but unable to connect to Growthbook with API client Key</em>
            <div><strong>API error message: </strong><em> {errorMessage}</em></div>
            <div><strong>SDK Version: </strong> <em>{version}</em></div>

          </div>
        ) : (
          <div>
            <h4>🔴 SDK not connected</h4>
            <div><strong>API error message: </strong><em> {errorMessage}</em></div>
            {!!version ? <div><strong>SDK Version: </strong> <em>{version}</em></div> :
            <div> <em>Version Not Found your version might be less than 0.29.0</em></div>}
          </div>
        )
      ) : sdkFound === false ? (
        <div>
          <h4>⚪ no SDK present</h4>
          <em>Refer to the <a href="https://docs.growthbook.io/lib/js" target="_blank" rel="noopener noreferrer">Getting Started with GrowthBook SDK</a> documentation</em>
        </div>
        ) : (
        <div>
          <em>Loading...</em>
        </div>
      )}
    </div>
  );
}
