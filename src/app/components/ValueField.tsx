import clsx from "clsx";
import { PiCircleFill } from "react-icons/pi";
import React, { CSSProperties } from "react";
import { Prism } from "react-syntax-highlighter";
import {
  ghcolors as codeThemeLight,
  a11yDark as codeThemeDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import useGlobalState from "@/app/hooks/useGlobalState";

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
  jsonStringifySpaces = 2,
  maxHeight = 120,
  customPrismStyle,
  customPrismOuterStyle,
  customBooleanStyle,
  stringAsCode = true,
  formatDefaultTypeAsConditionValue = false,
}: {
  value: any;
  valueType?: ValueType;
  jsonStringifySpaces?: number;
  maxHeight?: string | number | null;
  customPrismStyle?: CSSProperties;
  customPrismOuterStyle?: CSSProperties;
  customBooleanStyle?: CSSProperties;
  stringAsCode?: boolean;
  formatDefaultTypeAsConditionValue?: boolean;
}) {
  const [dark, setDark] = useGlobalState("dark", false, true);

  const formattedValue =
    value !== undefined
      ? JSON.stringify(value, null, jsonStringifySpaces)
      : "null";

  return (
    <>
      {(stringAsCode ? ["json", "string"] : ["json"]).includes(valueType) ? (
        <div
          className="bg-field border border-gray-a3 rounded-md"
          style={customPrismOuterStyle}
        >
          <Prism
            language="json"
            style={!dark ? codeThemeLight : codeThemeDark}
            customStyle={{
              ...customTheme,
              maxHeight: maxHeight ?? undefined,
              ...customPrismStyle,
              background: "unset",
              backgroundColor: "unset",
              fontFamily: `Consolas, "Bitstream Vera Sans Mono", "Courier New", Courier, monospace`,
              fontSize: "0.9em",
              lineHeight: "12px",
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
                "text-gray-a7": formattedValue === "false",
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
        <code className="text-gray-a10 text-sm whitespace-pre-wrap">
          {formattedValue}
        </code>
      )}
    </>
  );
}
