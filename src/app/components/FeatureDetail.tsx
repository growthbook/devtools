import {MW, NAV_H} from "@/app";
import {IconButton, Link} from "@radix-ui/themes";
import {
  PiArrowClockwise,
  PiArrowSquareOutBold,
  PiCaretLeftBold,
  PiCaretRightFill,
  PiFlaskFill,
  PiPlusBold,
} from "react-icons/pi";
import EditableValueField from "@/app/components/EditableValueField";
import ValueField from "@/app/components/ValueField";
import Rule, { USE_PREVIOUS_LOG_IF_MATCH } from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import {HEADER_H, LEFT_PERCENT, SelectedFeature} from "./FeaturesTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState from "@/app/hooks/useTabState";

export default function FeatureDetail({
  selectedFid,
  setSelectedFid,
  selectedFeature,
}: {
  selectedFid: string;
  setSelectedFid: (f: string | undefined) => void;
  selectedFeature: SelectedFeature;
}) {
  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const [overrideFeature, setOverrideFeature] = useState(false);
  const [expandLinks, setExpandLinks] = useState(false);

  const setForcedFeature = (fid: string, value: any) => {
    const newForcedFeatures = { ...forcedFeatures };
    newForcedFeatures[fid] = value;
    setForcedFeatures(newForcedFeatures);
  };
  const unsetForcedFeature = (fid: string) => {
    const newForcedFeatures = { ...forcedFeatures };
    delete newForcedFeatures[fid];
    setForcedFeatures(newForcedFeatures);
    setOverrideFeature(false);
  };

  const debugLog = selectedFeature?.evaluatedFeature?.debug;
  const defaultValueStatus = debugLog
    ? debugLog?.[debugLog.length - 1]?.[0]?.startsWith(
        USE_PREVIOUS_LOG_IF_MATCH,
      )
      ? "matches"
      : "unreachable"
    : "matches";

  useEffect(() => {
    setExpandLinks(false);
  }, [selectedFid, setExpandLinks]);

  useEffect(() => {
    if (selectedFid) {
      if (selectedFid in forcedFeatures) {
        setOverrideFeature(true);
      } else {
        setOverrideFeature(false);
      }
    }
  }, [selectedFid, JSON.stringify(forcedFeatures)]);

  const fullWidthListView = !selectedFid || !selectedFeature;
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
      <div className="featureDetail" key={`selected_${selectedFid}`}>
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
              setSelectedFid(undefined);
            }}
          >
            <IconButton size="1" variant="ghost" radius="full">
              <PiCaretLeftBold />
            </IconButton>
          </Link>
          <div className="flex items-start gap-2">
            <h2 className="font-bold flex-1">{selectedFid}</h2>
            <Link
              size="2"
              className="flex-shrink-0 font-semibold mt-0.5 -mr-1 ml-2"
              href={`${appOrigin}/features/${selectedFid}`}
              target="_blank"
            >
              GrowthBook
              <PiArrowSquareOutBold
                size={16}
                className="inline-block mb-1 ml-0.5"
              />
            </Link>
          </div>
          {(selectedFeature?.linkedExperiments || []).length ? (
            <div className="mt-1 flex items-center gap-4">
              <Link
                size="2"
                role="button"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentTab("experiments");
                  setSelectedEid(selectedFeature?.linkedExperiments?.[0].key);
                }}
              >
                <PiFlaskFill className="inline-block mr-0.5" size={14} />
                {selectedFeature?.linkedExperiments?.[0].key}
              </Link>
              {(selectedFeature?.linkedExperiments || []).length > 1 &&
              !expandLinks ? (
                <Link
                  size="2"
                  role="button"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandLinks(true);
                  }}
                >
                  <PiPlusBold className="mr-0.5 inline-block" />
                  {(selectedFeature?.linkedExperiments || []).length - 1} more
                </Link>
              ) : null}
            </div>
          ) : null}
          {(selectedFeature?.linkedExperiments || []).length > 1 &&
          expandLinks
            ? selectedFeature.linkedExperiments.map((experiment, i) => {
                if (i === 0) return null;
                return (
                  <div key={i}>
                    <Link
                      size="2"
                      role="button"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentTab("experiments");
                        setSelectedEid(experiment.key);
                      }}
                    >
                      <PiFlaskFill
                        className="inline-block mr-0.5"
                        size={14}
                      />
                      {experiment.key}
                    </Link>
                  </div>
                );
              })
            : null}
        </div>

        <div className="content">
          <div className="my-1">
            <div className="flex items-center mb-1 gap-3">
              <div className="label font-semibold">Current value</div>
              {overrideFeature && (
                <div className="text-xs font-semibold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-md">
                  Override
                </div>
              )}
              <div className="flex flex-1 items-center justify-end">
                {overrideFeature && (
                  <Link
                    size="2"
                    role="button"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOverrideFeature(false);
                      unsetForcedFeature(selectedFid);
                    }}
                  >
                    <PiArrowClockwise className="inline-block mr-0.5" />
                    Revert
                  </Link>
                )}
              </div>
            </div>
            <EditableValueField
              value={selectedFeature?.evaluatedFeature?.result?.value}
              setValue={(v) => {
                setForcedFeature(selectedFid, v);
                setOverrideFeature(true);
              }}
              valueType={selectedFeature?.valueType}
            />
          </div>

          <div className="mt-6 mb-2 py-1 text-md font-semibold border-b border-slate-200">
            Rules and Values
          </div>

          <div
            className={`rule ${defaultValueStatus}`}
            style={{ padding: "12px 8px 12px 12px" }}
          >
            <div className="text-sm font-semibold mb-2">
              Default value
              <div className="inline-block ml-3 status capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                {defaultValueStatus === "matches" ? "Active" : "Inactive"}
              </div>
            </div>
            <ValueField
              value={selectedFeature?.feature?.defaultValue}
              valueType={selectedFeature?.valueType}
            />
          </div>

          {(selectedFeature?.feature?.rules ?? []).length ? (
            <>
              <div className="text-sm font-semibold -mb-3">Rules</div>
              {selectedFeature?.feature?.rules?.map((rule, i) => {
                return (
                  <Rule
                    key={i}
                    rule={rule}
                    i={i}
                    fid={selectedFid}
                    feature={selectedFeature.feature}
                    valueType={selectedFeature.valueType}
                    evaluatedFeature={selectedFeature.evaluatedFeature}
                  />
                );
              })}
            </>
          ) : null}

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
                    Full feature definition
                  </Link>
                </Accordion.Trigger>
                <Accordion.Content className="accordionInner overflow-hidden w-full">
                  <ValueField
                    value={selectedFeature.feature}
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
