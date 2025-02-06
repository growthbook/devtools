import React, {useEffect, useState} from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import {Avatar, Button, Link, Switch} from "@radix-ui/themes";
import {PiCaretRightFill, PiCircleFill, PiFlagBold, PiFlaskFill, PiPlusSquareBold} from "react-icons/pi";
import clsx from "clsx";
import {Prism} from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
import * as Accordion from "@radix-ui/react-accordion";
const customTheme = {
  padding: "5px",
  margin: 0,
  border: "0px none",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  lineHeight: "12px",
};

export default function FeaturesTab() {
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const [forcedFeatures, setForcedFeatures] = useTabState<
    Record<string, any>
  >("forcedFeatures", {});

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
  }

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
      const el = document.querySelector(`#featuresTab_featureList_${selectedFid}`);
      el?.scrollIntoView({ behavior: firstLoad ? 'instant' : 'smooth' });
    }
  }, [selectedFid]);

  return (
    <>
      <div className="max-w-[900px] mx-auto">
        <div className="w-[45%] max-w-[405px] pb-3">
          {Object.keys(features).map((fid, i) => {
            const { feature, meta, linkedExperiments, evaluatedFeature, isForced } =
              getFeatureDetails({
                fid,
                features,
                evaluatedFeatures,
                forcedFeatures,
              });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            const isBoolean = (valueStr === "true" || valueStr === "false");
            return (
              <div
                id={`featuresTab_featureList_${fid}`}
                key={fid}
                className={clsx("featureCard ml-1 mb-2", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div className={clsx("text-sm font-semibold", {
                  "text-amber-700": isForced,
                  "text-indigo-12": !isForced,
                })}>
                  {linkedExperiments.length > 0 && (
                    <PiFlaskFill className="inline-block mr-0.5" size={12}/>
                  )}
                  {fid}
                </div>
                <div className={clsx("text-indigo-12 text-xs line-clamp-1 mt-0", {
                  "uppercase": isBoolean,
                })}>
                  {isBoolean && (
                    <PiCircleFill
                      size={8}
                      className={clsx("inline-block mr-0.5 -mt-0.5",
                        {
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

        <div
          className="w-[55%] max-w-[495px] overflow-y-auto pr-3 pb-2 fixed left-[45%]"
          style={{
            zIndex: 1000,
            top: 95,
            height: "calc(100vh - 95px)",
          }}
        >
          {!!selectedFid && !!selectedFeature && (
            <div className="featureDetail" key={`selected_${selectedFid}`}>
              <div className="header">
                <h2 className="font-bold">{selectedFid}</h2>
                {(selectedFeature?.linkedExperiments || []).length ? (
                    <div className="mt-1 flex items-start gap-4">
                      <Link size="2" role="button" href="#" onClick={(e) => {
                        e.preventDefault();
                        setCurrentTab("experiments");
                        setSelectedEid(selectedFeature?.linkedExperiments?.[0].key);
                      }}>
                        <PiFlaskFill className="inline-block mr-0.5" size={14} />
                        {selectedFeature?.linkedExperiments?.[0].key}
                      </Link>
                      {(selectedFeature?.linkedExperiments || []).length > 1 && !expandLinks ? (
                        <Link size="1" role="button" className="mt-0.5 hover:underline text-indigo-11" onClick={() => setExpandLinks(true)}>
                          <PiPlusSquareBold className="mr-1 inline-block" />
                          {(selectedFeature?.linkedExperiments || []).length-1} more
                        </Link>
                      ): null}
                    </div>
                ) : null}
                {(selectedFeature?.linkedExperiments || []).length > 1 && expandLinks ?
                  selectedFeature.linkedExperiments.map((experiment, i) => {
                    if (i===0) return null;
                    return (
                      <div>
                        <Link size="2" role="button" href="#" onClick={(e) => {
                          e.preventDefault();
                          setCurrentTab("experiments");
                          setSelectedEid(experiment.key);
                        }}>
                          <PiFlaskFill className="inline-block mr-0.5" size={14}/>
                          {experiment.key}
                        </Link>
                      </div>
                    );
                  }) : null}
              </div>

              <div className="content">
              <div className="my-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="label">Current value</div>
                  {(selectedFeature?.valueType !== "boolean" || overrideFeature) && (
                    <label className="flex items-center cursor-pointer select-none">
                      <Switch
                        radius="medium"
                        color="amber"
                        checked={overrideFeature}
                        onCheckedChange={(v) => {
                          setOverrideFeature(v);
                          if (!v) unsetForcedFeature(selectedFid);
                        }}
                      />
                      <span className={clsx("text-xs ml-1", {
                        "text-amber-600": overrideFeature,
                        "text-gray-600": !overrideFeature,
                      })}>Override</span>
                    </label>
                  )}
                </div>
                {overrideFeature || selectedFeature?.valueType === "boolean" ? (
                  <EditableValueField
                    value={selectedFeature?.evaluatedFeature?.result?.value}
                    setValue={(v) => {
                      setForcedFeature(selectedFid, v);
                      setOverrideFeature(true);
                    }}
                    valueType={selectedFeature?.valueType}
                  />
                ) : (
                  <ValueField
                    value={selectedFeature?.evaluatedFeature?.result?.value}
                    valueType={selectedFeature?.valueType}
                  />
                )}
              </div>

              {selectedFeature?.evaluatedFeature?.debug ? (
                <Accordion.Root
                  className="accordion mt-2"
                  type="single"
                  collapsible
                >
                  <Accordion.Item value="debug-log">
                    <Accordion.Trigger className="trigger mb-0.5">
                      <Link size="2" role="button" className="hover:underline">
                        <PiCaretRightFill className="caret mr-0.5" size={12} />
                        Debug log
                      </Link>
                    </Accordion.Trigger>
                    <Accordion.Content className="accordionInner overflow-hidden w-full">
                      {/*todo: replace with logger display component?*/}
                      <ValueField
                        value={{
                          debug: selectedFeature.evaluatedFeature.debug,
                          result: selectedFeature.evaluatedFeature.result,
                        }}
                        valueType="json"
                        maxHeight={200}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              ): null}

              <hr className="my-4"/>
              <h2 className="label font-bold">Rules</h2>

              <div className="my-2">
                <div className="label mb-1">Default value</div>
                <ValueField
                  value={selectedFeature?.feature?.defaultValue}
                  valueType={selectedFeature?.valueType}
                />
              </div>

              <div className="my-2">
                <div className="label mb-1">Definition</div>
                <ValueField
                  value={selectedFeature.feature}
                  valueType="json"
                />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}

function ValueField({
  value,
  valueType = "string",
  maxHeight = 120,
}:{
  value: any;
  valueType?: ValueType;
  maxHeight?: number;
}) {
  const formattedValue = value !== undefined ?
    JSON.stringify(value, null, 2) :
    "null";
  return (
    <>
      {["json", "string"].includes(valueType) ? (
        <div className="border border-gray-200 rounded-md bg-gray-50">
          <Prism
            language="json"
            style={codeTheme}
            customStyle={{ ...customTheme, maxHeight }}
            codeTagProps={{
              className: "text-2xs-important !whitespace-pre-wrap",
            }}
          >
            {formattedValue}
          </Prism>
        </div>
      ) : ["false", "true", "null"].includes(formattedValue) ? (
        <div className="text-slate-700">
          <div
            className={clsx(
              "text-sm",
              {
                "text-gray-600 uppercase":
                  formattedValue === "false",
                "text-teal-700 uppercase":
                  formattedValue === "true",
                "text-gray-800 uppercase":
                  formattedValue === "null",
              },
            )}
          >
            {(formattedValue === "true" || formattedValue === "false") && (<PiCircleFill className="inline-block mr-1 -mt-0.5" size={8} />)}
            {formattedValue}
          </div>
        </div>
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
}:{
  value: any;
  setValue: (v: any) => void;
  valueType?: ValueType;
}) {
  const formattedValue = valueType === "json" ? JSON.stringify(value, null, 2) : value;
  const [editedValue, setEditedValue] = useState<any>(formattedValue);
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);

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
      if (!Number.isFinite(newValue)) newValue = 0
    } else {
      newValue = editedValue;
    }
    setValue(newValue);
    setDirty(false);
  }

  return (
    <div>
      {valueType === "number" ? (
        <input
          className="Input mb-2"
          type="number"
          value={editedValue}
          onChange={(e) => {
            const v = e.target.value;
            setEditedValue(v);
            setDirty(true);
          }}
        />
      ) : valueType === "boolean" ? (
        // switches set the value directly without going through save step
        <label className="flex items-center gap-2">
          <Switch
            size="2"
            className="Switch"
            checked={value}
            onCheckedChange={(v: boolean) => {
              setValue(v);
            }}
          />
          <div className="text-slate-700">
            <div
              className={clsx(
                "text-sm",
                {
                  "text-gray-600 uppercase":
                    value === false,
                  "text-teal-700 uppercase":
                    value === true,
                },
              )}
            >
              {(value === true || value === false) && (<PiCircleFill className="inline-block mr-1 -mt-0.5" size={8} />)}
              {JSON.stringify(value)}
            </div>
          </div>
        </label>
      ) : (
        <textarea
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
          style={{fontSize: "10px", lineHeight: "15px", padding: "2px 6px"}}
          rows={valueType === "json" ? 10 : 3}
        />
      )}

      {valueType !== "boolean" && (
        <div className="flex items-center justify-end gap-3">
          {dirty && (
            <Link
              href="#"
              size="2"
              role="button"
              color="gray"
              onClick={() => {
                setEditedValue(formattedValue);
                setTextareaError(false);
                setDirty(false);
              }}
            >
              Undo typing
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

type ValueType = "string" | "number" | "boolean" | "json";

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
    valueType = typeof (feature?.defaultValue ?? "string") as ValueType || "object";
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
    }))

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
