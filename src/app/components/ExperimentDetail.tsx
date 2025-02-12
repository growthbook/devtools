import { MW, NAV_H } from "@/app";
import { IconButton, Link, Select } from "@radix-ui/themes";
import {
  PiArrowClockwise,
  PiArrowSquareOutBold,
  PiCaretLeftBold,
  PiCaretRightFill, PiFlagFill, PiFlaskFill, PiLinkBold, PiMonitorBold, PiWarningBold,
} from "react-icons/pi";
import ValueField from "@/app/components/ValueField";
import {ConditionDisplay, ExperimentRule, getVariationColor} from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, {CSSProperties, useEffect, useState} from "react";
import {ExperimentWithFeatures, HEADER_H, LEFT_PERCENT} from "./ExperimentsTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState from "@/app/hooks/useTabState";
import { SelectedExperiment } from "@/app/components/ExperimentsTab";
import {AutoExperimentVariation, isURLTargeted} from "@growthbook/growthbook";
import clsx from "clsx";

export default function ExperimentDetail({
  selectedEid,
  setSelectedEid,
  selectedExperiment,
}: {
  selectedEid: string;
  setSelectedEid: (f: string | undefined) => void;
  selectedExperiment: SelectedExperiment;
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

  const setForcedVariation = (eid: string, value: any) => {
    const newForcedVariations = { ...forcedVariations };
    newForcedVariations[eid] = value;
    setForcedVariations(newForcedVariations);
  };
  const unsetForcedVariation = (eid: string) => {
    const newForcedVariations = { ...forcedVariations };
    delete newForcedVariations[eid];
    setForcedVariations(newForcedVariations);
    setOverrideExperiment(false);
  };

  const { types } = selectedExperiment;

  const { variations, weights, hashAttribute, coverage, namespace } = selectedExperiment.experiment;
  const { urlPatterns } = selectedExperiment.experiment;
  const { condition, parentConditions } = selectedExperiment.experiment;

  const result = { ...selectedExperiment?.evaluatedExperiment?.result };
  delete result.stickyBucketUsed;

  const selectedVariation = forcedVariations?.[selectedEid]
    ?? selectedExperiment?.evaluatedExperiment?.result?.variationId
    ?? 0;

  const debugLog = selectedExperiment?.evaluatedExperiment?.debug;
  const lastDebugLog = debugLog ? debugLog[debugLog.length - 1]?.[0] : "" ?? "";

  const status = !!result.inExperiment;

  const fid = selectedExperiment.experiment.features?.[0];
  const valueType = (fid ? selectedExperiment.experiment.featureTypes?.[fid] : "json") ?? "json";

  useEffect(() => {
    if (selectedEid) {
      if (selectedEid in forcedVariations) {
        setOverrideExperiment(true);
      } else {
        setOverrideExperiment(false);
      }
    }
  }, [selectedEid, JSON.stringify(forcedVariations)]);

  const fullWidthListView = !selectedEid || !selectedExperiment;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;
  const rightPercent = 1 - leftPercent;

  return (
    <div
      className="fixed overflow-y-auto bg-white"
      style={{
        top: NAV_H + HEADER_H,
        height: `calc(100vh - ${NAV_H + HEADER_H}px)`,
        width: `${rightPercent * 100}vw`,
        maxWidth: MW * rightPercent,
        right: `calc(max((100vw - ${MW}px)/2, 0px))`,
        zIndex: 1000,
      }}
    >
      <div className="featureDetail" key={`selected_${selectedEid}`}>
        <div className="header">
          <Link
            role="button"
            className="absolute"
            style={{
              top: 16,
              left: 4,
              zIndex: 1001,
            }}
            onClick={(e) => {
              e.preventDefault();
              setSelectedEid(undefined);
            }}
          >
            <IconButton size="1" variant="ghost" radius="full">
              <PiCaretLeftBold />
            </IconButton>
          </Link>
          <div className="flex items-start gap-2">
            <h2 className="font-bold flex-1">{selectedEid}</h2>
            <Link
              size="2"
              className="flex-shrink-0 font-semibold mt-0.5 -mr-1 ml-2"
              href={`${appOrigin}/experiment/${selectedEid}`}
              target="_blank"
            >
              GrowthBook
              <PiArrowSquareOutBold
                size={16}
                className="inline-block mb-1 ml-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="content">
          <div className="my-1">
            <div className="flex items-center mb-1 gap-3">
              <div className="label font-semibold">Current value</div>
              {overrideExperiment && (
                <div className="text-xs font-semibold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-md">
                  Override
                </div>
              )}
              <div className="flex flex-1 items-center justify-end">
                {overrideExperiment && (
                  <Link
                    size="2"
                    role="button"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOverrideExperiment(false);
                      unsetForcedVariation(selectedEid);
                    }}
                  >
                    <PiArrowClockwise className="inline-block mr-0.5"/>
                    Revert
                  </Link>
                )}
              </div>
            </div>

            <EditableVariationField
              experiment={selectedExperiment.experiment}
              value={selectedVariation}
              evaluatedValue={
                selectedExperiment?.evaluatedExperiment?.result
                  ?.variationId
              }
              setValue={(v) => {
                setForcedVariation(selectedEid, v);
                setOverrideExperiment(true);
              }}
            />

            {selectedVariation !== selectedExperiment?.evaluatedExperiment?.result?.variationId ? (
              <div className="mt-2 ml-1 mb-3 text-sm text-red-900">
                <PiWarningBold className="inline-block"/>{" "}
                Cannot apply variation{" "}
                <VariationIcon
                  i={selectedVariation}
                  size={16}
                  skipColors={true}
                  style={{position: "relative", top: -1, color: "#7f1d1d", borderColor: "#7f1d1d"}}
                />
              </div>
            ) : null}

            {debugLog ? (
              <div className="box mt-3 mb-4">
                <div className="flex items-center text-md font-semibold mb-1">
                  <span>Status</span>
                  <div className={clsx("inline-block ml-3 capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md", {
                    "text-emerald-700 bg-emerald-200": status,
                    "text-red-500 bg-red-100": !status,
                  })}>
                    {status ? "In experiment" : "Not in experiment"}
                  </div>
                </div>
                <ul className="list-disc ml-4">
                  <li className="text-sm">
                    <label className="inline-block" style={{width: 80}}>Variation:</label>
                    <span>{result.variationId ?? "null"}</span>
                  </li>
                  <li className="text-sm">
                    <label className="inline-block" style={{width: 80}}>Debug log:</label>
                    <code className="text-pink-900 text-xs">{lastDebugLog}</code>
                  </li>
                </ul>
                {result ? (
                  <Accordion.Root
                    className="accordion mt-1"
                    type="single"
                    collapsible
                  >
                    <Accordion.Item value="debug-log">
                      <Accordion.Trigger className="trigger mb-0.5">
                        <Link size="2" role="button" className="hover:underline">
                          <PiCaretRightFill className="caret mr-0.5" size={12}/>
                          More
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
              </div>
            ) : null}
          </div>

          <div className="mt-4 mb-1 text-md font-semibold">
            Experiment Type
          </div>
          <div>
            {types.redirect ? (
              <div className="text-sm">
                <PiLinkBold className="inline-block mr-1" />
                URL Redirect Experiment
              </div>
            ) : null}
            {types.visual ? (
              <div className="text-sm">
                <PiMonitorBold className="inline-block mr-1" />
                Visual Editor Experiment
              </div>
              ) : null}
            {types.features?.map((fid) => (
              <div>
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
              <div className="text-sm font-bold">
                URL Targeting
              </div>
              <ul className="list-disc ml-4 my-2">
                {urlPatterns.map((pattern) => (
                  <li className="text-sm leading-5">
                    <div className="break-all">{pattern.pattern}</div>
                    {pattern.type !== "simple" && (
                      <div className="text-xs mt-1">
                        ({pattern.type}{pattern.include ? ", exclude" : ""})
                      </div>
                    )}
                    <div>
                      {isURLTargeted(url, [pattern]) ? (
                        <div
                          className="text-emerald-700 bg-emerald-200 inline-block capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                          Current URL targeted
                        </div>
                      ) : (
                        <div
                          className="text-red-500 bg-red-100 inline-block capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
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
            <div className="text-sm font-bold mb-2">
              Experiment
            </div>

            <div className="mx-3">
              {condition || parentConditions ? (
                <ConditionDisplay condition={condition} parentConditions={parentConditions}/>
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

          <div className="mt-3 mb-1">
            {debugLog ? (
              <Accordion.Root
                className="accordion mt-2"
                type="single"
                collapsible
              >
                <Accordion.Item value="debug-log">
                  <Accordion.Trigger className="trigger mb-0.5">
                    <Link size="2" role="button" className="hover:underline">
                      <PiCaretRightFill className="caret mr-0.5" size={12}/>
                      Debug log
                    </Link>
                  </Accordion.Trigger>
                  <Accordion.Content className="accordionInner overflow-hidden w-full">
                    <ValueField
                      value={debugLog}
                      valueType="json"
                      maxHeight={200}
                    />
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            ) : null}

            <Accordion.Root
              className="accordion mt-2"
              type="single"
              collapsible
            >
              <Accordion.Item value="feature-definition">
                <Accordion.Trigger className="trigger mb-0.5">
                  <Link size="2" role="button" className="hover:underline">
                    <PiCaretRightFill className="caret mr-0.5" size={12}/>
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
  experiment: ExperimentWithFeatures;
  value?: number;
  evaluatedValue?: number;
  setValue: (v: any) => void;
}) {
  let variationsMeta: { key?: string; name?: string }[] =
    experiment.meta ??
    experiment.variations.map((variation, i) => ({
      key: i + "",
    }));

  return (
    <div className="FormRoot">
      <Select.Root
        size="2"
        value={value + ""}
        onValueChange={(s: string) => setValue(parseInt(s))}
      >
        <Select.Trigger variant="surface" className="w-full">
          <div className="flex gap-2 items-center">
            <VariationIcon i={value} />
            <span className="text-xs">
              <VariationSummary experiment={experiment} i={value || 0} />
            </span>
          </div>
        </Select.Trigger>
        <Select.Content
          variant="soft"
        >
          {variationsMeta.map((meta, i) => (
            <Select.Item key={meta.key} value={i + ""}>
              <div className="flex gap-2 items-center">
                <VariationIcon i={i}/>
                <span className="text-xs">
                  <VariationSummary experiment={experiment} i={i || 0}/>
                </span>
              </div>
            </Select.Item>
            ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}

export function VariationIcon({
  i = 0,
  size = 20,
  style = {},
  skipColors,
}: {
  i?: number;
  size?: number;
  style?: CSSProperties;
  skipColors?: boolean;
}) {
  return (
    <div
      className="inline-flex items-center justify-center font-semibold rounded-full border"
      style={{
        minWidth: size,
        height: size,
        fontSize: Math.max(Math.round(size * 3/5), 11) + "px",
        ...(skipColors ? {} : {
          color: getVariationColor(i),
          borderColor: getVariationColor(i),
        }),
        ...style,
      }}
    >
      {i}
    </div>
  )
}

export function VariationSummary({
  i,
  experiment
}: {
  i: number;
  experiment: ExperimentWithFeatures;
}): string {
  const { variations, meta } = experiment;
  const variation = variations?.[i];
  const m = meta?.[i];

  let s = `Variation ${m?.key ?? i}`;
  if (m?.name) {
    s = m.name;
  }

  const { domMutations, css, js, urlRedirect } = variation as AutoExperimentVariation;
  const stringParts: string[] = [];

  const dmString = domMutations?.length ? `${domMutations.length} DOM mutation${domMutations.length === 1 ? "" : "s"}` : "";
  dmString && stringParts.push(dmString);

  const cssString = css ? "CSS changes" : "";
  cssString && stringParts.push(cssString);

  const jsString = js ? "JS changes" : "";
  jsString && stringParts.push(jsString);

  const redirectString = urlRedirect ? `URL redirect to ${urlRedirect}` : "";
  redirectString && stringParts.push(redirectString);

  if (stringParts.length) {
    s += ` (${stringParts.join(", ")})`;
  }
  return s;
}
