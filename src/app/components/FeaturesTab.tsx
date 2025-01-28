import React from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";

export default function FeaturesTab() {
  const [sdkFeatures] = useTabState<Record<string, FeatureDefinition>>(
    "sdkFeatures",
    {},
  );
  return (
    <div className="box mb-3">
      <div className="label">Features</div>
      <textarea value={JSON.stringify(sdkFeatures, null, 2)} />
    </div>
  );
}
