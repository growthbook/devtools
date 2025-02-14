import React, { useEffect, useMemo, useState } from "react";
import {
  AutoExperiment,
  Experiment,
  FeatureDefinition,
  LogUnion,
} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedExperiment,
} from "@/app/hooks/useGBSandboxEval";
import {Button, Link, Switch} from "@radix-ui/themes";
import {
  PiCircleFill,
  PiDesktopFill,
  PiFlagFill,
  PiLinkBold,
  PiListBold,
  PiCheckFatFill,
  PiCheckCircleBold, PiXBold,
} from "react-icons/pi";
import clsx from "clsx";
import { MW, NAV_H } from "@/app";
import { useSearch } from "@/app/hooks/useSearch";
import SearchBar from "@/app/components/SearchBar";
import ExperimentDetail, {
  VariationIcon,
  getVariationSummary,
} from "@/app/components/ExperimentDetail";
import { getFeatureDetails } from "@/app/components/FeaturesTab";
import { ValueType } from "@/app/components/ValueField";
import FeatureExperimentStatusIcon from "@/app/components/FeatureExperimentStatusIcon";

export type ExperimentWithFeatures = (AutoExperiment | Experiment<any>) & {
  features?: string[];
  featureTypes?: Record<string, ValueType>;
};

export const LEFT_PERCENT = 0.4;
export const HEADER_H = 35;

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

  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const { evaluatedExperiments } = useGBSandboxEval();

  const [logEvents] = useTabState<LogUnion[] | undefined>(
    "logEvents",
    undefined,
  );
  const pageEvaluatedExperiments = useMemo(() => {
    return new Set(
      (logEvents || [])
        .filter((log) => log.logType === "experiment")
        .map((log) => log?.experiment?.key),
    );
  }, [logEvents]);
  const [hideInactiveExperiments, setHideInactiveExperiments] = useTabState<boolean>(
    "hideInactiveExperiments",
    false,
  );

  const {
    items: filteredExperiments,
    searchInputProps,
    clear: clearSearch,
  } = useSearch({
    items: allExperiments,
    defaultSortField: "key",
    useSort: false,
  });
  const sortedFilteredExperiments = useMemo(() => [...filteredExperiments]
    .sort((exp) => pageEvaluatedExperiments.has(exp.key) ? -1 : 1),
    [filteredExperiments, pageEvaluatedExperiments]
  );

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
      const y =
        (el?.getBoundingClientRect()?.top || 0) + (container?.scrollTop || 0);
      container?.scroll?.({
        top: y - (NAV_H + HEADER_H),
        behavior: firstLoad ? "instant" : "smooth",
      });
    }
  }, [selectedEid]);

  const fullWidthListView = !selectedEid || !selectedExperiment;
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
            style={{width: 200}}
            autoFocus
            placeholder="Search Experiments"
            searchInputProps={searchInputProps}
            clear={clearSearch}
          />
          <div className="flex-1"/>
          {Object.keys(forcedVariations).length ? (
            <Link
              href="#"
              role="button"
              color="amber"
              size="1"
              onClick={(e) => {
                e.preventDefault();
                setForcedVariations({});
              }}
              className="flex gap-1 items-center font-normal"
            >
              Clear all overrides
              <PiXBold/>
            </Link>
          ) : null}
          <label className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer">
            <span>Hide inactive</span>
            <Switch
              size="1"
              checked={hideInactiveExperiments}
              onCheckedChange={(b) => setHideInactiveExperiments(b)}
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
          {sortedFilteredExperiments.map((experiment, i) => {
            const eid = experiment?.key;
            const { evaluatedExperiment, isForced, types } =
              getExperimentDetails({
                eid,
                experiments: allExperiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

            if (!isForced && hideInactiveExperiments && !pageEvaluatedExperiments.has(eid)) return null;

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
                  className="title line-clamp-1 pl-2.5 pr-3"
                  style={{ width: fullWidthListView ? col1 : undefined }}
                >
                  <FeatureExperimentStatusIcon
                    evaluated={pageEvaluatedExperiments.has(eid)}
                    forced={isForced}
                    type="experiment"
                  />
                  {eid}
                </div>
                {fullWidthListView && (
                  <div
                    className="flex items-center flex-shrink-0 text-sm pl-4"
                    style={{ width: col2 }}
                  >
                    {types ? (
                      <div className="flex items-center gap-2">
                        {types.redirect ? <PiLinkBold size={12} /> : null}
                        {types.visual ? <PiDesktopFill size={12} /> : null}
                        {types.features ? <PiFlagFill size={12} /> : null}
                      </div>
                    ) : null}
                  </div>
                )}

                {fullWidthListView && (
                  <div
                    className="value flex-shrink-0 flex gap-2 items-center"
                    style={{ width: col3 }}
                  >
                    {evaluatedExperiment?.result?.inExperiment ? (
                      <div className="line-clamp-1">
                        <VariationIcon i={value} size={14} className="mr-1" />
                        {getVariationSummary({ experiment, i })}
                      </div>
                    ) : (
                      <div className="text-slate-9">
                        Inactive
                      </div>
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
  types: { features?: string[]; redirect?: boolean; visual?: boolean };
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
  const experiment = experiments.find(
    (experiment) => experiment.key === eid,
  ) as ExperimentWithFeatures;
  const meta = experimentsMeta?.[eid];

  const types = {
    features: experiment?.features,
    redirect: experiment?.variations?.some((v) => v.urlRedirect),
    visual: experiment?.variations?.some(
      (v) => v.domMutations?.length || v?.css || v?.js,
    ),
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
          featureTypes: { [fid]: details.valueType },
          ...rule,
        });
      }
    }
  }
  return experiments;
}
