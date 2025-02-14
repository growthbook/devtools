import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Button, Switch, Select, Flex, TextField } from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { UseFormReturn } from "react-hook-form";
import { PiCheckBold, PiPlusCircle, PiX, PiTrash } from "react-icons/pi";
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
  saveOnBlur,
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
  saveOnBlur?: () => void;
  canAddRemoveFields?: boolean;
}) {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const [newAppliedAttributeIds, setNewAppliedAttributeIds] = useTabState<
    string[]
  >("newAppliedAttributeIds", []);
  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const [addCustomType, setAddCustomType] = useState("string");
  const formAttributes = form.getValues();
  const formAttributesString = JSON.stringify(formAttributes, null, 2);

  const removeField = (key: string) => {
    if (!newAppliedAttributeIds.includes(key)) {
      return;
    }
    setNewAppliedAttributeIds(newAppliedAttributeIds.filter((k) => k !== key));
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
    setNewAppliedAttributeIds([...newAppliedAttributeIds, addCustomId]);
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
    <Form.Root className="FormRoot m-0 small">
      <div>
        {!jsonMode ? (
          !Object.keys(formAttributes).length ? (
            <em className="text-2xs">No attributes found</em>
          ) : (
            <Flex direction="column" gap="1">
              {Object.keys(formAttributes).map((attributeKey, i) => {
                console.log(newAppliedAttributeIds);
                return (
                  <div key={attributeKey}>
                    <Form.Field
                      className="FormFieldInline my-1"
                      name={attributeKey}
                      onBlur={() => {
                        saveOnBlur?.();
                      }}
                    >
                      <Form.Label className="FormLabel mr-1 text-nowrap">
                        <div
                          className="inline-block -mb-2 overflow-hidden overflow-ellipsis"
                          style={{ width: 100 }}
                        >
                          {attributeKey}
                        </div>
                      </Form.Label>
                      {renderInputField({
                        attributeKey,
                        form,
                        schema,
                        setDirty,
                        saveOnBlur,
                      })}
                      {
                        <Button
                          type="button"
                          size="1"
                          variant="ghost"
                          disabled={
                            !newAppliedAttributeIds.includes(attributeKey)
                          }
                          color="red"
                          className="ml-2 mr-1"
                          onClick={() => removeField(attributeKey)}
                        >
                          <PiX />
                        </Button>
                      }
                    </Form.Field>
                  </div>
                );
              })}
            </Flex>
          )
        ) : (
          <>
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
            <Button
              type="button"
              className="mt-2 float-right"
              onClick={saveOnBlur}
            >
              Apply
            </Button>
          </>
        )}
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
      </div>
    </Form.Root>
  );
}

function renderInputField({
  attributeKey,
  form,
  schema,
  setDirty,
  saveOnBlur,
}: {
  attributeKey: string;
  form: UseFormReturn<Attributes>;
  schema?: Record<string, string>;
  setDirty?: (b: boolean) => void;
  saveOnBlur?: () => void;
}) {
  let attributeType = getAttributeType(
    attributeKey,
    form.watch(attributeKey),
    schema,
  );
  // todo: enum, number[], string[]
  // todo (maybe. or just use string): secureString, secureString[]
  return (
    <div className="w-full">
      <Form.Control asChild>
        {attributeType === "number" ? (
          <TextField.Root type="number" {...form.register(attributeKey)} />
        ) : attributeType === "boolean" ? (
          <Switch
            size="1"
            className="Switch"
            checked={form.watch(attributeKey)}
            onCheckedChange={(v: boolean) => {
              form.setValue(attributeKey, v);
              setDirty?.(true);
              // saveOnBlur?.();
            }}
          />
        ) : (
          <TextField.Root {...form.register(attributeKey)} />
        )}
      </Form.Control>
    </div>
  );
}

function getAttributeType(a: string, v: any, schema?: Record<string, string>) {
  if (schema?.[a]) return schema[a];
  return typeof v;
}
