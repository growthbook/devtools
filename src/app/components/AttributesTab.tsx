import React from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";

export default function AttributesTab() {
  const [sdkAttributes] = useTabState<Attributes>("sdkAttributes", {});

  return (
    <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
      <div className="label">Attributes</div>
      <textarea value={JSON.stringify(sdkAttributes, null, 2)} />
    </div>
  );
}
