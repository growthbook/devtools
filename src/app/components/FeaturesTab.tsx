import React from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";

export default function FeaturesTab() {
  const [sdkFeatures] = useTabState<Record<string, FeatureDefinition>>(
    "sdkFeatures",
    {}
  );
  return (
    <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
      <div className="label">Features</div>
      <textarea value={JSON.stringify(sdkFeatures, null, 2)} />
    </div>
  );
}
