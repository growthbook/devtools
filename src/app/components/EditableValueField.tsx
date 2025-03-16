import clsx from "clsx";
import React, { useEffect, useState } from "react";
import ValueField, { ValueType } from "./ValueField";
import { Button, RadioGroup, Link, DropdownMenu } from "@radix-ui/themes";
import TextareaAutosize from "react-textarea-autosize";
import { PiCaretDownFill, PiPencilSimple } from "react-icons/pi";

export default function EditableValueField({
  value,
  setValue,
  valueType = "string",
}: {
  value: any;
  setValue: (v: any) => void;
  valueType?: ValueType;
}) {
  const [forcedValueType, setForcedValueType] = useState<ValueType>(valueType);
  const formattedValue =
    forcedValueType === "json" ? JSON.stringify(value, null, 2) : value;
  const [editedValue, setEditedValue] = useState<any>(formattedValue);
  const [textareaError, setTextareaError] = useState(false);
  const [editing, setEditing] = useState(
    valueType !== "json" && value !== null && value !== undefined,
  );
  const [dirty, setDirty] = useState(false);

  // try to infer sensible type when type is "unknown"
  useEffect(() => {
    if (valueType === "unknown") {
      if (value === null || value === undefined) {
        setForcedValueType("json");
      } else {
        let vt = (typeof (value ?? "string") as ValueType) || "object";
        // @ts-ignore
        if (vt === "object") {
          vt = "json";
        }
        setForcedValueType(vt);
      }
    }
  }, []);

  useEffect(() => {
    if (valueType) {
      setForcedValueType(valueType);
      if (valueType !== "json" && valueType !== "unknown") {
        setEditing(true);
      }
    }
  }, [valueType]);

  useEffect(() => {
    if (!editing) {
      setEditedValue(formattedValue);
    }
  }, [value]);

  useEffect(() => {
    setEditedValue(formattedValue);
    setTextareaError(false);
  }, [forcedValueType]);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let newValue: any;
    if (forcedValueType === "json") {
      try {
        newValue = JSON.parse(editedValue);
      } catch (e) {
        setTextareaError(true);
        return;
      }
    } else if (forcedValueType === "number") {
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

  if (
    !editing &&
    // deviated, but using a "confirm to edit" type
    ((forcedValueType !== valueType &&
      (forcedValueType === "json" || forcedValueType === "unknown")) ||
      // did not deviate and using a "confirm to edit type" or a nullish value
      (forcedValueType === valueType &&
        (forcedValueType === "json" || value === null || value === undefined)))
  ) {
    return (
      <div>
        <ValueField
          value={value}
          valueType={forcedValueType}
          stringAsCode={false}
        />
        <div className="flex justify-between py-1">
          <ValueTypeWidget
            valueType={valueType}
            forcedValueType={forcedValueType}
            setForcedValueType={setForcedValueType}
          />
          <Link
            href="#"
            size="2"
            role="button"
            className="mt-0.5"
            onClick={() => {
              if (forcedValueType === "unknown") {
                setForcedValueType("string");
              }
              setEditing(true);
            }}
          >
            Edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {forcedValueType === "number" ? (
        <div className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface mb-2">
          <input
            className="rt-reset rt-TextFieldInput"
            type="number"
            value={editedValue}
            onChange={(e) => {
              const v = e.target.value;
              setEditedValue(v);
              setDirty(true);
            }}
          />
        </div>
      ) : forcedValueType === "boolean" ? (
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
        <div
          className={clsx(
            "rt-TextAreaRoot rt-r-size-2 rt-variant-surface mb-2",
            {
              "border border-red-700": textareaError,
            },
          )}
          style={{ minHeight: "unset !important" }}
        >
          <TextareaAutosize
            name={"__JSON_value__"}
            value={editedValue}
            onChange={(e) => {
              const v = e.target.value;
              setEditedValue(v);
              setTextareaError(false);
              setDirty(true);
            }}
            className="rt-reset rt-TextAreaInput mono"
            style={{ fontSize: "12px", lineHeight: "16px", padding: "6px 6px" }}
            maxRows={forcedValueType === "json" ? 10 : 3}
          />
        </div>
      )}

      {forcedValueType !== "boolean" &&
      (dirty || forcedValueType === "json" || forcedValueType === "unknown") ? (
        <div className="flex items-start justify-between">
          <ValueTypeWidget
            valueType={valueType}
            forcedValueType={forcedValueType}
            setForcedValueType={setForcedValueType}
          />
          <div className="flex items-center justify-end gap-3">
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
            <Button type="button" size="2" onClick={submit} disabled={!dirty}>
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <ValueTypeWidget
          valueType={valueType}
          forcedValueType={forcedValueType}
          setForcedValueType={setForcedValueType}
        />
      )}
    </div>
  );
}

function ValueTypeWidget({
  valueType,
  forcedValueType,
  setForcedValueType,
}: {
  valueType: ValueType;
  forcedValueType: ValueType;
  setForcedValueType: (v: ValueType) => void;
}) {
  return (
    <div className="flex gap-2 items-center text-xs mt-0.5 text-gray-a10">
      Type:
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <div className="flex items-center select-none gap-1 text-violet-9 hover:underline decoration-violet-a6 cursor-pointer">
            <span>
              {forcedValueType === "json" ? "JSON" : forcedValueType}
              {forcedValueType !== valueType ? "*" : ""}
            </span>
            <PiCaretDownFill className="text-violet-a9" size={11} />
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Label className="font-semibold uppercase text-gray-a10 py-1 h-auto text-xs">
            Edit value as
          </DropdownMenu.Label>
          <DropdownMenu.Item onSelect={() => setForcedValueType("string")}>
            String
            {valueType === "string" && (
              <span className="ml-1 text-xs text-gray-9">(default)</span>
            )}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setForcedValueType("number")}>
            Number
            {valueType === "number" && (
              <span className="ml-1 text-xs text-gray-9">(default)</span>
            )}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setForcedValueType("boolean")}>
            Boolean
            {valueType === "boolean" && (
              <span className="ml-1 text-xs text-gray-9">(default)</span>
            )}
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setForcedValueType("json")}>
            JSON
            {valueType === "json" && (
              <span className="ml-1 text-xs text-gray-9">(default)</span>
            )}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}
