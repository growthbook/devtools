import clsx from "clsx";
import React, { useEffect, useState } from "react";
import ValueField, { ValueType } from "./ValueField";
import { Button, RadioGroup, Link } from "@radix-ui/themes";
import TextareaAutosize from "react-textarea-autosize";

export default function EditableValueField({
  value,
  setValue,
  valueType = "string",
}: {
  value: any;
  setValue: (v: any) => void;
  valueType?: ValueType;
}) {
  const formattedValue =
    valueType === "json" ? JSON.stringify(value, null, 2) : value;
  const [editedValue, setEditedValue] = useState<any>(formattedValue);
  const [textareaError, setTextareaError] = useState(false);
  const [editing, setEditing] = useState(valueType !== "json");
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!editing) {
      setEditedValue(formattedValue);
    }
  }, [value]);

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
      if (!Number.isFinite(newValue)) newValue = 0;
    } else {
      newValue = editedValue;
    }
    setValue(newValue);
    setDirty(false);
    setEditing(false);
  };

  if (!editing && valueType === "json") {
    return (
      <div>
        <ValueField value={value} valueType={valueType} stringAsCode={false} />
        <div className="flex justify-end py-1">
          <Link
            href="#"
            size="2"
            role="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {valueType === "number" ? (
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
      ) : valueType === "boolean" ? (
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
          className="rt-TextAreaRoot rt-r-size-2 rt-variant-surface mb-2"
          style={{ minHeight: "unset !important" }}
        >
          <TextareaAutosize
            className={clsx("rt-reset rt-TextAreaInput mono", {
              "border-red-700": textareaError,
            })}
            name={"__JSON_value__"}
            value={editedValue}
            onChange={(e) => {
              const v = e.target.value;
              setEditedValue(v);
              setTextareaError(false);
              setDirty(true);
            }}
            style={{ fontSize: "12px", lineHeight: "16px", padding: "6px 6px" }}
            maxRows={valueType === "json" ? 10 : 3}
          />
        </div>
      )}

      {valueType !== "boolean" && (dirty || valueType === "json") && (
        <div className="flex items-center justify-end gap-3">
          {(valueType === "json" || dirty) && (
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
          )}
          <Button type="button" size="2" onClick={submit} disabled={!dirty}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
