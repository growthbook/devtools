import clsx from "clsx";
import { PiCircleFill } from "react-icons/pi";
import React, { CSSProperties } from "react";
import { Prism } from "react-syntax-highlighter";
import { ghcolors as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

export type ValueType = "string" | "number" | "boolean" | "json";

const customTheme = {
  padding: "5px",
  margin: 0,
  border: "0px none",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  lineHeight: "12px",
};

export default function ValueField({
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
              ...customPrismStyle,
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
