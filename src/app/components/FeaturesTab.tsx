import React, { useEffect, useState } from "react";
import {
  AutoExperiment,
  Experiment,
  FeatureDefinition,
} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import { PiCircleFill } from "react-icons/pi";
import clsx from "clsx";
import { MW } from "@/app";
import { ValueType } from "./ValueField";
import FeatureDetail from "@/app/components/FeatureDetail";

export const LEFT_PERCENT = 0.4;

export default function FeaturesTab() {
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const { evaluatedFeatures } = useGBSandboxEval();

  const [selectedFid, setSelectedFid] = useTabState<string | undefined>(
    "selectedFid",
    undefined,
  );
  const selectedFeature = selectedFid
    ? getFeatureDetails({
        fid: selectedFid,
        features,
        evaluatedFeatures,
        forcedFeatures,
      })
    : undefined;

  const clickFeature = (fid: string) =>
    setSelectedFid(selectedFid !== fid ? fid : undefined);

  // load & scroll animations
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    window.setTimeout(() => setFirstLoad(false), 100);
  }, []);
  useEffect(() => {
    if (selectedFid) {
      const el = document.querySelector(
        `#featuresTab_featureList_${selectedFid}`,
      );
      el?.scrollIntoView({ behavior: firstLoad ? "instant" : "smooth" });
    }
  }, [selectedFid]);

  const fullWidthListView = !selectedFid || !selectedFeature;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;

  return (
    <>
      <div className="mx-auto" style={{ maxWidth: MW }}>
        <div
          className="py-3"
          style={{
            width: `${leftPercent * 100}${fullWidthListView ? "%" : "vw"}`,
            maxWidth: MW * leftPercent,
          }}
        >
          {Object.keys(features).map((fid, i) => {
            const { evaluatedFeature, isForced } = getFeatureDetails({
              fid,
              features,
              evaluatedFeatures,
              forcedFeatures,
            });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            const isBoolean = valueStr === "true" || valueStr === "false";
            return (
              <div
                id={`featuresTab_featureList_${fid}`}
                key={fid}
                className={clsx("featureCard ml-3", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div
                  className={clsx("title", {
                    "text-amber-700": isForced,
                    "text-indigo-12": !isForced,
                  })}
                >
                  {fid}
                </div>
                <div
                  className={clsx("value", {
                    uppercase: isBoolean,
                  })}
                >
                  {isBoolean && (
                    <PiCircleFill
                      size={8}
                      className={clsx("inline-block mr-0.5 -mt-0.5", {
                        "text-slate-a7": valueStr === "false",
                        "text-teal-600": valueStr === "true",
                      })}
                    />
                  )}
                  {valueStr}
                </div>
                {isForced && (
                  <div
                    className="bg-amber-600 absolute top-0 left-0 w-[10px] h-[10px]"
                    style={{
                      aspectRatio: 1,
                      clipPath: "polygon(100% 0, 0 100%, 0 0)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {!!selectedFid && !!selectedFeature && (
          <FeatureDetail
            selectedFid={selectedFid}
            setSelectedFid={setSelectedFid}
            selectedFeature={selectedFeature}
          />
        )}
      </div>
    </>
  );
}

export type SelectedFeature = {
  fid: string;
  feature: FeatureDefinition;
  valueType: ValueType;
  meta?: any;
  linkedExperiments: (Experiment<any> | AutoExperiment)[];
  evaluatedFeature?: EvaluatedFeature;
  isForced: boolean;
};

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
  forcedFeatures?: Record<string, any>;
}): SelectedFeature {
  const feature = features?.[fid];
  const meta = featuresMeta?.[fid];

  let valueType: ValueType;
  if (meta?.valueType) {
    valueType = meta?.valueType;
  } else {
    valueType =
      (typeof (feature?.defaultValue ?? "string") as ValueType) || "object";
    // @ts-ignore
    if (valueType === "object") {
      valueType = "json";
    }
  }

  const linkedExperiments = (feature?.rules || [])
    .filter((rule) => rule.variations)
    .map((rule) => ({
      key: rule.key ?? fid,
      ...rule,
    })) as Experiment<any>[];

  const evaluatedFeature = evaluatedFeatures?.[fid];
  const isForced = forcedFeatures ? fid in forcedFeatures : false;

  return {
    fid,
    feature,
    valueType,
    meta,
    linkedExperiments,
    evaluatedFeature,
    isForced,
  };
}
