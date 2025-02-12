import { MW, NAV_H } from "@/app";
import { IconButton, Link, Select } from "@radix-ui/themes";
import {
  PiArrowClockwise,
  PiArrowSquareOutBold,
  PiCaretLeftBold,
  PiCaretRightFill, PiWarningBold,
} from "react-icons/pi";
import ValueField from "@/app/components/ValueField";
import { USE_PREVIOUS_LOG_IF_MATCH } from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { HEADER_H, LEFT_PERCENT } from "./ExperimentsTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState from "@/app/hooks/useTabState";
import {SelectedExperiment} from "@/app/components/ExperimentsTab";
import {AutoExperiment, Experiment } from "@growthbook/growthbook";

export default function ExperimentDetail({
  selectedEid,
  setSelectedEid,
  selectedExperiment,
}: {
  selectedEid: string;
  setSelectedEid: (f: string | undefined) => void;
  selectedExperiment: SelectedExperiment;
}) {
  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

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

  const debugLog = selectedExperiment?.evaluatedExperiment?.debug;
  // todo: rework
  const defaultValueStatus = debugLog
    ? debugLog?.[debugLog.length - 1]?.[0]?.startsWith(
        USE_PREVIOUS_LOG_IF_MATCH,
      )
      ? "matches"
      : "unreachable"
    : "matches";

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
                    <PiArrowClockwise className="inline-block mr-0.5" />
                    Revert
                  </Link>
                )}
              </div>
            </div>
            <EditableVariationField
              experiment={selectedExperiment.experiment}
              value={forcedVariations?.[selectedEid] || 0}
              evaluatedValue={
                selectedExperiment?.evaluatedExperiment?.result
                  ?.variationId
              }
              setValue={(v) => {
                setForcedVariation(selectedEid, v);
                setOverrideExperiment(true);
              }}
            />
          </div>

          <div className="mt-6 mb-2 py-1 text-md font-semibold border-b border-slate-200">
            Targeting and Traffic
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
                      <PiCaretRightFill className="caret mr-0.5" size={12} />
                      Full debug log
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
        </div>
      </div>
    </div>
  );
}


// todo: move to experiment detail
function EditableVariationField({
  experiment,
  value,
  evaluatedValue,
  setValue,
}: {
  experiment: Experiment<any> | AutoExperiment;
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
            {value}
            {value !== evaluatedValue && (
              <PiWarningBold className="text-orange-700" />
            )}
          </div>
        </Select.Trigger>
        <Select.Content>
          {variationsMeta.map((meta, i) => (
            <Select.Item key={meta.key} value={i + ""}>
              {i} {meta?.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}
