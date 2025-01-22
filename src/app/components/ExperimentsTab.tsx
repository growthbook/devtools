import React from "react";
import useTabState from "../hooks/useTabState";
import { Experiment } from "@growthbook/growthbook";

export default function ExperimentsTab() {
  const [sdkExperiments] = useTabState<Record<string, Experiment<any>>>(
    "sdkAttributes",
    {}
  );
  return (
    <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
      <div className="label">Experiments</div>
      <textarea value={JSON.stringify(sdkExperiments, null, 2)} />
    </div>
  );
}
