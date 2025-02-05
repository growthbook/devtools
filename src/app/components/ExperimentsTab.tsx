import React, {useEffect, useRef, useState} from "react";
import {AutoExperiment, Experiment, FeatureDefinition} from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGBSandboxEval, {
  EvaluatedExperiment,
} from "@/app/hooks/useGBSandboxEval";
import {Avatar, Select, Switch} from "@radix-ui/themes";
import {PiFlaskBold, PiWarningBold, PiWarningCircle, PiWarningCircleBold} from "react-icons/pi";
import clsx from "clsx";
import {Prism} from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
import {FaBucket} from "react-icons/fa6";
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
  const [features, setFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("features", {});
  const featureExperiments = getFeatureExperiments(features);

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
      experiments: [...experiments, ...featureExperiments],
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

  // load & scroll animations
  const [firstLoad, setFirstLoad] = useState(true);
  useEffect(() => {
    window.setTimeout(() => setFirstLoad(false), 100);
  }, []);
  useEffect(() => {
    if (selectedEid) {
      const el = document.querySelector(`#experimentsTab_experimentList_${selectedEid}`);
      el?.scrollIntoView({ behavior: firstLoad ? 'instant' : 'smooth' });
    }
  }, [selectedEid]);

  return (
    <>
      <div className="max-w-[900px] mx-auto">
        <div className="w-[50%] max-w-[450px] pr-2">
          <div className="label lg mb-2">Experiments</div>
          {experiments.map((experiment, i) => {
            const eid = experiment.key;
            const {meta, evaluatedExperiment, isForced} =
              getExperimentDetails({
                eid,
                experiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

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
                        <PiFlaskBold/>
                      </span>
                    }
                  />
                  <code className="text-xs text-gray-800">{eid}</code>
                  <div className="flex-1"/>
                  <div className="flex items-center gap-1 text-sm mr-1">
                    <FaBucket size={9}/>
                    {value}
                  </div>
                </div>
                {isForced && (
                  <div
                    className="pointer-events-none absolute top-[-6px] right-[-12px] px-1 bg-white shadow-sm rounded-md text-2xs mr-1 font-bold uppercase text-amber-600">
                    Override
                  </div>
                )}
              </div>
            );
          })}

          <div className="label lg mb-2">Feature Flag Experiments</div>
          {featureExperiments.map((experiment, i) => {
            const eid = experiment.key;
            const {meta, evaluatedExperiment, isForced} =
              getExperimentDetails({
                eid,
                experiments: featureExperiments,
                evaluatedExperiments,
                forcedVariations,
              });
            const value = evaluatedExperiment?.result?.variationId ?? 0;

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
                        <PiFlaskBold/>
                      </span>
                    }
                  />
                  <code className="text-xs text-gray-800">{eid}</code>
                  <div className="flex-1"/>
                  <div className="flex items-center gap-1 text-sm mr-1">
                    <FaBucket size={9}/>
                    {value}
                  </div>
                </div>
                {isForced && (
                  <div
                    className="pointer-events-none absolute top-[-6px] right-[-12px] px-1 bg-white shadow-sm rounded-md text-2xs mr-1 font-bold uppercase text-amber-600">
                    Override
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="w-[50%] max-w-[450px] overflow-y-auto pl-1 pr-3 py-2 fixed left-[50%]"
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
                    {overrideExperiment && (
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
                    selectedExperiment.experiment ? (
                      <EditableValueField
                        experiment={selectedExperiment.experiment}
                        value={forcedVariations?.[selectedEid] || 0}
                        evaluatedValue={selectedExperiment?.evaluatedExperiment?.result?.variationId}
                        setValue={(v) => {
                          setForcedVariation(selectedEid, v);
                          setOverrideExperiment(true);
                        }}
                      />
                    ) : (
                      <ValueField
                        value={selectedExperiment?.evaluatedExperiment?.result?.variationId ?? ""}
                        valueType={selectedExperiment?.valueType}
                      />
                    )}
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
                    {JSON.stringify(selectedExperiment.experiment, null, 2)}
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
  valueType = "number",
}: {
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
            customStyle={{...customTheme, maxHeight: 120 }}
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
  experiment,
  value,
  evaluatedValue,
  setValue,
}:{
  experiment: AutoExperiment;
  value?: number;
  evaluatedValue?: number;
  setValue: (v: any) => void;
}) {
  let variationsMeta: { key?: string; name?: string; }[] = experiment.meta ??
    experiment.variations.map((variation, i) => ({
      key: i+""
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
            <Select.Item key={meta.key} value={i+""}>
              {i} {meta?.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
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
  experiments: (AutoExperiment | Experiment<any>)[];
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

export function getFeatureExperiments(features: Record<string, FeatureDefinition>) {
  const experiments: (Experiment<any>)[] = [];
  for (const fid in features) {
    const feature = features[fid];
    for (const rule of feature.rules || []) {
      if (rule.variations) {
        // @ts-ignore
        experiments.push({
          key: rule.key ?? fid,
          ...rule,
        });
      }
    }
  }
  return experiments;
}
