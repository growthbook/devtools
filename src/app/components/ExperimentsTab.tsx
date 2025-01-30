import React from "react";
import useTabState from "../hooks/useTabState";
import { Experiment } from "@growthbook/growthbook";

export default function ExperimentsTab() {
  const [experiments] = useTabState<Experiment<any>[]>("experiments", []);
  return (
    <div className="box mb-3">
      <div className="label lg">Experiments</div>
      <textarea value={JSON.stringify(experiments, null, 2)} />
    </div>
  );
}
