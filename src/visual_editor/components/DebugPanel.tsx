import React, { ReactNode } from "react";
import { APIExperiment, APIVisualChangeset } from "devtools";
import { isURLTargeted } from "@growthbook/growthbook";
import { IoMdCloseCircle, IoMdCheckmarkCircle } from "react-icons/io";
import Tooltip from "./Tooltip";

const Row = ({ children }: { children: ReactNode }) => (
  <div className="py-2 px-4 bg-slate-700 odd:bg-slate-600 first:rounded-t last:rounded-b">
    {children}
  </div>
);

const GreenCheck = () => (
  <IoMdCheckmarkCircle className="text-green-400 w-4 h-4 inline" />
);

const RedX = () => <IoMdCloseCircle className="text-red-400 w-4 h-4 inline" />;

export default function DebugPanel({
  experiment,
  visualChangeset,
  hasSDK,
  hasLatest,
  sdkVersion,
  hashAttribute,
  hasHashAttribute,
}: {
  experiment: APIExperiment | null;
  visualChangeset: APIVisualChangeset | null;
  hasSDK: boolean;
  hasLatest: boolean;
  sdkVersion: string;
  hashAttribute: string;
  hasHashAttribute: boolean;
}) {
  return (
    <div className="text-light px-4 text-sm">
      <Row>
        Experiment ID:{" "}
        <div className="text-white">{experiment ? experiment.id : "N/A"}</div>
      </Row>

      <Row>
        Visual Changeset ID:{" "}
        <div className="text-white">
          {visualChangeset ? visualChangeset.id : "N/A"}
        </div>
      </Row>

      <Row>
        GrowthBook SDK:
        <ul className="list-disc ml-4">
          <li className="text-white">
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
          <li className="text-white">
            Version: {sdkVersion ? sdkVersion : "Not detected"}
          </li>
          <li className="text-white">
            {hasLatest ? (
              <>
                <GreenCheck /> Up to date
              </>
            ) : (
              <>
                <RedX /> Out of date
              </>
            )}
          </li>
        </ul>
      </Row>

      <Row>
        Hash Attribute:{" "}
        <div className="text-white">
          <ul className="ml-4 list-disc">
            <li>
              <code className="text-xs inline-block max-w-full whitespace-nowrap text-ellipsis overflow-hidden bg-surface text-red-600 rounded px-1">
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
        URL Targets:{" "}
        {visualChangeset?.urlPatterns.map((pattern, i) => (
          <div key={i} className="my-2 text-white">
            <Tooltip label={pattern.pattern}>
              <code className="text-xs inline-block max-w-full whitespace-nowrap text-ellipsis overflow-hidden bg-surface text-red-600 rounded px-1">
                {pattern.pattern}
              </code>
            </Tooltip>
            <ul className="ml-4 list-disc">
              <li>{pattern.include ? "include" : "exclude"}</li>
              <li>{pattern.type}</li>
              <li>
                <div className="mr-1">
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
