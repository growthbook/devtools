import React, {ReactNode} from "react";
import {ConditionInterface, FeatureDefinition, FeatureRule, ParentConditionInterface} from "@growthbook/growthbook";
import {upperFirst} from "lodash";
import {ValueField, ValueType} from "@/app/components/FeaturesTab";
import {Link, Progress} from "@radix-ui/themes";
import useTabState from "@/app/hooks/useTabState";
import {PiFlagFill} from "react-icons/pi";

type RuleType = "force" | "rollout" | "experiment" | "prerequisite";

export default function Rule({
  rule,
  i,
  fid,
  feature,
  valueType = "string",
}: {
  rule: FeatureRule;
  i: number;
  fid: string;
  feature: FeatureDefinition;
  valueType?: ValueType;
}) {
  const { condition, parentConditions, force, variations, weights, hashAttribute, coverage, ...other } = rule;
  const key = rule.key ?? fid;
  let ruleType: RuleType =
    rule.variations ? "experiment"
    : "coverage" in rule ? "rollout"
    : rule?.parentConditions?.some((p) => p.gate) ? "prerequisite"
    : "force";
  const ruleName = upperFirst(ruleType) + " rule";

  return (
    <div className="rule">
      <div className="bg-slate-4 text-xs -mt-0.5 px-1 py-0.5 rounded-full mr-2 flex-shrink-0">{i+1}</div>
      <div className="w-full">
        <div className="text-sm font-bold mb-2">{ruleName}</div>
        <div className="my-2 text-xs">
          <ConditionDisplay
            condition={rule.condition}
            parentConditions={rule.parentConditions}
          />
        </div>
        {ruleType === "rollout" && (
          <>
            <div className="mt-2 text-xs">
              <span className="font-semibold">SAMPLE</span>
              {" "}users by{" "}
              <span className="conditionValue">{hashAttribute}</span>
            </div>
            <div className="mt-1 mb-2 flex items-center gap-3 text-xs">
              <span className="font-semibold flex-shrink-0">ROLLOUT</span>
              <Progress size="3" style={{width: 100}} value={(rule.coverage || 0) * 100}/>
              <span className="conditionValue flex-shrink-0">{(rule.coverage || 0) * 100}%</span>
            </div>
          </>
          )}
        {"force" in rule ? (
          <div className="my-2 text-xs">
            <span className="mr-2 font-semibold">SERVE</span>
            <ValueField
              value={rule.force}
              valueType={valueType}
              maxHeight={60}
              customPrismStyle={{ padding: "2px" }}
              customPrismOuterStyle={{ marginTop: "2px" }}
              customBooleanStyle={{ marginTop: "5px", fontSize: "12px", display: "inline-block" }}
              stringAsCode={false}
              formatDefaultTypeAsConditionValue={true}
            />
          </div>
        ): null}
      </div>
    </div>
  )
}

export function ConditionDisplay({
  condition,
  parentConditions,
}: {
  condition?: ConditionInterface;
  parentConditions?: ParentConditionInterface[];
}) {
  const [selectedFid, setSelectedFid] = useTabState<string | undefined>(
    "selectedFid",
    undefined,
  );

  const conditionJson = condition ? JSON.stringify(condition) : undefined;
  let conds = (conditionJson ? jsonToConds(conditionJson) : []) ?? [];
  parentConditions?.forEach((p) => {
    const pConditionJson = p.condition ? JSON.stringify(p.condition) : undefined;
    let pConds = (pConditionJson ? jsonToConds(pConditionJson) : []) ?? [];
    if (!pConds.length) return;
    conds.push(...pConds.map((pc) => ({ ...pc, field: p.id, prereq: true })));
  });
  if (!conds.length) return null;
  return (
    <>
      {conds.map((cond, i) => (
        <div className="condition">
          {i === 0 && (<span className="mr-2 font-semibold">IF</span>)}
          {i > 0 && (<span className="mr-2 font-semibold">AND</span>)}
          <span className="conditionValue">
            {cond.prereq ? (
                <Link size="1" role="button" href="#" onClick={(e) => {
                  e.preventDefault();
                  setSelectedFid(cond.field);
                }}>
                  <PiFlagFill className="inline-block mr-0.5" size={12} />
                  {cond.field}
                </Link>
            ) : cond.field}
          </span>
          <span className="conditionOperator">
            {operatorToText(cond.operator)}
          </span>
          {"value" in cond ? (
            <span className="conditionValue">
              {cond.value}
            </span>
          ) : null }
        </div>
      ))}
    </>
  )
  // if (condition) {
  //   // Could not parse into simple conditions
  //   if (conds === null) {
  //     parts.push(
  //       <ValueField value={condition} maxHeight={50} />
  //     );
  //   } else {
  //     const conditionParts = getConditionParts({
  //       conditions: conds,
  //       savedGroups,
  //       keyPrefix: `${partId++}-condition-`,
  //     });
  //     parts.push(...conditionParts);
  //   }
  // }
}



export interface Condition {
  field: string;
  operator: string;
  value?: string;
  prereq?: boolean;
}

export function jsonToConds(
  json: string,
): null | Condition[] {
  if (!json || json === "{}") return [];
  // Advanced use case where we can't use the simple editor
  if (json.match(/\$(or|nor|all|type)/)) return null;

  try {
    const parsed = JSON.parse(json);
    if (parsed["$not"]) return null;

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
          if (v.some((str: any) => typeof str === "string" && str.includes(","))) {
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
