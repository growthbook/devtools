import { MW, NAV_H } from "@/app";
import { Button, IconButton, Link, Switch } from "@radix-ui/themes";
import {
  PiArrowSquareOut,
  PiCaretRightFill,
  PiXBold,
} from "react-icons/pi";
import EditableValueField from "@/app/components/EditableValueField";
import ValueField from "@/app/components/ValueField";
import Rule, { USE_PREVIOUS_LOG_IF_MATCH } from "@/app/components/Rule";
import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { HEADER_H, LEFT_PERCENT, SelectedFeature } from "./FeaturesTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import useTabState from "@/app/hooks/useTabState";
import DebugLogger from "@/app/components/DebugLogger";

export default function FeatureDetail({
  selectedFid,
  setSelectedFid,
  selectedFeature,
  open,
  isResponsive,
}: {
  selectedFid?: string;
  setSelectedFid: (s: string | undefined) => void;
  selectedFeature?: SelectedFeature;
  open: boolean;
  isResponsive: boolean;
}) {
  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const [hideInactiveRules, setHideInactiveRules] = useTabState<boolean>(
    "hideInactiveRules",
    true,
  );
  const [overrideFeature, setOverrideFeature] = useState(false);

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
    if (selectedFid) {
      if (selectedFid in forcedFeatures) {
        setOverrideFeature(true);
      } else {
        setOverrideFeature(false);
      }
    }
  }, [selectedFid, JSON.stringify(forcedFeatures)]);

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
      <div className="featureDetail" key={`selected_${selectedFid}`}>
        <div className="header">
          {selectedFid && (
            <>
              <div className="flex items-start gap-2">
                <h2 className="font-bold flex-1">{selectedFid}</h2>
                <IconButton
                  size="3"
                  variant="ghost"
                  radius="full"
                  style={{ margin: "0 -8px -10px 0" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFid(undefined);
                  }}
                >
                  <PiXBold />
                </IconButton>
              </div>
              <Link
                size="2"
                href={`${appOrigin}/features/${selectedFid}`}
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
            <div className="flex items-center justify-between my-2">
              <div className="label font-semibold">Current value</div>
              {overrideFeature && (
                <Button
                  color="amber"
                  variant="solid"
                  radius="full"
                  size="1"
                  onClick={(e) => {
                    e.preventDefault();
                    setOverrideFeature(false);
                    selectedFid && unsetForcedFeature(selectedFid);
                  }}
                  className="flex gap-1 items-center bg-amber-200 text-amber-700 hover:bg-amber-300"
                >
                  Clear override
                  <PiXBold />
                </Button>
              )}
            </div>
            {selectedFeature && selectedFid ? (
              <EditableValueField
                value={selectedFeature?.evaluatedFeature?.result?.value}
                setValue={(v) => {
                  setForcedFeature(selectedFid, v);
                  setOverrideFeature(true);
                }}
                valueType={selectedFeature?.valueType}
              />
            ) : null}
          </div>

          <div className="flex justify-between items-end mt-6 mb-2 py-1 text-md font-semibold border-b border-slate-200">
            <span>Rules and Values</span>
            <label className="flex gap-1 text-xs items-center font-normal select-none cursor-pointer">
              <span>Hide inactive</span>
              <Switch
                size="1"
                checked={hideInactiveRules}
                onCheckedChange={(b) => setHideInactiveRules(b)}
              />
            </label>
          </div>

          {!hideInactiveRules || defaultValueStatus === "matches" ? (
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
          ) : null}

          {selectedFid &&
          selectedFeature &&
          (selectedFeature?.feature?.rules ?? []).length ? (
            <>
              {selectedFeature?.feature?.rules?.map((rule, i) => {
                return (
                  <Rule
                    key={i}
                    rule={rule}
                    i={i}
                    fid={selectedFid}
                    valueType={selectedFeature.valueType}
                    evaluatedFeature={selectedFeature.evaluatedFeature}
                    hideInactive={hideInactiveRules}
                  />
                );
              })}
            </>
          ) : null}

          {selectedFeature ? (
            <div className="mt-3 mb-1">
              {debugLog ? (
                <DebugLogger logs={debugLog} />
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
