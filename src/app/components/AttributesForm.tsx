import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Button, Switch, Select } from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { UseFormReturn } from "react-hook-form";
import { PiCheckBold, PiPlusCircle, PiX, PiXCircle } from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import clsx from "clsx";

export default function AttributesForm({
  form,
  dirty = false,
  setDirty,
  jsonMode = false,
  textareaAttributes,
  setTextareaAttributes,
  textareaError,
  setTextareaError,
  schema,
  canAddRemoveFields = true,
}: {
  form: UseFormReturn<Attributes>;
  dirty?: boolean;
  setDirty?: (d: boolean) => void;
  jsonMode?: boolean;
  textareaAttributes?: string;
  setTextareaAttributes?: (v: string) => void;
  textareaError?: boolean;
  setTextareaError?: (v: boolean) => void;
  schema?: Record<string, string>;
  canAddRemoveFields?: boolean;
}) {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});

  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const [addCustomType, setAddCustomType] = useState("string");
  const formAttributes = form.getValues();
  const hasAttributes = Object.keys(formAttributes).length > 0;
  const formAttributesString = JSON.stringify(formAttributes, null, 2);

  const addField = (key: string, type: string) => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    newAttributes[key] = undefined;
    form.reset(newAttributes);
  };
  const removeField = (key: string) => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    delete newAttributes?.[key];
    form.reset(newAttributes);
  };
  const addCustomField = () => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    newAttributes[addCustomId] =
      addCustomType === "number" ? 0 : addCustomType === "boolean" ? false : "";
    // todo: number[], string[]
    form.reset(newAttributes);
    setAddingCustom(false);
    setAddCustomId("");
    setAddCustomType("string");
  };
  const cancelAddCustomField = () => {
    setAddingCustom(false);
    setAddCustomId("");
    setAddCustomType("string");
  };
  const applyAttributes = () => {
    if (!jsonMode) {
      setAttributes(formAttributes);
      form.reset(formAttributes);
      setDirty?.(false);
    } else {
      try {
        const newAttributes: Attributes = JSON.parse(textareaAttributes || "");
        if (!newAttributes || typeof newAttributes !== "object") {
          throw new Error("invalid type");
        }
        setAttributes(newAttributes);
        form.reset(newAttributes);
        setDirty?.(false);
      } catch (e) {
        setTextareaError?.(true);
      }
    }
  };
  const resetAttributes = () => {
    form.reset(attributes);
    setDirty?.(false);
  };

  useEffect(() => {
    if (form.formState.isDirty && !dirty) {
      setDirty?.(true);
    }
  }, [form.formState, dirty]);

  useEffect(() => {
    setTextareaAttributes?.(formAttributesString);
    setTextareaError?.(false);
  }, [formAttributesString]);

  useEffect(() => {
    if (schema?.[addCustomId]) {
      setAddCustomType(schema[addCustomId]);
    }
  }, [addCustomId]);

  return (
    <div className={clsx({ "mb-[60px]": hasAttributes })}>
      <Form.Root className="FormRoot small">
        <div className="box">
          {!jsonMode ? (
            !Object.keys(formAttributes).length ? (
              <em className="text-2xs">No attributes found</em>
            ) : (
              Object.keys(formAttributes).map((attributeKey, i) => {
                return (
                  <div key={attributeKey}>
                    <Form.Field
                      className="FormFieldInline my-1"
                      name={attributeKey}
                    >
                      <Form.Label className="FormLabel mr-1 text-nowrap">
                        {canAddRemoveFields && (
                          <Button
                            type="button"
                            size="1"
                            variant="ghost"
                            color="red"
                            className="px-1 mt-0.5 mr-0.5"
                            onClick={() => removeField(attributeKey)}
                          >
                            <PiXCircle />
                          </Button>
                        )}
                        <div
                          className="inline-block -mb-2 overflow-hidden overflow-ellipsis"
                          style={{ minWidth: 80, maxWidth: 120 }}
                        >
                          {attributeKey}
                        </div>
                      </Form.Label>
                      {renderInputField({
                        attributeKey,
                        form,
                        schema,
                        setDirty,
                      })}
                    </Form.Field>
                  </div>
                );
              })
            )
          ) : (
            <textarea
              className={clsx("Textarea mono mt-1", {
                "border-red-700": textareaError,
              })}
              name={"__JSON_attributes__"}
              value={textareaAttributes}
              onChange={(e) => {
                const v = e.target.value;
                setTextareaAttributes?.(v);
                setTextareaError?.(false);
                setDirty?.(true);
              }}
              style={{ fontSize: "10px", lineHeight: "15px" }}
              rows={15}
            />
          )}
        </div>

        {canAddRemoveFields && !jsonMode && (
          <div className="m-2">
            {!addingCustom ? (
              <div key="add_custom">
                <Button
                  type="button"
                  size="1"
                  variant="ghost"
                  className="mt-0.5"
                  onClick={() => {
                    setAddingCustom(true);
                  }}
                >
                  <PiPlusCircle /> Add attribute...
                </Button>
              </div>
            ) : (
              <div
                key="add_custom"
                className="mt-1 flex gap-3 justify-between items-center"
                style={{ fontSize: 12 }}
              >
                <div className="flex items-center gap-1">
                  <span>Add</span>
                  <input
                    type="text"
                    list="schema-attributes"
                    autoFocus
                    placeholder="field name"
                    className="Input bg-white"
                    value={addCustomId}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAddCustomId(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.code === "Enter" && addCustomId.trim()) {
                        addCustomField();
                      }
                    }}
                  />
                  <datalist id="schema-attributes">
                    {Object.keys(schema || {})
                      .filter(
                        (key) =>
                          !Object.prototype.hasOwnProperty.call(
                            formAttributes,
                            key,
                          ),
                      )
                      .map((key) => (
                        <option key={key}>{key}</option>
                      ))}
                  </datalist>
                  <Select.Root
                    defaultValue="string"
                    size="1"
                    value={addCustomType}
                    onValueChange={(v) => setAddCustomType(v)}
                    disabled={!!schema?.[addCustomId]}
                  >
                    <Select.Trigger className="uppercase">
                      <div className="text-green-700">
                        &lt;{addCustomType?.[0] || "S"}&gt;
                      </div>
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="string">String</Select.Item>
                      <Select.Item value="number">Number</Select.Item>
                      <Select.Item value="boolean">Boolean</Select.Item>
                      {/*todo: number[], string[]*/}
                    </Select.Content>
                  </Select.Root>
                </div>
                <div className="flex items-center gap-1 -mr-1">
                  <Button
                    type="button"
                    disabled={!addCustomId.trim()}
                    radius="full"
                    size="1"
                    onClick={() => addCustomField()}
                    style={{ width: 24 }}
                    className="px-0"
                  >
                    <PiCheckBold />
                  </Button>
                  <Button
                    type="button"
                    radius="full"
                    size="1"
                    color="gray"
                    variant="outline"
                    onClick={() => cancelAddCustomField()}
                    style={{ width: 24 }}
                    className="px-0"
                  >
                    <PiX />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Form.Root>
    </div>
  );
}

function renderInputField({
  attributeKey,
  form,
  schema,
  setDirty,
}: {
  attributeKey: string;
  form: UseFormReturn<Attributes>;
  schema?: Record<string, string>;
  setDirty?: (b: boolean) => void;
}) {
  let attributeType = getAttributeType(
    attributeKey,
    form.watch(attributeKey),
    schema,
  );
  // todo: enum, number[], string[]
  // todo (maybe. or just use string): secureString, secureString[]
  return (
    <Form.Control asChild>
      {attributeType === "number" ? (
        <input
          className="Input"
          type="number"
          {...form.register(attributeKey)}
        />
      ) : attributeType === "boolean" ? (
        <Switch
          size="2"
          className="Switch"
          checked={form.watch(attributeKey)}
          onCheckedChange={(v: boolean) => {
            form.setValue(attributeKey, v);
            setDirty?.(true);
          }}
        />
      ) : (
        <input className="Input" {...form.register(attributeKey)} />
      )}
    </Form.Control>
  );
}

function getAttributeType(a: string, v: any, schema?: Record<string, string>) {
  if (schema?.[a]) return schema[a];
  return typeof v;
}
