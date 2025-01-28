import React from "react";
import useTabState from "../hooks/useTabState";

export default function SdkTab() {
  const [sdkFound] = useTabState<boolean | undefined>("sdkFound", undefined);
  const [sdkVersion] = useTabState<string>("sdkVersion", "");
  return (
    <div className="box mb-3">
      <div className="label">GrowthBook SDK</div>
      {sdkFound ? (
        <div>
          <h4>🟢 SDK connected</h4>
          <strong>{sdkVersion}</strong>
        </div>
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
