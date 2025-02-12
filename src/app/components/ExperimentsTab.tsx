import React, { useEffect, useState } from "react";
import {
  AutoExperiment,
  Experiment,
  FeatureDefinition,
} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedExperiment,
} from "@/app/hooks/useGBSandboxEval";
import { Button } from "@radix-ui/themes";
import {
  PiCircleFill,
  PiListBold,
} from "react-icons/pi";
import clsx from "clsx";
import { MW } from "@/app";
import {useSearch} from "@/app/hooks/useSearch";
import SearchBar from "@/app/components/SearchBar";
import ExperimentDetail from "@/app/components/ExperimentDetail";

export const LEFT_PERCENT = 0.4;
export const HEADER_H = 40;

export default function ExperimentsTab() {
  const [experiments, setExperiments] = useTabState<AutoExperiment[]>(
    "experiments",
    [],
  );
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  // todo: dedupe?
  const featureExperiments = getFeatureExperiments(features);
  const allExperiments = [...experiments, ...featureExperiments];

  const {
    items: filteredExperiments,
    searchInputProps,
    clear: clearSearch,
  } = useSearch({
    items: allExperiments,
    defaultSortField: "key",
    useSort: false,
  });

  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const { evaluatedExperiments } = useGBSandboxEval();

  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );
  const selectedExperiment = selectedEid
    ? getExperimentDetails({
        eid: selectedEid,
        experiments: [...experiments, ...featureExperiments],
        evaluatedExperiments,
        forcedVariations,
      })
    : undefined;

  const clickExperiment = (eid: string) =>
    setSelectedEid(selectedEid !== eid ? eid : undefined);

  // load & scroll animations
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    window.setTimeout(() => setFirstLoad(false), 100);
  }, []);
  useEffect(() => {
    if (selectedEid) {
      const el = document.querySelector(
        `#experimentsTab_experimentList_${selectedEid}`,
      );
      el?.scrollIntoView({ behavior: firstLoad ? "instant" : "smooth" });
    }
  }, [selectedEid]);

  const fullWidthListView = !selectedEid || !selectedExperiment;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;

  const col1 = `${LEFT_PERCENT * 100}%`;
  const col2 = `${(1 - LEFT_PERCENT) * 0.3 * 100}%`;
  const col3 = `${(1 - LEFT_PERCENT) * 0.4 * 100}%`;
  const col4 = `${(1 - LEFT_PERCENT) * 0.3 * 100}%`;

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
            zIndex: 2000,
          }}
        >
          <div style={{width: col1}}>
            <label className="uppercase text-slate-11 ml-6">Experiment</label>
            <SearchBar
              flexGrow="0"
              className="inline-block ml-2"
              autoFocus
              searchInputProps={searchInputProps}
              clear={clearSearch}
            />
          </div>
          {fullWidthListView ? (
            <>
              <div style={{width: col2}}>
                <label className="uppercase text-slate-11">Links</label>
              </div>
              <div style={{width: col3}}>
                <label className="uppercase text-slate-11">Value</label>
              </div>
              <div className="flex justify-center" style={{width: col4}}>
                <label className="uppercase text-slate-11">Override</label>
              </div>
            </>
          ) : (
            <>
              <label className="uppercase text-slate-11 ml-6">
                Experiment Details
              </label>
              <Button
                className="absolute right-3"
                style={{marginRight: 0}}
                variant="ghost"
                size="1"
                onClick={() => setSelectedEid(undefined)}
              >
                <PiListBold className="inline-block mr-1"/>
                List view
              </Button>
            </>
          )}
        </div>

        <div
          style={{
            width: `${leftPercent * 100}vw`,
            maxWidth: MW * leftPercent,
            paddingTop: HEADER_H,
          }}
        >
          {filteredExperiments.map((experiment, i) => {
            const eid = experiment?.key;
            const {evaluatedExperiment, isForced} =
              getExperimentDetails({
                eid,
                experiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

            return (
              <div
                id={`experimentsTab_experimentList_${eid}`}
                key={eid}
                className={clsx("featureCard", {
                  selected: selectedEid === eid,
                  flex: fullWidthListView,
                  "px-6": !fullWidthListView,
                })}
                onClick={() => clickExperiment(eid)}
              >
                <div
                  className={clsx("title", {
                    "text-amber-700": isForced,
                    "text-indigo-12": !isForced,
                    "flex-shrink-0 px-6": fullWidthListView,
                  })}
                  style={{width: fullWidthListView ? col1 : undefined}}
                >
                  {isForced && !fullWidthListView && (
                    <div className="absolute" style={{left: 6, top: 10}}>
                      <PiCircleFill size={10} className="text-amber-600"/>
                    </div>
                  )}
                  {eid}
                </div>
                {fullWidthListView && (
                  <div
                    className="flex-shrink-0 text-sm"
                    style={{width: col2}}
                  >
                    {/*{linkedExperiments?.length ? (*/}
                    {/*  <>*/}
                    {/*    <PiFlaskFill className="inline-block mr-1"/>*/}
                    {/*    <span className="text-indigo-12">*/}
                    {/*      ({linkedExperiments.length})*/}
                    {/*    </span>*/}
                    {/*  </>*/}
                    {/*) : null}*/}
                  </div>
                )}
                <div
                  className={clsx("value flex-shrink-0", {
                    "w-full text-right pl-[50%] line-clamp-1":
                      !fullWidthListView,
                    "line-clamp-3": fullWidthListView,
                  })}
                  style={{width: fullWidthListView ? col3 : undefined}}
                >
                  {value}
                </div>
                {fullWidthListView && (
                  <div className="flex justify-center" style={{width: col4}}>
                    {isForced && (
                      <PiCircleFill size={10} className="text-amber-600"/>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!!selectedEid && !!selectedExperiment && (
          <ExperimentDetail
            selectedEid={selectedEid}
            setSelectedEid={setSelectedEid}
            selectedExperiment={selectedExperiment}
          />
        )}
      </div>
    </>
  );
}

export type SelectedExperiment = {
  eid: string;
  experiment: (AutoExperiment | Experiment<any>);
  meta?: any;
  // linkedExperiments: (Experiment<any> | AutoExperiment)[];
  evaluatedExperiment?: EvaluatedExperiment;
  isForced: boolean;
};

function getExperimentDetails({
  eid,
  experiments,
  experimentsMeta,
  evaluatedExperiments,
  forcedVariations,
}: {
  eid: string;
  experiments: (AutoExperiment | Experiment<any>)[];
  experimentsMeta?: Record<string, any>;
  evaluatedExperiments?: EvaluatedExperiment[];
  forcedVariations?: Record<string, number>;
}): SelectedExperiment {
  const experiment = experiments.find((experiment) => experiment.key === eid) as (AutoExperiment | Experiment<any>);
  const meta = experimentsMeta?.[eid];
  const evaluatedExperiment = evaluatedExperiments?.find(
    (experiment) => experiment.key === eid,
  );
  const isForced = forcedVariations ? eid in forcedVariations : false;

  return {
    eid,
    experiment,
    meta,
    evaluatedExperiment,
    isForced,
  };
}

export function getFeatureExperiments(
  features: Record<string, FeatureDefinition>,
) {
  const experiments: Experiment<any>[] = [];
  for (const fid in features) {
    const feature = features[fid];
    for (const rule of feature.rules || []) {
      if (rule.variations) {
        // @ts-ignore
        experiments.push({
          key: rule.key ?? fid,
          ...rule,
        });
      }
    }
  }
  return experiments;
}
