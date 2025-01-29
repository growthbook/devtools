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
        <div className="flex-none basis-[50%]">
          <div className="label mb-2">Features</div>
          {Object.keys(features).map((fid, i) => {
            const { feature, meta, evaluatedFeature, isForced } =
              getFeatureDetails({
                fid,
                features,
                evaluatedFeatures,
                forcedFeatures: forcedFeaturesMap,
              });
            return (
              <div
                key={fid}
                className={clsx("featureCard mb-2", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div className="flex gap-3 items-center">
                  <Avatar size="1" radius="full" fallback={<PiFlagBold />} />
                  <div>{fid}</div>
                  {evaluatedFeature ? (
                    <div>{JSON.stringify(evaluatedFeature.result.value)}</div>
                  ) : (
                    <div></div>
                  )}
                  {isForced && <div>FORCED</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-none basis-[50%] overflow-y-auto px-3 py-2 -mr-3">
          {!!selectedFeature && (
            <>
              <div className="mb-3">
                <h2>{selectedFid}</h2>
              </div>
              {!!selectedFeature.evaluatedFeature && (
                <textarea>
                  {JSON.stringify(selectedFeature.evaluatedFeature)}
                </textarea>
              )}
            </>
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
    feature,
    meta,
    evaluatedFeature,
    isForced,
  };
}
