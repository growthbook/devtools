import React from "react";
import { Attributes } from "@growthbook/growthbook";

export default function AttributesForm({
  attributeValues,
}: {
  attributeValues?: Attributes;
}) {
  return <textarea value={JSON.stringify(attributeValues, null, 2)} />;
}
