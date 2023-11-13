import React, { ReactNode } from "react";
import { APIExperiment, APIVisualChangeset } from "../../../devtools";
import { isURLTargeted } from "@growthbook/growthbook";
import { IoMdCloseCircle, IoMdCheckmarkCircle } from "react-icons/io";
import Tooltip from "./Tooltip";

const Row = ({ children }: { children: ReactNode }) => (
  <div className="gb-py-2 gb-px-4 gb-bg-slate-700 odd:gb-bg-slate-600 first:gb-rounded-t last:gb-rounded-b">
    {children}
  </div>
);

const GreenCheck = () => (
  <IoMdCheckmarkCircle className="gb-text-green-400 gb-w-4 gb-h-4 gb-inline" />
);

const RedX = () => (
  <IoMdCloseCircle className="gb-text-red-400 gb-w-4 gb-h-4 gb-inline" />
);

export default function DebugPanel({
  experiment,
  visualChangeset,
  hasSDK,
  sdkVersion,
  hashAttribute,
  hasHashAttribute,
}: {
  experiment: APIExperiment | null;
  visualChangeset: APIVisualChangeset | null;
  hasSDK: boolean;
  sdkVersion: string;
  hashAttribute: string;
  hasHashAttribute: boolean;
}) {
  return (
    <div className="gb-text-light gb-px-4 gb-text-sm">
      <Row>
        Experiment ID:{" "}
        <div className="gb-text-white">
          {experiment ? experiment.id : "N/A"}
        </div>
      </Row>

      <Row>
        Hash Attribute:{" "}
        <div className="gb-text-white">
          <ul className="gb-ml-4 gb-list-disc">
            <li>
              <code className="gb-text-xs gb-inline-block gb-max-w-full gb-whitespace-nowrap gb-text-ellipsis gb-overflow-hidden gb-bg-white gb-text-red-600 gb-rounded gb-px-1">
                {hashAttribute ? hashAttribute : ""}
              </code>
            </li>
            <li>
              {hasHashAttribute ? (
                <>
                  <GreenCheck /> Attribute is set
                </>
              ) : (
                <>
                  <RedX /> Attribute is not set
                </>
              )}
            </li>
          </ul>
        </div>
      </Row>

      <Row>
        Visual Changeset ID:{" "}
        <div className="gb-text-white">
          {visualChangeset ? visualChangeset.id : "N/A"}
        </div>
      </Row>

      <Row>
        GrowthBook SDK:
        <ul className="gb-list-disc gb-ml-4">
          <li className="gb-text-white">
            {hasSDK ? (
              <>
                <GreenCheck /> Detected
              </>
            ) : (
              <>
                <RedX /> Not detected
              </>
            )}
          </li>
          <li className="gb-text-white">
            Version: {sdkVersion ? sdkVersion : "Not detected"}
          </li>
        </ul>
      </Row>

      <Row>
        URL Targets:{" "}
        {visualChangeset?.urlPatterns.map((pattern, i) => (
          <div key={i} className="gb-my-2 gb-text-white">
            <Tooltip label={pattern.pattern}>
              <code className="gb-text-xs gb-inline-block gb-max-w-full gb-whitespace-nowrap gb-text-ellipsis gb-overflow-hidden gb-bg-white gb-text-red-600 gb-rounded gb-px-1">
                {pattern.pattern}
              </code>
            </Tooltip>
            <ul className="gb-ml-4 gb-list-disc">
              <li>{pattern.include ? "include" : "exclude"}</li>
              <li>{pattern.type}</li>
              <li>
                <div className="gb-mr-1">
                  {isURLTargeted(window.location.href, [pattern]) ? (
                    <>
                      <GreenCheck /> Targets this page
                    </>
                  ) : (
                    <>
                      <RedX /> Does not target this page
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
        ))}
      </Row>
    </div>
  );
}
