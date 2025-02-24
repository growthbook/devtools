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
          <button>
            <PiCheckCircleFill className="inline-block mr-1.5 mb-0.5 text-amber-600" />
          </button>
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
          <button>
            <PiCheckCircleBold className="inline-block mr-1.5 mb-0.5 text-violet-8" />
          </button>
        </Tooltip>
      );
    }
  }

  if (forced) {
    return (
      <Tooltip content={`Overridden`}>
        <button>
          <PiCircleDuotone className="inline-block mr-1.5 mb-0.5 text-amber-600" />
        </button>
      </Tooltip>
    );
  } else {
    return (
      <PiCheckCircleThin className="inline-block mr-1.5 mb-0.5 text-gray-a5" />
    );
  }
}
