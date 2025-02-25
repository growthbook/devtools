import React, { useMemo, useState } from "react";
import {
  ConditionInterface,
  FeatureRule,
  ParentConditionInterface,
} from "@growthbook/growthbook";
import { upperFirst } from "lodash";
import ValueField, { ValueType } from "@/app/components/ValueField";
import { Checkbox, Link, Progress } from "@radix-ui/themes";
import useTabState from "@/app/hooks/useTabState";
import { PiFlagFill, PiFlaskFill } from "react-icons/pi";
import { EvaluatedFeature } from "@/app/hooks/useGBSandboxEval";
import { DebugLog } from "devtools";
import DebugLogger from "@/app/components/DebugLogger";
import useGlobalState from "@/app/hooks/useGlobalState";
import {isDark} from "@/app";

type RuleType = "force" | "rollout" | "experiment" | "prerequisite";

const RULE_MATCHED_LOGS = [
  "Force",
  "In experiment", // should also have `ctx.variation` set
];
export const RULE_GATES_LOGS = ["Feature blocked"];
export const RULE_FORCED_LOGS = ["Global override", "Force variation"];
export const USE_PREVIOUS_LOG_IF_MATCH = "Use default value"; // last rule
export const GLOBAL_OVERRIDE = "Global override"; // FF override

