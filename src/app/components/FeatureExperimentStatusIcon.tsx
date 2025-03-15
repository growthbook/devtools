import {
  PiCheckCircleBold,
  PiCheckCircleFill,
  PiCheckCircleThin,
  PiCircleDuotone,
} from "react-icons/pi";
import { Tooltip } from "@radix-ui/themes";
import React from "react";

export default function FeatureExperimentStatusIcon({
  forced,
  evaluated,
  type,
}: {
  forced: boolean;
  evaluated: boolean;
  type: "feature" | "experiment";
}) {
  if (evaluated) {
    if (forced) {
      return (
        <Tooltip
          content={
            type === "feature"
              ? "Evaluated on this page; overridden"
              : "Active on this page; overridden"
          }
        >
          <span>
            <PiCheckCircleFill className="inline-block mr-1.5 mb-0.5 text-amber-600" />
          </span>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          content={
            type === "feature"
              ? "Evaluated on this page"
              : "Active on this page."
          }
        >
          <span>
            <PiCheckCircleBold className="inline-block mr-1.5 mb-0.5 text-violet-8" />
          </span>
        </Tooltip>
      );
    }
  }

  if (forced) {
    return (
      <Tooltip content={`Overridden`}>
        <span>
          <PiCircleDuotone className="inline-block mr-1.5 mb-0.5 text-amber-600" />
        </span>
      </Tooltip>
    );
  } else {
    return (
      <PiCheckCircleThin className="inline-block mr-1.5 mb-0.5 text-gray-a5" />
    );
  }
}
