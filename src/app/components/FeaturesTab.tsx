import React, { CSSProperties, useEffect, useState } from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import { Button, RadioGroup, Link } from "@radix-ui/themes";
import {
  PiArrowClockwise,
  PiArrowSquareOutBold,
  PiCaretRightFill,
  PiCircleFill,
  PiFlaskFill,
  PiPlusBold,
} from "react-icons/pi";
import clsx from "clsx";
import { Prism } from "react-syntax-highlighter";
import { ghcolors as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import * as Accordion from "@radix-ui/react-accordion";
import Rule from "@/app/components/Rule";
import TextareaAutosize from "react-textarea-autosize";
import useGlobalState from "@/app/hooks/useGlobalState";
import {API_HOST, APP_ORIGIN, CLOUD_API_HOST, CLOUD_APP_ORIGIN} from "@/app/components/Settings";
import {MW} from "@/app";
const customTheme = {
  padding: "5px",
  margin: 0,
  border: "0px none",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  lineHeight: "12px",
};

const LEFT_PERCENT = .4;

export default function FeaturesTab() {
  const [apiHost] = useGlobalState(API_HOST, CLOUD_API_HOST, true);
  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );

  const { evaluatedFeatures } = useGBSandboxEval();

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

  const [overrideFeature, setOverrideFeature] = useState(false);

  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );

  const [expandLinks, setExpandLinks] = useState(false);

  const clickFeature = (fid: string) =>
    setSelectedFid(selectedFid !== fid ? fid : undefined);

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

  // load & scroll animations
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    window.setTimeout(() => setFirstLoad(false), 100);
  }, []);
  useEffect(() => {
    if (selectedFid) {
      const el = document.querySelector(
        `#featuresTab_featureList_${selectedFid}`,
      );
      el?.scrollIntoView({ behavior: firstLoad ? "instant" : "smooth" });
    }
  }, [selectedFid]);

  const leftPercent = !selectedFid || !selectedFeature ? 1 : LEFT_PERCENT;
  const rightPercent = 1 - leftPercent;

  return (
    <>
      <div
        className="mx-auto"
        style={{ maxWidth: MW }}
      >
        <div
          className="py-3"
          style={{
            width: `${leftPercent * 100}vw`,
            maxWidth: MW * leftPercent,
        }}
        >
          {Object.keys(features).map((fid, i) => {
            const {
              feature,
              meta,
              linkedExperiments,
              evaluatedFeature,
              isForced,
            } = getFeatureDetails({
              fid,
              features,
              evaluatedFeatures,
              forcedFeatures,
            });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            const isBoolean = valueStr === "true" || valueStr === "false";
            return (
              <div
                id={`featuresTab_featureList_${fid}`}
                key={fid}
                className={clsx("featureCard ml-3", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div
                  className={clsx("title", {
                    "text-amber-700": isForced,
                    "text-indigo-12": !isForced,
                  })}
                >
                  {fid}
                </div>
                <div
                  className={clsx("value", {
                    uppercase: isBoolean,
                  })}
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
                {isForced && (
                  <div
                    className="bg-amber-600 absolute top-0 right-0 w-[14px] h-[14px]"
                    style={{
                      aspectRatio: 1,
                      clipPath: "polygon(0 0, 100% 100%, 100% 0)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {!!selectedFid && !!selectedFeature && (
        <div
          className="fixed overflow-y-auto pb-2"
          style={{
            top: 80,
            height: "calc(100vh - 80px)",
            width: `${rightPercent * 100}vw`,
            maxWidth: MW * rightPercent,
            right: `calc(max((100vw - ${MW}px)/2, 0px))`,
            zIndex: 1000,
          }}
        >
          <div className="featureDetail" key={`selected_${selectedFid}`}>
            <div className="header">
              <div className="headerInner">
              <div className="flex items-start gap-2">
                <h2 className="font-bold flex-1">{selectedFid}</h2>
                <Link
                  size="1"
                  className="flex-shrink-0"
                  href={`${appOrigin}/features/${selectedFid}`}
                  target="_blank"
                >
                  <Button>
                    GrowthBook <PiArrowSquareOutBold/>
                  </Button>
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
                      setSelectedEid(
                        selectedFeature?.linkedExperiments?.[0].key,
                      );
                    }}
                  >
                    <PiFlaskFill className="inline-block mr-0.5" size={14}/>
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
                      <PiPlusBold className="mr-0.5 inline-block"/>
                      {(selectedFeature?.linkedExperiments || []).length -
                        1}{" "}
                      more
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
            </div>

            <div className="content">
              <div className="my-1">
                <div className="flex items-center mb-1 gap-3">
                  <div className="label font-semibold">Current value</div>
                  {overrideFeature && (
                    <div className="text-sm font-semibold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-md">
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
                        <PiArrowClockwise className="inline-block mr-0.5"/>
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

              <hr className="my-4"/>
              <div className="text-md font-semibold">Rules and Values</div>

              <div className="my-2">
                <div className="text-sm font-semibold mb-2">Default value</div>
                <ValueField
                  value={selectedFeature?.feature?.defaultValue}
                  valueType={selectedFeature?.valueType}
                />
              </div>

              {(selectedFeature?.feature?.rules ?? []).length ? (
                <>
                  <div className="text-sm font-semibold -mb-2">Rules</div>
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

                {selectedFeature?.evaluatedFeature?.debug ? (
                  <Accordion.Root
                    className="accordion mt-2"
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
                          Full debug log
                        </Link>
                      </Accordion.Trigger>
                      <Accordion.Content className="accordionInner overflow-hidden w-full">
                        <ValueField
                          value={selectedFeature.evaluatedFeature.debug}
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
                      <Link
                        size="2"
                        role="button"
                        className="hover:underline"
                      >
                        <PiCaretRightFill
                          className="caret mr-0.5"
                          size={12}
                        />
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
        )}
      </div>
    </>
  );
}

export function ValueField({
  value,
  valueType = "string",
  maxHeight = 120,
  customPrismStyle,
  customPrismOuterStyle,
  customBooleanStyle,
  stringAsCode = true,
  formatDefaultTypeAsConditionValue = false,
}: {
  value: any;
  valueType?: ValueType;
  maxHeight?: number | null;
  customPrismStyle?: CSSProperties;
  customPrismOuterStyle?: CSSProperties;
  customBooleanStyle?: CSSProperties;
  stringAsCode?: boolean;
  formatDefaultTypeAsConditionValue?: boolean;
}) {
  const formattedValue =
    value !== undefined ? JSON.stringify(value, null, 2) : "null";
  return (
    <>
      {(stringAsCode ? ["json", "string"] : ["json"]).includes(valueType) ? (
        <div
          className="border border-gray-200 rounded-md bg-gray-50"
          style={customPrismOuterStyle}
        >
          <Prism
            language="json"
            style={codeTheme}
            customStyle={{
              ...customTheme,
              maxHeight: maxHeight ?? undefined,
              ...customPrismStyle
            }}
            codeTagProps={{
              className: "text-2xs-important !whitespace-pre-wrap",
            }}
          >
            {formattedValue}
          </Prism>
        </div>
      ) : ["false", "true", "null"].includes(formattedValue) ? (
        <div className="text-indigo-12 uppercase" style={customBooleanStyle}>
          {(value === true || value === false) && (
            <PiCircleFill
              size={10}
              className={clsx("inline-block mr-0.5 -mt-0.5", {
                "text-slate-a7": formattedValue === "false",
                "text-teal-600": formattedValue === "true",
              })}
            />
          )}
          {formattedValue}
        </div>
      ) : formatDefaultTypeAsConditionValue ? (
        <span
          className="conditionValue"
          style={
            typeof value === "string"
              ? { color: "rgb(227, 17, 108)" }
              : undefined
          }
        >
          {formattedValue}
        </span>
      ) : (
        <code className="text-slate-700 text-sm whitespace-pre-wrap">
          {formattedValue}
        </code>
      )}
    </>
  );
}

function EditableValueField({
  value,
  setValue,
  valueType = "string",
}: {
  value: any;
  setValue: (v: any) => void;
  valueType?: ValueType;
}) {
  const formattedValue =
    valueType === "json" ? JSON.stringify(value, null, 2) : value;
  const [editedValue, setEditedValue] = useState<any>(formattedValue);
  const [textareaError, setTextareaError] = useState(false);
  const [editing, setEditing] = useState(valueType !== "json");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!editing) {
      setEditedValue(formattedValue);
    }
  }, [value]);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let newValue: any;
    if (valueType === "json") {
      try {
        newValue = JSON.parse(editedValue);
      } catch (e) {
        setTextareaError(true);
        return;
      }
    } else if (valueType === "number") {
      try {
        newValue = JSON.parse(editedValue);
      } catch (e) {
        newValue = parseFloat(editedValue);
      }
      if (!Number.isFinite(newValue)) newValue = 0;
    } else {
      newValue = editedValue;
    }
    setValue(newValue);
    setDirty(false);
    setEditing(false);
  };

  if (!editing && valueType === "json") {
    return (
      <div>
        <ValueField value={value} valueType={valueType} stringAsCode={false} />
        <div className="flex justify-end py-1">
          <Link
            href="#"
            size="2"
            role="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {valueType === "number" ? (
        <input
          className="Input mb-2 px-2 py-1 bg-white"
          type="number"
          value={editedValue}
          onChange={(e) => {
            const v = e.target.value;
            setEditedValue(v);
            setDirty(true);
          }}
        />
      ) : valueType === "boolean" ? (
        // booleans set the value directly without going through save step
        <div className="box">
          <RadioGroup.Root
            value={JSON.stringify(value)}
            onValueChange={(v) => setValue(JSON.parse(v))}
          >
            <RadioGroup.Item
              value="true"
              className="font-semibold my-1 cursor-pointer"
            >
              TRUE
            </RadioGroup.Item>
            <RadioGroup.Item
              value="false"
              className="font-semibold my-1 cursor-pointer"
            >
              FALSE
            </RadioGroup.Item>
          </RadioGroup.Root>
        </div>
      ) : (
        <TextareaAutosize
          className={clsx("Textarea bg-white mono mt-1", {
            "border-red-700": textareaError,
          })}
          name={"__JSON_attributes__"}
          value={editedValue}
          onChange={(e) => {
            const v = e.target.value;
            setEditedValue(v);
            setTextareaError(false);
            setDirty(true);
          }}
          style={{ fontSize: "12px", lineHeight: "16px", padding: "6px 6px" }}
          maxRows={valueType === "json" ? 10 : 3}
        />
      )}

      {valueType !== "boolean" && (dirty || valueType === "json") && (
        <div className="flex items-center justify-end gap-3">
          {(valueType === "json" || dirty) && (
            <Link
              href="#"
              size="2"
              role="button"
              onClick={() => {
                setEditedValue(formattedValue);
                setTextareaError(false);
                setDirty(false);
                setEditing(false);
              }}
            >
              Cancel
            </Link>
          )}
          <Button type="button" size="2" onClick={submit} disabled={!dirty}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

export type ValueType = "string" | "number" | "boolean" | "json";

function getFeatureDetails({
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
}) {
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
    }));

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
