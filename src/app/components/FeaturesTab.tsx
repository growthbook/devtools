import React from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import { Avatar } from "@radix-ui/themes";
import { PiFlagBold } from "react-icons/pi";
import clsx from "clsx";
import TextareaAutosize from "react-textarea-autosize";
import {Prism} from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
const customTheme = {
  padding: "5px",
  margin: 0,
  border: "0px none",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  lineHeight: "12px",
};

export default function FeaturesTab() {
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const [forcedFeatures] = useTabState<Map<string, any>>(
    "forcedFeatures",
    new Map(),
  );
  let forcedFeaturesMap = new Map<string, any>();
  try {
    // because persistent state is JSON encoded, need to make sure this specific var is safe to use
    forcedFeaturesMap =
      forcedFeatures && forcedFeatures instanceof Map
        ? forcedFeatures
        : new Map(Object.entries(forcedFeatures));
  } catch (_) {
    // do nothing
  }

  const { evaluatedFeatures } = useGBSandboxEval();

  const [selectedFid, setSelectedFeature] = useTabState<string | undefined>(
    "selectedFid",
    undefined,
  );
  const selectedFeature = selectedFid
    ? getFeatureDetails({
        fid: selectedFid,
        features,
        evaluatedFeatures,
        forcedFeatures: forcedFeaturesMap,
      })
    : undefined;
  const clickFeature = (fid: string) =>
    setSelectedFeature(selectedFid !== fid ? fid : undefined);

  return (
    <>
      <div className="flex justify-between items-top">
        <div className="w-[50%] pr-2">
          <div className="label lg mb-2">Features</div>
          {Object.keys(features).map((fid, i) => {
            const { feature, meta, evaluatedFeature, isForced } =
              getFeatureDetails({
                fid,
                features,
                evaluatedFeatures,
                forcedFeatures: forcedFeaturesMap,
              });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            return (
              <div
                key={fid}
                className={clsx("featureCard relative mb-2", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div className="flex gap-2 items-center">
                  <Avatar size="1" radius="full" fallback={<PiFlagBold />} />
                  <code className="text-xs text-gray-800">{fid}</code>
                  <div className="flex-1" />
                  <code
                    className={clsx(
                      "flex-shrink-0 text-slate-800 line-clamp-3 max-w-[100px]",
                      {
                        "text-right text-xs": valueStr.length < 10,
                        "text-left text-2xs": valueStr.length >= 10,
                        "inline-block px-1 bg-rose-100 rounded-md text-rose-900":
                          valueStr === "false",
                        "inline-block px-1 bg-blue-100 rounded-md text-blue-900":
                          valueStr === "true",
                        "inline-block px-1 bg-gray-100 rounded-md text-gray-900":
                          valueStr === "null",
                      },
                    )}
                  >
                    {valueStr}
                  </code>
                </div>
                {isForced && (
                  <div className="absolute top-0 right-0">FORCED</div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="w-[50%] overflow-y-auto pl-2 pr-4 pt-3 pb-2 fixed right-0"
          style={{
            zIndex: 1000,
            top: 85,
            height: "calc(100vh - 85px)",
          }}
        >
          {!!selectedFeature && (
            <div key={`selected_${selectedFid}`}>
              <div className="flex items-center gap-2 mb-3">
                <Avatar size="2" radius="full" fallback={<PiFlagBold />} />
                <h2 className="font-bold">{selectedFid}</h2>
              </div>

              <div className="my-2">
                <div className="label">Evaluated value</div>
                <ValueField
                  value={selectedFeature?.evaluatedFeature?.result?.value}
                  valueType={selectedFeature?.valueType}
                />
              </div>

              <hr className="my-4" />
              <h2 className="label font-bold">Rules</h2>

              <div className="my-2">
                <div className="label">Default value</div>
                <ValueField
                  value={selectedFeature?.feature?.defaultValue}
                  valueType={selectedFeature?.valueType}
                />
              </div>

              <textarea
                className="mt-8 w-full h-[400px]"
                value={JSON.stringify(selectedFeature.feature)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ValueField({
  value,
  valueType = "string",
}:{
  value: string;
  valueType?: ValueType
}) {
  const formattedValue = value !== undefined ?
    JSON.stringify(value, null, 2) :
    "null";
  return (
    <>
      {["json", "string"].includes(valueType) ? (
        <div className="border border-gray-200 rounded-md bg-gray-50">
          <Prism
            language="json"
            style={codeTheme}
            customStyle={{ ...customTheme, maxHeight: 120 }}
            codeTagProps={{
              className: "text-2xs-important !whitespace-pre-wrap",
            }}
          >
            {formattedValue}
          </Prism>
        </div>
      ) : (
        <code
          className={clsx(
            "text-slate-800 text-sm whitespace-pre-wrap mono",
            {
              "inline-block px-1 bg-rose-100 rounded-md text-rose-900":
                formattedValue === "false",
              "inline-block px-1 bg-blue-100 rounded-md text-blue-900":
                formattedValue === "true",
              "inline-block px-1 bg-gray-100 rounded-md text-gray-900":
                formattedValue === "null",
            },
          )}
        >
          {formattedValue}
        </code>
      )}
    </>
  );
}

type ValueType = "string" | "number" | "boolean" | "json";
function getFeatureDetails({
  fid,
  features,
  featuresMeta,
  evaluatedFeatures,
  forcedFeatures,
}: {
  fid: string;
  features: Record<string, FeatureDefinition>;
  featuresMeta?: Record<string, any>;
  evaluatedFeatures?: Record<string, EvaluatedFeature>;
  forcedFeatures?: Map<string, any>;
}) {
  const feature = features?.[fid];
  const meta = featuresMeta?.[fid];
  const evaluatedFeature = evaluatedFeatures?.[fid];
  const isForced = forcedFeatures ? fid in forcedFeatures : false;
  let valueType: ValueType;
  if (meta?.valueType) {
    valueType = meta?.valueType;
  } else {
    valueType = typeof (feature?.defaultValue ?? "string") as ValueType || "object";
    // @ts-ignore
    if (valueType === "object") {
      valueType = "json";
    }
  }

  return {
    fid,
    feature,
    valueType,
    meta,
    evaluatedFeature,
    isForced,
  };
}
