import { MW, NAV_H } from "@/app";
import { Button, IconButton, Link, RadioCards } from "@radix-ui/themes";
import {
  PiArrowSquareOut,
  PiCaretRightFill,
  PiFlagFill,
  PiLinkBold,
  PiMonitorBold,
  PiXBold,
} from "react-icons/pi";
import ValueField from "@/app/components/ValueField";
import {
  ConditionDisplay,
  ExperimentRule,
  getVariationColor,
} from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, { CSSProperties, useEffect, useState } from "react";
import {
  ExperimentWithFeatures,
  HEADER_H,
  LEFT_PERCENT,
} from "./ExperimentsTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState from "@/app/hooks/useTabState";
import { SelectedExperiment } from "@/app/components/ExperimentsTab";
import { AutoExperimentVariation, isURLTargeted } from "@growthbook/growthbook";
import clsx from "clsx";
import DebugLogger, { DebugLogAccordion } from "@/app/components/DebugLogger";

export default function ExperimentDetail({
  selectedEid,
  setSelectedEid,
  selectedExperiment,
  open,
  isResponsive,
}: {
  selectedEid?: string;
  setSelectedEid: (s: string | undefined) => void;
  selectedExperiment?: SelectedExperiment;
  open: boolean;
  isResponsive: boolean;
}) {
  const [selectedFid, setSelectedFid] = useTabState<string | undefined>(
    "selectedFid",
    undefined,
  );
  const [currentTab, setCurrentTab] = useTabState("currentTab", "experiments");

  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);
  const [url] = useTabState<string>("url", "");

  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const [overrideExperiment, setOverrideExperiment] = useState(false);
  const [delayStatus, setDelayStatus] = useState(false);

  const setForcedVariation = (eid: string, value: any) => {
    const newForcedVariations = { ...forcedVariations };
    newForcedVariations[eid] = value;
    setForcedVariations(newForcedVariations);
    setDelayStatus(true);
    window.setTimeout(() => setDelayStatus(false), 100);
  };
  const unsetForcedVariation = (eid: string) => {
    const newForcedVariations = { ...forcedVariations };
    delete newForcedVariations[eid];
    setForcedVariations(newForcedVariations);
    setOverrideExperiment(false);
  };

  const { types } = selectedExperiment || {};

  const { variations, weights, hashAttribute, coverage, namespace } =
    selectedExperiment?.experiment || {};
  const { urlPatterns } = selectedExperiment?.experiment || {};
  const { condition, parentConditions } = selectedExperiment?.experiment || {};

  const result = { ...selectedExperiment?.evaluatedExperiment?.result };
  delete result.stickyBucketUsed;

  const selectedVariation =
    (selectedEid && forcedVariations?.[selectedEid]) ??
    selectedExperiment?.evaluatedExperiment?.result?.variationId ??
    0;

  const debugLog = selectedExperiment?.evaluatedExperiment?.debug;
  const lastDebugLog = debugLog
    ? (debugLog[debugLog.length - 1]?.[0] ?? "")
    : "";

  const fid = selectedExperiment?.experiment?.features?.[0];
  const valueType =
    (fid ? selectedExperiment?.experiment?.featureTypes?.[fid] : "json") ??
    "json";

  useEffect(() => {
    if (selectedEid) {
      if (selectedEid in forcedVariations) {
        setOverrideExperiment(true);
      } else {
        setOverrideExperiment(false);
      }
    }
  }, [selectedEid, JSON.stringify(forcedVariations)]);

  const rightPercent = isResponsive ? 1 : 1 - LEFT_PERCENT;

  return (
    <div
      className="featureDetailWrapper fixed overflow-y-auto"
      style={{
        top: NAV_H + HEADER_H,
        height: `calc(100vh - ${NAV_H + HEADER_H}px)`,
        width: `${rightPercent * 100}vw`,
        maxWidth: MW * rightPercent,
        right: open
          ? `calc(max((100vw - ${MW}px)/2 + 8px, 0px))`
          : `-${rightPercent * 100}vw`,
        zIndex: 1000,
        pointerEvents: !open ? "none" : undefined,
      }}
    >
      <div className="featureDetail" key={`selected_${selectedEid}`}>
        <div className="header">
          {selectedEid && (
            <>
              <div className="flex items-start gap-2">
                <h2 className="font-bold flex-1">
                  {selectedExperiment?.experiment?.name || selectedEid}
                </h2>
                <IconButton
                  size="3"
                  variant="ghost"
                  radius="full"
                  style={{ margin: "0 -8px -10px 0" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedEid(undefined);
                  }}
                >
                  <PiXBold />
                </IconButton>
              </div>
              <Link
                size="2"
                href={`${appOrigin}/experiments/lookup/?trackingKey=${selectedEid}`}
                target="_blank"
              >
                GrowthBook
                <PiArrowSquareOut
                  size={16}
                  className="inline-block mb-1 ml-0.5"
                />
              </Link>
            </>
          )}
        </div>

        <div className="content">
          <div className="my-1">
            <div className="mt-2 mb-3">
              <div className="label font-semibold">Enrollment Status</div>
              {selectedExperiment?.evaluatedExperiment?.result?.inExperiment ? (
                <div className="text-green-700 dark:text-green-500 font-semibold text-sm">
                  In experiment
                </div>
              ) : (
                <div className="text-red-900 dark:text-red-400 font-semibold text-sm">
                  Inactive
                </div>
              )}
              {lastDebugLog !== "In experiment" && (
                <div className="border border-slate-a3 rounded-sm bg-console pt-1 px-2 mt-1">
                  <DebugLogAccordion
                    log={[lastDebugLog, {}]}
                    showContext={false}
                    logMessageClassName="text-2xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="label font-semibold">
                {overrideExperiment ? "Forced variation" : "Current variation"}
              </div>
              {overrideExperiment && (
                <Button
                  color="amber"
                  variant="solid"
                  radius="full"
                  size="1"
                  onClick={(e) => {
                    e.preventDefault();
                    setOverrideExperiment(false);
                    selectedEid && unsetForcedVariation(selectedEid);
                  }}
                  className="flex gap-1 items-center bg-amber-200 text-amber-700 hover:bg-amber-300"
                >
                  Clear override
                  <PiXBold />
                </Button>
              )}
            </div>

            {selectedExperiment && selectedEid ? (
              <>
                <EditableVariationField
                  experiment={selectedExperiment.experiment}
                  value={selectedVariation}
                  evaluatedValue={
                    selectedExperiment?.evaluatedExperiment?.result?.variationId
                  }
                  setValue={(v) => {
                    setForcedVariation(selectedEid, v);
                    setOverrideExperiment(true);
                  }}
                />

                {result ? (
                  <Accordion.Root
                    className="accordion mt-1"
                    type="single"
                    collapsible
                  >
                    <Accordion.Item value="debug-log">
                      <Accordion.Trigger className="trigger mb-0.5">
                        <Link
                          size="2"
                          role="button"
                          className="hover:underline"
                        >
                          <PiCaretRightFill
                            className="caret mr-0.5"
                            size={12}
                          />
                          Results log
                        </Link>
                      </Accordion.Trigger>
                      <Accordion.Content className="accordionInner overflow-hidden w-full">
                        <ValueField
                          value={result}
                          valueType="json"
                          maxHeight={200}
                        />
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="label font-semibold mt-3">
            Current value
            {(types?.features || []).length > 1 ? (
              <span className="ml-1 text-xs font-normal">
                (<PiFlagFill className="inline-block" /> {types?.features?.[0]})
              </span>
            ) : null}
          </div>
          <ValueField
            value={selectedExperiment?.evaluatedExperiment?.result?.value}
            valueType={valueType}
          />

          <div className="mt-4 mb-1 text-md font-semibold">
            Implementation
            {(types?.redirect ? 1 : 0) +
              (types?.visual ? 1 : 0) +
              Object.keys(types?.features || {}).length >
            1
              ? "s"
              : ""}
          </div>
          <div className="mb-4">
            {types?.redirect ? (
              <div className="text-sm">
                <PiLinkBold className="inline-block mr-1" />
                URL Redirect
              </div>
            ) : null}
            {types?.visual ? (
              <div className="text-sm">
                <PiMonitorBold className="inline-block mr-1" />
                Visual Editor
              </div>
            ) : null}
            {types?.features?.map((fid, i) => (
              <div key={i}>
                <Link
                  size="2"
                  role="button"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFid(fid);
                    setCurrentTab("features");
                  }}
                >
                  <PiFlagFill className="inline-block mr-1" size={12} />
                  {fid}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-6 mb-3 text-md font-semibold">
            Targeting and Traffic
          </div>

          {urlPatterns?.length ? (
            <div className="box mb-4">
              <div className="text-sm font-bold">URL Targeting</div>
              <ul className="list-disc ml-4 my-2">
                {urlPatterns.map((pattern, i) => (
                  <li className="text-sm leading-5" key={i}>
                    <div className="break-all">{pattern.pattern}</div>
                    {pattern.type !== "simple" && (
                      <div className="text-xs mt-1">
                        ({pattern.type}
                        {pattern.include ? ", exclude" : ""})
                      </div>
                    )}
                    <div>
                      {isURLTargeted(url, [pattern]) ? (
                        <div className="text-green-900 bg-green-200 dark:text-white dark:bg-green-600/75 inline-block capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                          Current URL targeted
                        </div>
                      ) : (
                        <div className="text-red-500 bg-red-100 dark:text-white dark:bg-red-700/50 inline-block capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                          Current URL excluded
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="box text-xs">
            <div className="text-sm font-bold mb-2">Experiment</div>

            <div className="mx-3">
              {condition || parentConditions ? (
                <ConditionDisplay
                  condition={condition}
                  parentConditions={parentConditions}
                />
              ) : null}

              <ExperimentRule
                variations={variations}
                weights={weights}
                hashAttribute={hashAttribute}
                coverage={coverage}
                namespace={namespace}
                valueType={valueType}
              />
            </div>
          </div>

          {selectedExperiment ? (
            <div className="mt-3 mb-1">
              {debugLog ? <DebugLogger logs={debugLog} /> : null}

              <Accordion.Root
                className="accordion mt-2"
                type="single"
                collapsible
              >
                <Accordion.Item value="feature-definition">
                  <Accordion.Trigger className="trigger mb-0.5">
                    <Link size="2" role="button" className="hover:underline">
                      <PiCaretRightFill className="caret mr-0.5" size={12} />
                      Full experiment definition
                    </Link>
                  </Accordion.Trigger>
                  <Accordion.Content className="accordionInner overflow-hidden w-full">
                    <ValueField
                      value={selectedExperiment.experiment}
                      valueType="json"
                      maxHeight={null}
                    />
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditableVariationField({
  experiment,
  value,
  evaluatedValue,
  setValue,
}: {
  experiment?: ExperimentWithFeatures;
  value?: number;
  evaluatedValue?: number;
  setValue: (v: any) => void;
}) {
  let variationsMeta: { key?: string; name?: string }[] | undefined =
    experiment?.meta ??
    experiment?.variations?.map((variation, i) => ({
      key: i + "",
    }));

  if (!variationsMeta || !experiment) return null;

  return (
    <div className="FormRoot">
      <RadioCards.Root
        value={value + ""}
        onValueChange={(s: string) => setValue(parseInt(s))}
        gap="2"
      >
        {variationsMeta.map((meta, i) => (
          <RadioCards.Item
            key={meta.key}
            value={i + ""}
            className="px-3 py-2.5 justify-start"
            style={{ minHeight: 50 }}
          >
            <div className="flex gap-2 items-center cursor-pointer">
              <VariationIcon i={i} />
              <div className="text-xs line-clamp-2 leading-4">
                {getVariationSummary({ experiment, i })}
              </div>
            </div>
          </RadioCards.Item>
        ))}
      </RadioCards.Root>
    </div>
  );
}

export function VariationIcon({
  i = 0,
  size = 16,
  className = "",
  style = {},
  skipColors,
}: {
  i?: number;
  size?: number;
  className?: string;
  style?: CSSProperties;
  skipColors?: boolean;
}) {
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center font-semibold rounded-full border",
        className,
      )}
      style={{
        minWidth: size,
        height: size,
        fontSize: Math.max(Math.round((size * 3) / 5), 11) + "px",
        ...(skipColors
          ? {}
          : {
              color: getVariationColor(i),
              borderColor: getVariationColor(i),
            }),
        ...style,
      }}
    >
      {i}
    </div>
  );
}

export function getVariationSummary({
  i = 0,
  experiment,
}: {
  i?: number;
  experiment: ExperimentWithFeatures;
}): string {
  const { variations, meta } = experiment;
  const variation = variations?.[i];
  const m = meta?.[i];
  const { urlRedirect } = (variation || {}) as AutoExperimentVariation;

  let title = `Variation ${m?.key ?? i}`;
  if (m?.name) {
    title = m.name;
  } else if (urlRedirect) {
    title += `(${urlRedirect})`;
  }

  return title;
}
