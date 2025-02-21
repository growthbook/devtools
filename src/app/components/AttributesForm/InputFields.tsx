import MultiSelectField from "@/app/components/Forms/MultiSelectField";
import SelectField from "@/app/components/Forms/SelectField";
import { TextField, Switch } from "@radix-ui/themes";
import * as Form from "@radix-ui/react-form";

import React, { useEffect, useState } from "react";
import { time } from "node_modules/framer-motion/dist";
import { set } from "node_modules/@types/lodash";
import { SDKAttribute } from "@/app/tempGbExports";

type Props = {
  attributeKey: string;
  save: (key: string, value: any) => void;
  type: string;
  value: any;
  schema: Record<string, SDKAttribute>;
};
const ARRAY_ATTRIBUTE_TYPES = ["string[]", "number[]", "secureString[]"];
export default function InputFields({
  attributeKey,
  save,
  type,
  value,
  schema,
}: Props) {
  const [isDirty, setDirty] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  useEffect(() => {
    if (!isDirty) {
      setInputValue(value);
    }
  }, [isDirty, value]);
  return (
    <div className="w-full flex items-center">
      <Form.Control asChild>
        {type === "number" ? (
          <TextField.Root
            type="number"
            onChange={(e) => {
              setDirty(true);
              setInputValue(e.target.value);
              timeoutId && clearTimeout(timeoutId);
              setTimeoutId(
                setTimeout(() => {
                  save(attributeKey, parseInt(e.target.value));
                  setDirty(false);
                }, 500),
              );
            }}
            value={parseInt(inputValue)}
            className="w-full"
          />
        ) : type === "boolean" ? (
          <Switch
            size="1"
            className="Switch"
            checked={inputValue}
            onCheckedChange={(v: boolean) => {
              save(attributeKey, v);
            }}
          />
        ) : type === "enum" ? (
          <div className="text-sm w-full">
            <SelectField
              menuPlacement="top"
              value={inputValue}
              options={
                schema[attributeKey].enum?.split(",")?.map((strSegment) => {
                  const trimmed = strSegment.trim();
                  return {
                    value: trimmed,
                    label: trimmed,
                  };
                }) || []
              }
              onChange={(v) => {
                setDirty(true);
                setInputValue(v);
                timeoutId && clearTimeout(timeoutId);
                setTimeoutId(
                  setTimeout(() => {
                    save(attributeKey, v);
                    setDirty(false);
                  }, 500),
                );
              }}
            />
          </div>
        ) : ARRAY_ATTRIBUTE_TYPES.includes(type) ? (
          <div className="text-sm w-full">
            <MultiSelectField
              creatable
              placeholder="Add to list..."
              menuPlacement="top"
              value={inputValue}
              options={(inputValue || [])?.map((entry: string) => ({
                value: entry,
                label: entry,
              }))}
              onChange={(v) => {
                setDirty(true);
                setInputValue(v);
                timeoutId && clearTimeout(timeoutId);
                setTimeoutId(
                  setTimeout(() => {
                    save(
                      attributeKey,
                      type === "number[]" ? v?.map((n) => parseInt(n)) : v,
                    );
                    setDirty(false);
                  }, 500),
                );
              }}
              formatCreateLabel={(input: string) => `Add "${input}"`}
              validOptionPattern={type === "number[]" ? "^\\d+$" : ".+"}
            />
          </div>
        ) : (
          <TextField.Root
            type="text"
            onChange={(e) => {
              setDirty(true);
              setInputValue(e.target.value);
              timeoutId && clearTimeout(timeoutId);
              setTimeoutId(
                setTimeout(() => {
                  save(attributeKey, e.target.value);
                  setDirty(false);
                }, 500),
              );
            }}
            value={inputValue}
            className="w-full"
          />
        )}
      </Form.Control>
    </div>
  );
}
