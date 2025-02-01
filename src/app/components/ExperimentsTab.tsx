import React, {useEffect, useState} from "react";
import {AutoExperiment, FeatureDefinition} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedExperiment,
  EvaluatedFeature,
} from "@/app/hooks/useGBSandboxEval";
import {Avatar, Button, Link, Switch} from "@radix-ui/themes";
import { PiFlagBold, PiFlaskBold } from "react-icons/pi";
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

export default function ExperimentsTab() {
  const [experiments, setExperiments] = useTabState<
    AutoExperiment[]
  >("experiments", []);
  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const { evaluatedExperiments } = useGBSandboxEval();

  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );
  const selectedExperiment = selectedEid
    ? getExperimentDetails({
      eid: selectedEid,
      experiments,
      evaluatedExperiments,
      forcedVariations,
    })
    : undefined;

  const [overrideExperiment, setOverrideExperiment] = useState(false);

  const clickExperiment = (eid: string) =>
    setSelectedEid(selectedEid !== eid ? eid : undefined);

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
  }

  useEffect(() => {
    if (selectedEid) {
      if (selectedEid in forcedVariations) {
        setOverrideExperiment(true);
      } else {
        setOverrideExperiment(false);
      }
    }
  }, [selectedEid, JSON.stringify(forcedVariations)]);

  useEffect(() => {
    if (selectedEid) {
      const el = document.querySelector(`#experimentsTab_experimentList_${selectedEid}`);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedEid]);

  return (
    <>
      <div className="flex justify-between items-top">
        <div className="w-[50%] pr-2">
          <div className="label lg mb-2">Experiments</div>
          {experiments.map((experiment, i) => {
            const eid = experiment.key;
            const { meta, evaluatedExperiment, isForced } =
              getExperimentDetails({
                eid,
                experiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const valueStr = evaluatedExperiment?.result
              ? JSON.stringify(evaluatedExperiment.result?.variationId)
              : "null";
            return (
              <div
                id={`experimentsTab_experimentList_${eid}`}
                key={eid}
                className={clsx("featureCard relative mb-2", {
                  selected: selectedEid === eid,
                })}
                onClick={() => clickExperiment(eid)}
              >
                <div className="flex gap-2 items-center">
                  <Avatar
                    color={isForced ? "amber" : undefined}
                    variant={isForced ? "solid" : "soft"}
                    size="1"
                    radius="full"
                    fallback={
                      <span className={isForced ? "text-amber-800" : undefined}>
                        <PiFlaskBold />
                      </span>
                    }
                  />
                  <code className="text-xs text-gray-800">{eid}</code>
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
          {!!selectedEid && !!selectedExperiment && (
            <div key={`selected_${selectedEid}`}>
              <div className="flex items-center gap-2 mb-1">
                <Avatar size="2" radius="full" fallback={<PiFlaskBold />} />
                <h2 className="font-bold">{selectedEid}</h2>
              </div>

              <div className="box">
                <div className="my-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="label">Current value</div>
                    {
                      // @ts-ignore
                      !(selectedExperiment?.valueType === "boolean" && !overrideExperiment) && (
                      <label className="flex items-center cursor-pointer select-none">
                        <span className={clsx("text-xs mr-1 font-bold uppercase", {
                          "text-amber-600": overrideExperiment,
                          "text-gray-600": !overrideExperiment,
                        })}>Override</span>
                        <Switch
                          radius="small"
                          color="amber"
                          checked={overrideExperiment}
                          onCheckedChange={(v) => {
                            setOverrideExperiment(v);
                            if (!v) unsetForcedVariation(selectedEid);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {
                    // @ts-ignore
                    overrideExperiment || selectedExperiment?.valueType === "boolean" ? (
                    <EditableValueField
                      value={selectedExperiment?.evaluatedExperiment?.result?.variationId}
                      setValue={(v) => {
                        setForcedVariation(selectedEid, v);
                        setOverrideExperiment(true);
                      }}
                      valueType={selectedExperiment?.valueType}
                    />
                  ) : (
                    <ValueField
                      value={selectedExperiment?.evaluatedExperiment?.result?.variationId ?? ""}
                      valueType={selectedExperiment?.valueType}
                    />
                  )}
                </div>

                <textarea
                  className="mt-8 w-full h-[400px]"
                  value={JSON.stringify(selectedExperiment.experiment)}
                />
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
  valueType = "number",
}:{
  value: string | number;
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

function getExperimentDetails({
  eid,
  experiments,
  experimentsMeta,
  evaluatedExperiments,
  forcedVariations,
}: {
  eid: string;
  experiments: AutoExperiment[];
  experimentsMeta?: Record<string, any>;
  evaluatedExperiments?: EvaluatedExperiment[];
  forcedVariations?: Record<string, number>;
}) {
  const experiment = experiments.find((experiment) => experiment.key === eid);
  const meta = experimentsMeta?.[eid];
  const evaluatedExperiment = evaluatedExperiments?.find((experiment) => experiment.key === eid);
  const isForced = forcedVariations ? eid in forcedVariations : false;
  // todo: needed?
  let valueType: ValueType = "number";

  return {
    eid,
    experiment,
    valueType,
    meta,
    evaluatedExperiment,
    isForced,
  };
}
