import React, {useEffect, useState} from "react";
import { FeatureDefinition } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import {Avatar, Button, Link, Switch} from "@radix-ui/themes";
import { PiFlagBold } from "react-icons/pi";
import clsx from "clsx";
import {Prism} from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
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
    if (selectedFid) {
      if (selectedFid in forcedFeatures) {
        setOverrideFeature(true);
      } else {
        setOverrideFeature(false);
      }
    }
  }, [selectedFid, JSON.stringify(forcedFeatures)]);

  useEffect(() => {
    if (selectedFid) {
      const el = document.querySelector(`#featuresTab_featureList_${selectedFid}`);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedFid]);

  return (
    <>
      <div className="flex justify-between items-top">
        <div className="w-[50%] pr-2">
          <div className="label lg mb-2">Features</div>
          {Object.keys(features).map((fid, i) => {
            const { feature, meta, evaluatedFeature, isForced } =
              getFeatureDetails({
                fid,
                features,
                evaluatedFeatures,
                forcedFeatures,
              });
            const valueStr = evaluatedFeature?.result
              ? JSON.stringify(evaluatedFeature.result?.value)
              : "null";
            return (
              <div
                id={`featuresTab_featureList_${fid}`}
                key={fid}
                className={clsx("featureCard relative mb-2", {
                  selected: selectedFid === fid,
                })}
                onClick={() => clickFeature(fid)}
              >
                <div className="flex gap-2 items-center">
                  <Avatar
                    color={isForced ? "amber" : undefined}
                    variant={isForced ? "solid" : "soft"}
                    size="1"
                    radius="full"
                    fallback={
                      <span className={isForced ? "text-amber-800" : undefined}>
                        <PiFlagBold />
                      </span>
                    }
                  />
                  <code className="text-xs text-gray-800">{fid}</code>
                  <div className="flex-1" />
                  <code
                    className={clsx(
                      "flex-shrink-0 text-slate-800 line-clamp-3 max-w-[100px]",
                      {
                        "text-right text-xs": valueStr.length < 10,
                        "text-left text-2xs": valueStr.length >= 10,
                        "inline-block px-1 bg-rose-100 rounded-md text-rose-900":
                          valueStr === "false",
                        "inline-block px-1 bg-blue-100 rounded-md text-blue-900":
                          valueStr === "true",
                        "inline-block px-1 bg-gray-100 rounded-md text-gray-900":
                          valueStr === "null",
                      },
                    )}
                  >
                    {valueStr}
                  </code>
                </div>
                {isForced && (
                  <div className="pointer-events-none absolute top-[-6px] right-[-12px] px-1 bg-white shadow-sm rounded-md text-2xs mr-1 font-bold uppercase text-amber-600">
                    Override
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="w-[50%] overflow-y-auto pl-2 pr-4 pt-2 pb-2 fixed right-0"
          style={{
            zIndex: 1000,
            top: 85,
            height: "calc(100vh - 85px)",
          }}
        >
          {!!selectedFid && !!selectedFeature && (
            <div key={`selected_${selectedFid}`}>
              <div className="flex items-center gap-2 mb-1">
                <Avatar size="2" radius="full" fallback={<PiFlagBold />} />
                <h2 className="font-bold">{selectedFid}</h2>
              </div>

              <div className="box">
                <div className="my-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="label">Current value</div>
                    {(selectedFeature?.valueType !== "boolean" || overrideFeature) && (
                      <label className="flex items-center cursor-pointer select-none">
                        <span className={clsx("text-xs mr-1 font-bold uppercase", {
                          "text-amber-600": overrideFeature,
                          "text-gray-600": !overrideFeature,
                        })}>Override</span>
                        <Switch
                          radius="small"
                          color="amber"
                          checked={overrideFeature}
                          onCheckedChange={(v) => {
                            setOverrideFeature(v);
                            if (!v) unsetForcedFeature(selectedFid);
                          }}
                        />
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
                  <Prism
                    language="json"
                    style={codeTheme}
                    customStyle={{...customTheme, maxHeight: 120}}
                    codeTagProps={{
                      className: "text-2xs-important !whitespace-pre-wrap",
                    }}
                  >
                    {JSON.stringify(selectedFeature.feature, null, 2)}
                  </Prism>
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
}:{
  value: string;
  valueType?: ValueType
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
            customStyle={{ ...customTheme, maxHeight: 120 }}
            codeTagProps={{
              className: "text-2xs-important !whitespace-pre-wrap",
            }}
          >
            {formattedValue}
          </Prism>
        </div>
      ) : (
        <code
          className={clsx(
            "text-slate-800 text-sm whitespace-pre-wrap mono",
            {
              "inline-block px-1 bg-rose-100 rounded-md text-rose-900":
                formattedValue === "false",
              "inline-block px-1 bg-blue-100 rounded-md text-blue-900":
                formattedValue === "true",
              "inline-block px-1 bg-gray-100 rounded-md text-gray-900":
                formattedValue === "null",
            },
          )}
        >
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
    <div className="FormRoot">
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
          <code
            className={clsx(
              "text-slate-800 text-sm whitespace-pre-wrap mono",
              {
                "inline-block px-1 bg-rose-100 rounded-md text-rose-900":
                  editedValue === false,
                "inline-block px-1 bg-blue-100 rounded-md text-blue-900":
                  editedValue === true,
              },
            )}
          >
            {JSON.stringify(editedValue)}
          </code>
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
  const evaluatedFeature = evaluatedFeatures?.[fid];
  const isForced = forcedFeatures ? fid in forcedFeatures : false;
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

  return {
    fid,
    feature,
    valueType,
    meta,
    evaluatedFeature,
    isForced,
  };
}
