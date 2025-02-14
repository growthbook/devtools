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
  PiCircleFill, PiDesktopFill, PiFlagFill, PiLinkBold,
  PiListBold,
} from "react-icons/pi";
import clsx from "clsx";
import {MW, NAV_H} from "@/app";
import {useSearch} from "@/app/hooks/useSearch";
import SearchBar from "@/app/components/SearchBar";
import ExperimentDetail, {VariationIcon, getVariationSummary} from "@/app/components/ExperimentDetail";
import {getFeatureDetails} from "@/app/components/FeaturesTab";
import {ValueType} from "@/app/components/ValueField";

export type ExperimentWithFeatures = (AutoExperiment | Experiment<any>) & { features?: string[]; featureTypes?: Record<string, ValueType>; };

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
        experiments: allExperiments,
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
      const container = document.querySelector("#pageBody");
      const el = document.querySelector(
        `#experimentsTab_experimentList_${selectedEid}`,
      );
      const y = (el?.getBoundingClientRect()?.top || 0) + (container?.scrollTop || 0);
      container?.scroll?.({ top: y - (NAV_H + HEADER_H) , behavior: firstLoad ? "instant" : "smooth" });
    }
  }, [selectedEid]);

  const fullWidthListView = !selectedEid || !selectedExperiment;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;

  const col1 = `${LEFT_PERCENT * 100}%`;
  const col2 = `${(1 - LEFT_PERCENT) * 0.2 * 100}%`;
  const col3 = `${(1 - LEFT_PERCENT) * 0.55 * 100}%`;
  const col4 = `${(1 - LEFT_PERCENT) * 0.25 * 100}%`;

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
          className="fixed flex items-center w-full border-b border-b-slate-4 bg-white text-xs font-semibold shadow-sm"
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
                <label className="uppercase text-slate-11">Type</label>
              </div>
              <div style={{width: col3}}>
                <label className="uppercase text-slate-11">Variation</label>
              </div>
              <div className="flex justify-center" style={{width: col4}}>
                <label className="uppercase text-slate-11">Override</label>
              </div>
            </>
          ) : (
            <>
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
            const { evaluatedExperiment, isForced, types } =
              getExperimentDetails({
                eid,
                experiments: allExperiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

            return (
              <div
                id={`experimentsTab_experimentList_${eid}`}
                key={eid}
                className={clsx("featureCard flex", {
                  selected: selectedEid === eid,
                })}
                onClick={() => clickExperiment(eid)}
              >
                <div
                  className="title line-clamp-1 pl-6 pr-6"
                  style={{width: fullWidthListView ? col1 : undefined}}
                >
                  {isForced && !fullWidthListView && (
                    <PiCircleFill
                      size={10}
                      className="absolute text-amber-600"
                      style={{top: "50%", left: 6, marginTop: -4}}
                    />
                  )}
                  {eid}
                </div>
                {fullWidthListView && (
                  <div
                    className="flex-shrink-0 text-sm"
                    style={{width: col2}}
                  >
                    {types ? (
                      <div className="flex items-center gap-2">
                        {types.redirect ? (
                          <PiLinkBold size={12}/>
                        ) : null}
                        {types.visual ? (
                          <PiDesktopFill size={12}/>
                        ) : null}
                        {types.features ? (
                          <PiFlagFill size={12}/>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}

                {fullWidthListView && (
                  <div
                    className="value flex-shrink-0 flex gap-2 items-center"
                    style={{ width: col3 }}
                  >
                    <div className="line-clamp-1">
                      <VariationIcon i={value} size={14} className="mr-1" />
                      {getVariationSummary({experiment, i})}
                    </div>
                  </div>
                )}

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

        <ExperimentDetail
          selectedEid={selectedEid}
          setSelectedEid={setSelectedEid}
          selectedExperiment={selectedExperiment}
          open={!!selectedEid && !!selectedExperiment}
        />
      </div>
    </>
  );
}

export type SelectedExperiment = {
  eid: string;
  experiment: ExperimentWithFeatures;
  meta?: any;
  types: { features?: string[]; redirect?: boolean; visual?: boolean; };
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
  experiments: ExperimentWithFeatures[];
  experimentsMeta?: Record<string, any>;
  evaluatedExperiments?: EvaluatedExperiment[];
  forcedVariations?: Record<string, number>;
}): SelectedExperiment {
  const experiment = experiments.find((experiment) => experiment.key === eid) as ExperimentWithFeatures;
  const meta = experimentsMeta?.[eid];

  const types = {
    features: experiment?.features,
    redirect: experiment?.variations?.some((v) => v.urlRedirect),
    visual: experiment?.variations?.some((v) => (v.domMutations?.length || v?.css || v?.js)),
  };

  const evaluatedExperiment = evaluatedExperiments?.find(
    (exp) => exp.key === eid,
  );
  const isForced = forcedVariations ? eid in forcedVariations : false;

  return {
    eid,
    experiment,
    meta,
    types,
    evaluatedExperiment,
    isForced,
  };
}

export function getFeatureExperiments(
  features: Record<string, FeatureDefinition>,
) {
  const experiments: ExperimentWithFeatures[] = [];
  for (const fid in features) {
    const feature = features[fid];
    const details = getFeatureDetails({ fid, features });
    for (const rule of feature.rules || []) {
      if (rule.variations) {
        // @ts-ignore
        experiments.push({
          key: rule.key ?? fid,
          features: [fid],
          featureTypes: {[fid]: details.valueType},
          ...rule,
        });
      }
    }
  }
  return experiments;
}
