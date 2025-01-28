import React from "react";
import useTabState from "../hooks/useTabState";
import { Experiment } from "@growthbook/growthbook";

export default function ExperimentsTab() {
  const [sdkExperiments] = useTabState<Record<string, Experiment<any>>>(
    "sdkAttributes",
    {},
  );
  return (
    <div className="box mb-3">
      <div className="label">Experiments</div>
      <textarea value={JSON.stringify(sdkExperiments, null, 2)} />
    </div>
  );
}
