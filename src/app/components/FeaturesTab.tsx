import React from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import { Avatar } from "@radix-ui/themes";
import { PiFlagBold } from "react-icons/pi";
import clsx from "clsx";

export default function FeaturesTab() {
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const [forcedFeatures] = useTabState<Map<string, any>>(
    "forcedFeatures",
    new Map()
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
    undefined
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
            const valueStr = evaluatedFeature?.result ?
              JSON.stringify(evaluatedFeature?.result?.value) :
              "null";
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
                  <code className="text-xs font-bold">{fid}</code>
                  <div className="flex-1" />
                  <code className={clsx("flex-shrink-0 text-slate-800 line-clamp-3 max-w-[100px]", {
                    "text-right text-xs": valueStr.length < 10,
                    "text-left text-2xs": valueStr.length >= 10,
                    "inline-block px-1 bg-rose-50 rounded-md text-rose-900": valueStr === "false",
                    "inline-block px-1 bg-blue-50 rounded-md text-blue-900": valueStr === "true",
                    "inline-block px-1 bg-gray-50 rounded-md text-gray-900": valueStr === "null",
                  })}>
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
          className="w-[50%] overflow-y-auto pl-2 pr-3 pt-3 pb-2 fixed right-0"
          style={{
            zIndex: 1000,
            top: 85,
            height: "calc(100vh - 85px)"
        }}
        >
          {!!selectedFeature && (
            <div key={`selected_${selectedFid}`}>
              <div className="flex items-center gap-2 mb-3">
                <Avatar size="2" radius="full" fallback={<PiFlagBold/>}/>
                <h2 className="font-bold">{selectedFid}</h2>
              </div>

              <div>
                <div className="label">Default value</div>
                <code className="text-sm">{JSON.stringify(selectedFeature.feature?.defaultValue)}</code>
              </div>
              <textarea className="w-full h-[400px]">
                {JSON.stringify(selectedFeature.feature)}
              </textarea>

              {!!selectedFeature.evaluatedFeature && (
                <textarea className="w-full h-[400px]">
                  {JSON.stringify(selectedFeature.evaluatedFeature)}
                </textarea>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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

  return {
    fid,
    feature,
    meta,
    evaluatedFeature,
    isForced,
  };
}