export default function Rule({
  rule,
  rules,
  i,
  fid,
  valueType = "string",
  evaluatedFeature,
  hideInactive = false,
}: {
  rule: FeatureRule;
  rules: FeatureRule[];
  i: number;
  fid: string;
  valueType?: ValueType;
  evaluatedFeature?: EvaluatedFeature;
  hideInactive?: boolean;
}) {
  const [selectedEid, setSelectedEid] = useTabState<string | undefined>(
    "selectedEid",
    undefined,
  );
  const [selectedChangeId, setSelectedChangeId] = useTabState<
    string | undefined
  >("selectedChangeId", undefined);
  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [jsonMode, setJsonMode] = useState(false);

  const debug = evaluatedFeature?.debug || [];
  const debugForRule = useMemo(() => {
    const d: DebugLog[] = [];
    let r = 0; // current parent rule number
    debug.forEach((item, itemNo) => {
      const nextItem = debug?.[itemNo+1];
      // Skip tracking callbacks
      // if (item?.[0].startsWith("Tracking callback")) return;
      // If the log id matches our feature's id, assume we can rely on the log's
      // rule number (i).
      if (item?.[1]?.id === fid && item?.[1]?.rule?.i !== undefined) {
        r = item[1].rule.i as number;
      }
      // Probably an experiment rule (no rule, has id, id doesn't match),
      // assume this log belongs to current feature's next rule.
      if (
        !item?.[1]?.rule &&
        item?.[1]?.id &&
        item[1].id !== fid &&
        itemNo > 0 &&
        // these get lumped in the wrong rule otherwise
        !nextItem?.[0]?.startsWith("Skip rule because prerequisite") &&
        !nextItem?.[0]?.startsWith("Feature blocked")
      ) {
        r++;
      }
      if (r === i) {
        d.push(item);
      }
    });
    return d;
  }, [fid, i, debug]);

  let status: "skipped" | "unreachable" | "matches" | "gates" | "overridden" =
    "skipped";

  let lastDebugIndex = debugForRule.length - 1;
  if (debugForRule?.[lastDebugIndex]?.[0] === USE_PREVIOUS_LOG_IF_MATCH) {
    lastDebugIndex--;
  }
  if (debugForRule?.[lastDebugIndex]?.[0] === GLOBAL_OVERRIDE) {
    lastDebugIndex--;
  }
  const lastDebug = debugForRule?.[lastDebugIndex];
  if (!lastDebug?.[0]) {
    status = "unreachable";
  } else if (RULE_MATCHED_LOGS.some((log) => lastDebug[0].startsWith(log))) {
    status = "matches";
  } else if (RULE_GATES_LOGS.some((log) => lastDebug[0].startsWith(log))) {
    status = "gates";
  } else if (RULE_FORCED_LOGS.some((log) => lastDebug[0].startsWith(log))) {
    status = "overridden";
  }

  if (
    hideInactive &&
    !(status === "matches" || status === "overridden" || status === "gates")
  ) {
    return null;
  }

  const {
    condition,
    parentConditions,
    force,
    variations,
    weights,
    hashAttribute,
    coverage,
    namespace,
  } = rule;
  const key = rule.key ?? fid;
  let ruleType: RuleType = variations
    ? "experiment"
    : "coverage" in rule
      ? "rollout"
      : rule?.parentConditions?.some((p) => p.gate)
        ? "prerequisite"
        : "force";
  const ruleName = upperFirst(ruleType) + " rule";

  return (
    <div className={`rule ${status}`}>
      <div className="inner">
        <div className="bg-gray-6 text-xs -mt-0.5 px-1 py-0.5 rounded-full mr-2 flex-shrink-0">
          {i + 1}
        </div>
        <div className="w-full">
          <div className="mb-3">
            <div className="flex items-start">
              <div className="flex-1 text-sm font-bold">
                {ruleName}
                <div className="inline-block ml-3 status capitalize font-normal text-2xs px-1.5 py-0.5 rounded-md">
                  {status}
                </div>
              </div>
              <label className="flex-shrink-0 flex items-center text-2xs cursor-pointer select-none">
                <Checkbox
                  checked={jsonMode}
                  onCheckedChange={(v) => setJsonMode(!jsonMode)}
                  size="1"
                  mr="1"
                  className="cursor-pointer"
                />
                <span>View JSON</span>
              </label>
            </div>
            {ruleType === "experiment" && (
              <Link
                size="1"
                role="button"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedEid(key);
                  setSelectedChangeId(undefined);
                  setCurrentTab("experiments");
                }}
              >
                <PiFlaskFill className="inline-block mr-0.5" size={12} />
                {key}
              </Link>
            )}
          </div>
          {!jsonMode && (
            <>
              {condition || parentConditions ? (
                <div className="my-2 text-xs">
                  <ConditionDisplay
                    condition={condition}
                    parentConditions={parentConditions}
                    ruleType={ruleType}
                  />
                </div>
              ) : null}
              {ruleType === "experiment" && (
                <ExperimentRule
                  variations={variations}
                  weights={weights}
                  hashAttribute={hashAttribute}
                  coverage={coverage}
                  namespace={namespace}
                  valueType={valueType}
                />
              )}
              {ruleType === "rollout" && (
                <>
                  <div className="mt-2 text-xs">
                    <span className="font-semibold">SAMPLE</span> users by{" "}
                    <span className="conditionValue">{hashAttribute}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="font-semibold flex-shrink-0">ROLLOUT</span>
                    <Progress
                      size="3"
                      radius="small"
                      value={(coverage || 0) * 100}
                    />
                    <span className="conditionValue flex-shrink-0 py-0.5">
                      {(coverage || 0) * 100}%
                    </span>
                  </div>
                </>
              )}
              {"force" in rule ? (
                <div className="my-2 text-xs">
                  <span className="mr-2 font-semibold">SERVE</span>
                  <ValueField
                    value={force}
                    valueType={valueType}
                    maxHeight={60}
                    customPrismStyle={{ padding: "2px" }}
                    customPrismOuterStyle={{ marginTop: "2px" }}
                    customBooleanStyle={{
                      marginTop: "5px",
                      fontSize: "12px",
                      display: "inline-block",
                    }}
                    stringAsCode={false}
                    formatDefaultTypeAsConditionValue={true}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
      {jsonMode && (
        <ValueField
          value={rule}
          valueType="json"
          customPrismOuterStyle={{
            marginBottom: 8,
          }}
        />
      )}
      <div className="pt-1 border-t border-t-gray-a6">
        <DebugLogger startCollapsed={true} logs={debugForRule} />
      </div>
    </div>
  );
}

export function ExperimentRule({
  variations,
  weights,
  hashAttribute,
  coverage,
  namespace,
  valueType = "number",
}: {
  variations?: any[];
  weights?: number[];
  hashAttribute?: string;
  coverage?: number;
  namespace?: [string, number, number] | undefined;
  valueType?: ValueType;
}) {
  const [dark] = useGlobalState("dark", false, true);

  let appliedCoverage = coverage;
  let nsRange: number | undefined;
  if (namespace) {
    nsRange = (namespace[2] ?? 0) - (namespace[1] ?? 0);
    appliedCoverage = (coverage ?? 1) * nsRange;
  }

  return (
    <div className="condition">
      <div className="mt-2 text-xs">
        <span className="font-semibold">SPLIT</span> users by{" "}
        <span className="conditionValue">{hashAttribute}</span>
        {namespace && (
          <>
            {" "}
            in namespace{" "}
            <span className="conditionValue inline-block flex-shrink-0 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[70px] leading-4 align-middle">
              {namespace[0]}
            </span>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="font-semibold flex-shrink-0">INCLUDE</span>
        <Progress
          size="3"
          radius="small"
          value={(appliedCoverage || 0) * 100}
        />
        <span className="conditionValue flex-shrink-0">
          {Math.round((appliedCoverage || 0) * 1000) / 10}%
        </span>
      </div>
      {nsRange ? (
        <div className="leading-3 text-gray-11">
          ({nsRange * 100}% namespace, {(coverage ?? 1) * 100}% exposure)
        </div>
      ) : null}
      <div className="my-2 text-xs">
        <div className="font-semibold mb-1">SERVE</div>
        <table className="leading-3">
          <tbody>
            {variations?.map?.((variation, i) => (
              <tr key={i}>
                <td className="pr-2 py-1">
                  <div
                    className="px-0.5 rounded-full border font-semibold"
                    style={{
                      fontSize: "11px",
                      color: getVariationColor(i),
                      borderColor: getVariationColor(i),
                    }}
                  >
                    {i}
                  </div>
                </td>
                <td width="100%" className="py-1">
                  <ValueField
                    value={variation}
                    valueType={valueType}
                    stringAsCode
                    maxHeight={50}
                  />
                </td>
                <td className="pl-2 py-1">
                  {weights?.[i] !== undefined
                    ? Math.round(weights[i] * 1000) / 10 + "%"
                    : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          className="rt-ProgressRoot rt-r-size-3 rt-variant-surface flex overflow-hidden h-[15px] mt-2"
          data-radius="small"
        >
          {weights?.map((w, i) => (
            <div
              key={i}
              className="rt-ProgressIndicator relative"
              style={{
                // @ts-expect-error css var
                "--progress-value": 100,
                "--accent-track": getVariationColor(i),
                width: w * (appliedCoverage ?? 1) * 100 + "%",
                borderLeft: "0.5px solid #fff6",
                borderRight: "0.5px solid #fff6",
                boxSizing: "border-box",
                filter: dark ? "saturate(0.7)" : undefined,
              }}
            >
              {w * (appliedCoverage ?? 1) >= 0.15 && (
                <div
                  className="text-2xs font-bold relative top-[2px] left-[2px] z-center text-white"
                  style={{
                    textShadow: "0 1px #0006, 0 0 1px #000, 0 0 2px #000",
                  }}
                >
                  {Math.round(w * (appliedCoverage ?? 1) * 1000) / 10}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConditionDisplay({
  condition,
  parentConditions,
  ruleType,
}: {
  condition?: ConditionInterface;
  parentConditions?: ParentConditionInterface[];
  ruleType?: RuleType;
}) {
  const [selectedFid, setSelectedFid] = useTabState<string | undefined>(
    "selectedFid",
    undefined,
  );

  const conditionJson = condition ? JSON.stringify(condition) : undefined;
  let conds = (conditionJson ? jsonToConds(conditionJson) : []) ?? [];
  parentConditions?.forEach((p) => {
    const pConditionJson = p.condition
      ? JSON.stringify(p.condition)
      : undefined;
    let pConds = (pConditionJson ? jsonToConds(pConditionJson) : []) ?? [];
    if (!pConds.length) return;
    conds.push(...pConds.map((pc) => ({ ...pc, field: p.id, prereq: true })));
  });
  if (!conds.length)
    return (
      <div>
        <div className="mr-2 font-semibold mb-0.5">IF</div>
        <ValueField
          value={parentConditions ? { condition, parentConditions } : condition}
          valueType="json"
          maxHeight={80}
          customPrismOuterStyle={{
            width: "calc(100% - 10px)",
            marginRight: -60,
          }}
        />
      </div>
    );
  return (
    <>
      {conds.map((cond, i) => (
        <div className="condition" key={i}>
          {i === 0 && <span className="mr-2 font-semibold">IF</span>}
          {i > 0 && <span className="mr-2 font-semibold">AND</span>}
          <span className="conditionValue">
            {cond.prereq ? (
              <Link
                size="1"
                role="button"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedFid(cond.field);
                }}
              >
                <PiFlagFill className="inline-block mr-0.5" size={12} />
                {cond.field}
              </Link>
            ) : (
              cond.field
            )}
          </span>
          <span className="conditionOperator">
            {operatorToText(cond.operator)}
          </span>
          {"value" in cond ? (
            <span className="conditionValue">{cond.value}</span>
          ) : null}
        </div>
      ))}
      {ruleType === "prerequisite" && (
        <div className="condition mt-2" key="continue">
          <span className="mr-2 font-semibold">CONTINUE</span>
        </div>
      )}
    </>
  );
}

export interface Condition {
  field: string;
  operator: string;
  value?: string;
  prereq?: boolean;
}

export function jsonToConds(json: string): null | Condition[] {
  if (!json || json === "{}") return [];
  // Advanced use case where we can't use the simple editor
  if (json.match(/\$(or|nor|all|type)/)) return null;

  try {
    const _parsed = JSON.parse(json);
    if (_parsed["$not"]) return null;

    // quick pass to break out $and (saved groups and simple logic)
    const parsed: any = {};
    try {
      Object.keys(_parsed).forEach((field) => {
        const value = _parsed[field];
        if (field === "$and" && Array.isArray(value)) {
          value.forEach((o: any) => {
            if (o["$not"]) throw new Error("invalid nested condition");
            Object.keys(o).forEach((k) => {
              parsed[k] = o[k];
            });
          });
        } else {
          parsed[field] = value;
        }
      });
    } catch (e) {
      return null;
    }

    const conds: Condition[] = [];
    let valid = true;

    Object.keys(parsed).forEach((field) => {
      const value = parsed[field];
      if (Array.isArray(value)) {
        valid = false;
        return;
      }

      if (typeof value !== "object") {
        if (value === true || value === false) {
          return conds.push({
            field,
            operator: value ? "$true" : "$false",
          });
        }

        return conds.push({
          field,
          operator: "$eq",
          value: value + "",
        });
      }
      Object.keys(value).forEach((operator) => {
        const v: any = value[operator];

        if (operator === "$in" || operator === "$nin") {
          if (
            v.some((str: any) => typeof str === "string" && str.includes(","))
          ) {
            valid = false;
            return;
          }
          return conds.push({
            field,
            operator,
            value: v.join(", "),
          });
        }

        if (operator === "$elemMatch") {
          if (typeof v === "object" && Object.keys(v).length === 1) {
            if ("$eq" in v && typeof v["$eq"] !== "object") {
              return conds.push({
                field,
                operator: "$includes",
                value: v["$eq"] + "",
              });
            }
          }
          valid = false;
          return;
        }

        if (operator === "$not") {
          if (typeof v === "object" && Object.keys(v).length === 1) {
            if ("$regex" in v && typeof v["$regex"] === "string") {
              return conds.push({
                field,
                operator: "$notRegex",
                value: v["$regex"],
              });
            }
            if ("$elemMatch" in v) {
              const m = v["$elemMatch"];
              if (typeof m === "object" && Object.keys(m).length === 1) {
                if ("$eq" in m && typeof m["$eq"] !== "object") {
                  return conds.push({
                    field,
                    operator: "$notIncludes",
                    value: m["$eq"] + "",
                  });
                }
              }
            }
          }
        }

        if (operator === "$size") {
          if (v === 0) {
            return conds.push({
              field,
              operator: "$empty",
            });
          }
          if (typeof v === "object" && Object.keys(v).length === 1) {
            if ("$gt" in v && v["$gt"] === 0) {
              return conds.push({
                field,
                operator: "$notEmpty",
              });
            }
          }
        }

        if (Array.isArray(v) || (v && typeof v === "object")) {
          valid = false;
          return;
        }

        if (operator === "$exists") {
          return conds.push({
            field,
            operator: v ? "$exists" : "$notExists",
          });
        }
        if (operator === "$eq" && (v === true || v === false)) {
          return conds.push({
            field,
            operator: v ? "$true" : "$false",
          });
        }
        if (operator === "$ne" && (v === true || v === false)) {
          return conds.push({
            field,
            operator: v ? "$false" : "$true",
          });
        }

        if (
          [
            "$eq",
            "$ne",
            "$gt",
            "$gte",
            "$lt",
            "$lte",
            "$regex",
            "$veq",
            "$vne",
            "$vgt",
            "$vgte",
            "$vlt",
            "$vlte",
          ].includes(operator) &&
          typeof v !== "object"
        ) {
          return conds.push({
            field,
            operator,
            value: v + "",
          });
        }

        if (
          (operator === "$inGroup" || operator === "$notInGroup") &&
          typeof v === "string"
        ) {
          return conds.push({
            field,
            operator,
            value: v,
          });
        }
        valid = false;
      });
    });
    if (!valid) return null;
    return conds;
  } catch (e) {
    return null;
  }
}

function operatorToText(operator: string, isPrerequisite?: boolean): string {
  switch (operator) {
    case "$eq":
    case "$veq":
      return `＝`;
    case "$ne":
    case "$vne":
      return `≠`;
    case "$includes":
      return `includes`;
    case "$notIncludes":
      return `does not include`;
    case "$empty":
      return `is empty`;
    case "$notEmpty":
      return `is not empty`;
    case "$lt":
    case "$vlt":
      return `<`;
    case "$lte":
    case "$vlte":
      return `<=`;
    case "$gt":
    case "$vgt":
      return `>`;
    case "$gte":
    case "$vgte":
      return `≥`;
    case "$exists":
      return isPrerequisite ? `is live` : `is not NULL`;
    case "$notExists":
      return isPrerequisite ? `is not live` : `is NULL`;
    case "$in":
      return `is in`;
    case "$nin":
      return `is not in`;
    case "$inGroup":
      return `is in group`;
    case "$notInGroup":
      return `is not in group`;
    case "$true":
      return "is TRUE";
    case "$false":
      return "is FALSE";
    case "$regex":
      return `matches`;
    case "$notRegex":
      return `does not match`;
  }
  return operator;
}

export function getVariationColor(i: number) {
  const colors = [
    "var(--blue-10)",
    "var(--teal-10)",
    "var(--orange-10)",
    "var(--pink-10)",
    "var(--amber-10)",
    "var(--mint-10)",
    "var(--lime-11)",
    "var(--cyan-10)",
    "var(--red-10)",
  ];
  return colors[i % colors.length];
}
