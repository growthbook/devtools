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
import {PiCircleFill, PiFlaskFill} from "react-icons/pi";
import clsx from "clsx";
import { MW } from "@/app";
import { ValueType } from "./ValueField";
import FeatureDetail from "@/app/components/FeatureDetail";

export const LEFT_PERCENT = 0.4;
export const HEADER_H = 40;

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

  const col1 = `${LEFT_PERCENT * 100}%`;
  const col2 = `${(1-LEFT_PERCENT) * .3 * 100}%`;
  const col3 = `${(1-LEFT_PERCENT) * .4 * 100}%`;
  const col4 = `${(1-LEFT_PERCENT) * .3 * 100}%`;

  return (
    <>
      <div
        className="mx-auto"
        style={{
          maxWidth: MW,
          overflowX: "hidden",
        }}
      >
        <div
          className="fixed flex items-center w-full border-b border-b-slate-4 bg-white text-xs font-semibold"
          style={{
            maxWidth: MW,
            height: HEADER_H,
            zIndex: 2000
          }}
        >
          <div style={{ width: col1 }}>
            <label className="uppercase text-slate-11 ml-6">
              Feature{!fullWidthListView ? "s" : null}
            </label>
          </div>
          {fullWidthListView ? (
            <>
              <div style={{ width: col2 }}>
                <label className="uppercase text-slate-11">Links</label>
              </div>
              <div style={{ width: col3 }}>
                <label className="uppercase text-slate-11">Value</label>
              </div>
              <div className="flex justify-center" style={{ width: col4 }}>
                <label className="uppercase text-slate-11">Override</label>
              </div>
            </>
          ) : (
            <label className="uppercase text-slate-11">
              Feature Details
            </label>
          )}
        </div>

        <div
          style={{
            width: `${leftPercent * 100}vw`,
            maxWidth: MW * leftPercent,
            paddingTop: HEADER_H,
          }}
        >
          {Object.keys(features).map((fid, i) => {
            const {evaluatedFeature, isForced, linkedExperiments} = getFeatureDetails({
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
                className={clsx("featureCard", {
                  selected: selectedFid === fid,
                  flex: fullWidthListView,
                  "px-6": !fullWidthListView,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div
                  className={clsx("title", {
                    "text-amber-700": isForced,
                    "text-indigo-12": !isForced,
                    "flex-shrink-0 pl-6": fullWidthListView,
                  })}
                  style={{ width: fullWidthListView ? col1 : undefined }}
                >
                  {isForced && !fullWidthListView && (
                    <div
                      className="absolute"
                      style={{ left: 6, top: 10 }}
                    >
                      <PiCircleFill size={10} className="text-amber-600" />
                    </div>
                  )}
                  {fid}
                </div>
                {fullWidthListView && (
                  <div className="flex-shrink-0 text-sm" style={{ width: col2 }}>
                    {linkedExperiments?.length ? (
                      <>
                        <PiFlaskFill className="inline-block mr-1" />
                        <span className="text-indigo-12">({linkedExperiments.length})</span>
                      </>
                    ) : null}
                  </div>
                )}
                <div
                  className={clsx("value flex-shrink-0", {
                    uppercase: isBoolean,
                    "w-full text-right pl-[50%] line-clamp-1": !fullWidthListView,
                    "line-clamp-3": fullWidthListView,
                  })}
                  style={{ width: fullWidthListView ? col3 : undefined }}
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
                {fullWidthListView && (
                  <div className="flex justify-center" style={{ width: col4 }}>
                    {isForced && (
                      <PiCircleFill size={14} className="text-amber-600" />
                    )}
                  </div>
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
