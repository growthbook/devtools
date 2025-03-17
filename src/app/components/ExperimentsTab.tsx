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
import { Link, Switch, Tooltip } from "@radix-ui/themes";
import { PiDesktopFill, PiFlagFill, PiLinkBold, PiXBold } from "react-icons/pi";
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
import { useResponsiveContext } from "../hooks/useResponsive";
import { TbEyeSearch } from "react-icons/tb";

export type ExperimentWithFeatures = (AutoExperiment | Experiment<any>) & {
  features?: string[];
  featureTypes?: Record<string, ValueType>;
  isDraft?: boolean;
  isInactive?: boolean;
};

export const LEFT_PERCENT = 0.4;
export const HEADER_H = 40;

export default function ExperimentsTab() {
  const { isResponsive } = useResponsiveContext();

  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");

  const [experiments, setExperiments] = useTabState<AutoExperiment[]>(
    "experiments",
    [],
  );
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const featureExperiments = getFeatureExperiments(features);

  // de-dupe
  const allExperiments = useMemo(() => {
    const merged: ExperimentWithFeatures[] = [
      ...experiments,
      ...featureExperiments,
    ];
    const seenEids = new Set<string>();
    const allExperiments: ExperimentWithFeatures[] = [];
    merged.forEach((exp) => {
      if ("changeId" in exp) {
        // changeId experiments are already de-duped
        allExperiments.push({ ...exp });
        return;
      }
      const key = exp.key;
      if (seenEids.has(key)) {
        const idx = allExperiments.findIndex(
          (exp) => exp.key === key && !("changeId" in exp),
        );
        if (idx >= 0 && allExperiments?.[idx]) {
          const types = getExperimentTypes(exp);
          allExperiments[idx].features = [
            ...(allExperiments[idx].features ?? []),
            ...(types.features ?? []),
          ];
          allExperiments[idx].featureTypes = {
            ...(allExperiments[idx].featureTypes ?? {}),
            ...(types.featureTypes ?? {}),
          };
          return;
        }
      }
      seenEids.add(key);
      allExperiments.push({ ...exp });
    });
    return allExperiments;
  }, [experiments, featureExperiments]);

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
  const [hideInactiveExperiments, setHideInactiveExperiments] =
    useTabState<boolean>("hideInactiveExperiments", false);

  const {
    items: filteredExperiments,
    searchInputProps,
    clear: clearSearch,
  } = useSearch({
    items: allExperiments,
    defaultSortField: "key",
  });

  const sortedFilteredExperiments = useMemo(
    () =>
      [...filteredExperiments].sort((a, b) =>
        pageEvaluatedExperiments.has(a.key) ===
        pageEvaluatedExperiments.has(b.key)
          ? 0
          : pageEvaluatedExperiments.has(a.key)
            ? -1
            : 1,
      ),
    [filteredExperiments, pageEvaluatedExperiments],
  );

  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );
  const [selectedChangeId, setSelectedChangeId] = useTabState<
    string | undefined
  >("selectedChangeId", undefined);
  const selectedExperiment = selectedEid
    ? getExperimentDetails({
        eid: selectedEid,
        changeId: selectedChangeId,
        experiments: allExperiments,
        evaluatedExperiments,
        forcedVariations,
      })
    : undefined;

  const clickExperiment = (eid: string, changeId: string | undefined) => {
    if (eid !== selectedEid || changeId !== selectedChangeId) {
      setSelectedEid(eid);
      setSelectedChangeId(changeId);
    } else {
      setSelectedEid(undefined);
      setSelectedChangeId(undefined);
    }
  };

  // load & scroll animations
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    window.setTimeout(() => setFirstLoad(false), 100);
  }, []);
  useEffect(() => {
    if (selectedEid) {
      const container = document.querySelector("#pageBody");
      const el = document.querySelector(
        "#" +
          CSS.escape(
            `experimentsTab_experimentList_${selectedEid}_${selectedChangeId}`,
          ),
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
          className="fixed w-full flex items-center gap-4 px-3 border-b border-b-gray-a4 bg-surface text-xs font-semibold shadow-sm"
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
            placeholder="Search Experiments"
            searchInputProps={searchInputProps}
            clear={clearSearch}
          />
          <div className="flex-1" />
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
              className="flex gap-1 items-center font-normal leading-3 text-right"
            >
              Clear all overrides
              <PiXBold className="flex-shrink-0" />
            </Link>
          ) : null}
          <label className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer leading-3 text-right">
            <span>Hide inactive</span>
            <Switch
              className="flex-shrink-0"
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
            // @ts-ignore changeId is in AutoExperiment
            const changeId: string | undefined = experiment?.changeId;
            const { evaluatedExperiment, isForced, types } =
              getExperimentDetails({
                eid,
                changeId,
                experiments: allExperiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

            if (
              !isForced &&
              hideInactiveExperiments &&
              !pageEvaluatedExperiments.has(eid)
            )
              return null;

            return (
              <div
                id={`experimentsTab_experimentList_${eid}_${changeId}`}
                key={`${i}__${eid}__${changeId}`}
                className={clsx("featureCard flex", {
                  selected:
                    selectedEid === eid && selectedChangeId === changeId,
                })}
                onClick={() => clickExperiment(eid, changeId)}
              >
                <div
                  className="title line-clamp-1 pl-2.5 pr-8"
                  style={{ width: fullWidthListView ? col1 : undefined }}
                >
                  <FeatureExperimentStatusIcon
                    evaluated={pageEvaluatedExperiments.has(eid)}
                    forced={isForced}
                    type="experiment"
                  />
                  {experiment?.isDraft ? (
                    <TbEyeSearch
                      className="inline-block mr-1 opacity-50"
                      size={12}
                    />
                  ) : null}
                  {eid}
                </div>
                <div
                  className={clsx("flex items-center flex-shrink-0 text-sm", {
                    "pl-4": fullWidthListView,
                    "absolute right-2.5": !fullWidthListView,
                  })}
                  style={fullWidthListView ? { width: col2 } : undefined}
                >
                  {types ? (
                    <div className="flex items-center gap-2 pr-0.5">
                      {types.redirect ? (
                        <Tooltip content="URL Redirect experiment">
                          <span>
                            <PiLinkBold size={12} />
                          </span>
                        </Tooltip>
                      ) : null}
                      {types.visual ? (
                        <Tooltip content="Visual Editor experiment">
                          <span>
                            <PiDesktopFill size={12} />
                          </span>
                        </Tooltip>
                      ) : null}
                      {types.features ? (
                        <Tooltip content="Feature flag experiment">
                          <span>
                            <PiFlagFill className="inline-block" size={12} />
                            {fullWidthListView ? (
                              <span className="ml-1">
                                {types.features.length}
                              </span>
                            ) : null}
                          </span>
                        </Tooltip>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {fullWidthListView && (
                  <div
                    className="value flex-shrink-0 flex gap-2 items-center"
                    style={{ width: col3 }}
                  >
                    {evaluatedExperiment?.result?.inExperiment ? (
                      <div className="line-clamp-1">
                        <VariationIcon i={value} size={14} className="mr-1" />
                        {getVariationSummary({ experiment, i: value })}
                      </div>
                    ) : (
                      <div className="text-gray-9">Inactive</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!firstLoad && !sortedFilteredExperiments.length ? (
            <div className="my-3 mx-4">
              <em>No experiments found.</em>
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

        <ExperimentDetail
          selectedEid={selectedEid}
          setSelectedEid={setSelectedEid}
          selectedExperiment={selectedExperiment}
          open={!!selectedEid && !!selectedExperiment}
          isResponsive={isResponsive}
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
  changeId,
  experiments,
  experimentsMeta,
  evaluatedExperiments,
  forcedVariations,
}: {
  eid: string;
  changeId?: string;
  experiments: ExperimentWithFeatures[];
  experimentsMeta?: Record<string, any>;
  evaluatedExperiments?: EvaluatedExperiment[];
  forcedVariations?: Record<string, number>;
}): SelectedExperiment {
  const experiment = experiments.find(
    (experiment) =>
      experiment.key === eid &&
      // @ts-ignore changeId is in AutoExperiment
      experiment.changeId === changeId,
  ) as ExperimentWithFeatures;
  const meta = experimentsMeta?.[eid];

  const types = getExperimentTypes(experiment);

  const evaluatedExperiment = evaluatedExperiments?.find(
    (exp) => exp.key === eid && exp.changeId === changeId,
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

export function getExperimentTypes(experiment: ExperimentWithFeatures) {
  return {
    features: experiment?.features,
    featureTypes: experiment?.featureTypes,
    redirect: experiment?.variations?.some((v) => v.urlRedirect),
    visual: experiment?.variations?.some(
      (v) => v.domMutations?.length || v?.css || v?.js,
    ),
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
