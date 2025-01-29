import React from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, { EvaluatedFeature } from "@/app/hooks/useGBSandboxEval";
import {Avatar} from "@radix-ui/themes";
import { PiFlag } from "react-icons/pi";

export default function FeaturesTab() {
  const [features, setFeatures] = useTabState<Record<string, FeatureDefinition>>(
    "features",
    {},
  );
  const [forcedFeatures] = useTabState<Map<string, any>>("forcedFeatures", new Map());
  let forcedFeaturesMap = new Map<string, any>();
  try {
    // because persistent state is JSON encoded, need to make sure this specific var is safe to use
    forcedFeaturesMap = forcedFeatures && (forcedFeatures instanceof Map) ?
      forcedFeatures :
      new Map(Object.entries(forcedFeatures));
  } catch (_) {
    // do nothing
  }

  const { evaluatedFeatures } = useGBSandboxEval();

  return (
    <>
      <div className="flex justify-between items-top">
        <div className="flex-none basis-[50%]">
          <div className="label mb-2">Features</div>
          {Object.keys(features).map((fid, i) => {
            const { feature, meta, evaluatedFeature, isForced } = getFeatureDetails({ fid, features, evaluatedFeatures, forcedFeatures: forcedFeaturesMap });
            return (
              <div key={fid} className="featureCard mb-2">
                <div className="flex gap-3 items-center">
                  <Avatar size="1" radius="full" fallback={<PiFlag />} />
                  <div>{fid}</div>
                  {evaluatedFeature ? (<div>
                    {JSON.stringify(evaluatedFeature.result.value)}
                  </div>) : (<div>

                  </div>)}
                  {isForced && (<div>FORCED</div>)}
                </div>
                {!!evaluatedFeature && (
                  <textarea>{JSON.stringify(evaluatedFeature)}</textarea>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex-none basis-[50%]">
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
  evaluatedFeatures?:  Record<string, EvaluatedFeature>;
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
