import React, { useEffect, useMemo, useState } from "react";
import {
  AutoExperiment,
  Experiment,
  FeatureDefinition,
  LogUnion,
} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import { PiCircleFill, PiFlaskFill, PiXBold } from "react-icons/pi";
import clsx from "clsx";
import { MW, NAV_H } from "@/app";
import { ValueType } from "./ValueField";
import FeatureDetail from "@/app/components/FeatureDetail";
import { useSearch } from "@/app/hooks/useSearch";
import SearchBar from "@/app/components/SearchBar";
import { Box, Link, Switch } from "@radix-ui/themes";
import FeatureExperimentStatusIcon from "@/app/components/FeatureExperimentStatusIcon";
import { useResponsiveContext } from "../hooks/useResponsive";

type FeatureDefinitionWithId = FeatureDefinition & { id: string };

export const LEFT_PERCENT = 0.4;
export const HEADER_H = 40;

export default function FeaturesTab() {
  const { isResponsive } = useResponsiveContext();

  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");

  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});

  const reshapedFeatures = useMemo(
    () =>
      Object.entries(features).map(([key, val]) => ({
        ...val,
        id: key,
      })) as FeatureDefinitionWithId[],
    [features],
  );

  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const { evaluatedFeatures } = useGBSandboxEval();

  const [logEvents] = useTabState<LogUnion[] | undefined>(
    "logEvents",
    undefined,
  );
  const pageEvaluatedFeatures = useMemo(() => {
    return new Set(
      (logEvents || [])
        .filter((log) => log.logType === "feature")
        .map((log) => log?.featureKey),
    );
  }, [logEvents]);
  const [hideInactiveFeatures, setHideInactiveFeatures] = useTabState<boolean>(
    "hideInactiveFeatures",
    false,
  );

  const {
    items: filteredFeatures,
    searchInputProps,
    clear: clearSearch,
  } = useSearch({
    items: reshapedFeatures,
    defaultSortField: "id",
  });
  const sortedFilteredFeatures = useMemo(
    () =>
      [...filteredFeatures].sort((feature) =>
        pageEvaluatedFeatures.has(feature.id) ? -1 : 1,
      ),
    [filteredFeatures, pageEvaluatedFeatures],
  );

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
      const container = document.querySelector("#pageBody");
      const el = document.querySelector(
        `#featuresTab_featureList_${selectedFid}`,
      );
      const y =
        (el?.getBoundingClientRect()?.top || 0) + (container?.scrollTop || 0);
      container?.scroll?.({
        top: y - (NAV_H + HEADER_H),
        behavior: firstLoad ? "instant" : "smooth",
      });
    }
  }, [selectedFid]);

  const fullWidthListView = !selectedFid || !selectedFeature;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;

  const col1 = `${LEFT_PERCENT * 100}%`;
  const col2 = `${(1 - LEFT_PERCENT) * 0.3 * 100}%`;
  const col3 = `${(1 - LEFT_PERCENT) * 0.7 * 100}%`;

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
          className="fixed w-full flex items-center gap-4 px-3 border-b border-b-slate-4 bg-white text-xs font-semibold shadow-sm"
          style={{
            maxWidth: MW,
            height: HEADER_H,
            zIndex: 2000,
          }}
        >
          <SearchBar
            flexGrow="0"
            className="inline-block"
            style={{ maxWidth: 200 }}
            autoFocus
            placeholder="Search Features"
            searchInputProps={searchInputProps}
            clear={clearSearch}
          />
          <div className="flex-1" />
          {Object.keys(forcedFeatures).length ? (
            <Link
              href="#"
              role="button"
              color="amber"
              size="1"
              onClick={(e) => {
                e.preventDefault();
                setForcedFeatures({});
              }}
              className="flex gap-1 items-center font-normal leading-3 text-right"
            >
              Clear all overrides
              <PiXBold className="flex-shrink-0" />
            </Link>
          ) : null}
          <label className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer leading-3 text-right">
            Hide inactive
            <Switch
              className="flex-shrink-0"
              size="1"
              checked={hideInactiveFeatures}
              onCheckedChange={(b) => setHideInactiveFeatures(b)}
            />
          </label>
        </div>

        <div
          style={{
            width: `${leftPercent * 100}vw`,
            maxWidth: MW * leftPercent,
            paddingTop: HEADER_H,
          }}
        >
          {sortedFilteredFeatures.map((feature, i) => {
            const fid = feature?.id;
            const { evaluatedFeature, isForced, linkedExperiments } =
              getFeatureDetails({
                fid,
                features,
                evaluatedFeatures,
                forcedFeatures,
              });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            const isBoolean = valueStr === "true" || valueStr === "false";

            if (
              !isForced &&
              hideInactiveFeatures &&
              !pageEvaluatedFeatures.has(fid)
            )
              return null;

            return (
              <div
                id={`featuresTab_featureList_${fid}`}
                key={`${i}__${fid}`}
                className={clsx("featureCard flex", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div
                  className={clsx({
                    "flex-shrink-0": fullWidthListView,
                  })}
                  style={{ width: fullWidthListView ? col1 : undefined }}
                >
                  <div
                    className={clsx("title absolute line-clamp-1 pl-2.5 pr-3", {
                      "top-1": !fullWidthListView,
                      "top-[13px]": fullWidthListView,
                    })}
                    style={{ width: fullWidthListView ? col1 : undefined }}
                  >
                    <FeatureExperimentStatusIcon
                      evaluated={pageEvaluatedFeatures.has(fid)}
                      forced={isForced}
                      type="feature"
                    />
                    {fid}
                  </div>
                </div>
                {fullWidthListView && (
                  <div
                    className="flex items-center gap-1 flex-shrink-0 text-sm pl-4"
                    style={{ width: col2 }}
                  >
                    {linkedExperiments?.length ? (
                      <>
                        <PiFlaskFill />
                        {linkedExperiments.length}
                      </>
                    ) : null}
                  </div>
                )}
                <div
                  className={clsx("value flex-shrink-0", {
                    uppercase: isBoolean,
                    "absolute bottom-1 right-6 line-clamp-1 max-w-[40%]":
                      !fullWidthListView,
                    "line-clamp-2 pr-6": fullWidthListView,
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
              </div>
            );
          })}

          {!firstLoad && !sortedFilteredFeatures.length ? (
            <div className="my-3 mx-4">
              <em>No features found.</em>
              <div className="mt-1 text-sm">
                See the{" "}
                <Link
                  role="button"
                  href="#"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTab("sdkDebug");
                  }}
                >
                  SDK Health
                </Link>{" "}
                tab.
              </div>
            </div>
          ) : null}
        </div>

        <FeatureDetail
          selectedFid={selectedFid}
          setSelectedFid={setSelectedFid}
          selectedFeature={selectedFeature}
          open={!!selectedFid && !!selectedFeature}
          isResponsive={isResponsive}
        />
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

export function getFeatureDetails({
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
