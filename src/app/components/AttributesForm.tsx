import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import {
  Button,
  Switch,
  Flex,
  TextField,
  Select,
  DropdownMenu,
  Link,
} from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { UseFormReturn } from "react-hook-form";
import { PiCaretDownFill, PiPlusCircleFill, PiX } from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import useDebounce from "@/app/hooks/useDebounce";
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
  saveOnBlur?: (Attributes?: Attributes) => void;
  canAddRemoveFields?: boolean;
}) {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const [addCustomIdDropdownOpen, setAddCustomIdDropdownOpen] = useState(false);
  const addCustomIdRef = useRef<HTMLInputElement>(null);
  const [addCustomType, setAddCustomType] = useState("string");
  const watchAllFields = form.watch();
  // const debouncedValue = useDebounce(watchAllFields, 500);
  //
  // useEffect(() => {
  //     if (saveOnBlur && !jsonMode) {
  //       saveOnBlur();
  //     }
  // }, [debouncedValue]);

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
    if (schema?.[addCustomId]) {
      setAddCustomType(schema[addCustomId]);
    }
  }, [addCustomId]);

  const [newAppliedAttributeIds, setNewAppliedAttributeIds] = useTabState<
    string[]
  >("newAppliedAttributeIds", []);
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

  useEffect(() => {
    if (form.formState.isDirty && !dirty) {
      setDirty?.(true);
    }
  }, [form.formState, dirty]);

  useEffect(() => {
    setTextareaAttributes?.(formAttributesString);
    setTextareaError?.(false);
  }, [formAttributesString]);

  const customAttributes = useMemo(() => {
    return Object.keys(formAttributes).filter((key) => {
      return newAppliedAttributeIds.includes(key);
    });
  }, [formAttributes, newAppliedAttributeIds]);

  const attributesWithoutCustom = useMemo(() => {
    return Object.keys(formAttributes).filter(
      (key) => !newAppliedAttributeIds.includes(key),
    );
  }, [formAttributes, newAppliedAttributeIds]);

  const attributeTypeReadable = (type: string) => {
    switch (type) {
      case "string":
        return "String";
      case "number":
        return "Number";
      case "boolean":
        return "Boolean";
      default:
        return "Unknown";
    }
  };

  return (
    <Form.Root className="FormRoot m-0 small">
      <div>
        {!jsonMode ? (
          !Object.keys(formAttributes).length ? (
            <em className="text-2xs">No attributes found</em>
          ) : (
            <Flex direction="column">
              {attributesWithoutCustom.map((attributeKey, i) => {
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
                    </Form.Field>
                  </div>
                );
              })}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {customAttributes.length > 0 && (
                  <div className="mb-2">
                    {customAttributes.map((attributeKey, i) => {
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
                            })}
                            <Button
                              type="button"
                              size="1"
                              variant="ghost"
                              color="red"
                              className="ml-2 mr-1"
                              onClick={() => removeField(attributeKey)}
                            >
                              <PiX />
                            </Button>
                          </Form.Field>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!jsonMode && addingCustom && (
                  <div className="pb-2">
                    <Form.Field
                      className="FormFieldInline my-1 w-full"
                      name="customField"
                      onBlur={() => {
                        saveOnBlur?.();
                      }}
                    >
                      <Form.Label className="FormLabel mr-1 text-nowrap">
                        <div
                          className="inline-block -mb-2 overflow-hidden overflow-ellipsis"
                          style={{ width: 100 }}
                        >
                          Add field
                        </div>
                      </Form.Label>
                      <Flex gap="2" align="center" className="w-full">
                        <div className="w-full">
                          <TextField.Root
                            key={"addCustomAttributeField"}
                            ref={addCustomIdRef}
                            type="text"
                            list="schema-attributes"
                            autoFocus
                            className=""
                            placeholder="field name"
                            value={addCustomId}
                            onClick={() => setAddCustomIdDropdownOpen(true)}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAddCustomId(v);
                            }}
                            onKeyDown={(e) => {
                              if (e.code === "Enter" && addCustomId.trim()) {
                                addCustomField();
                                setAddCustomIdDropdownOpen(false);
                              }
                            }}
                          >
                            <DropdownMenu.Root
                              open={addCustomIdDropdownOpen}
                              onOpenChange={(o) => {
                                setTimeout(() => {
                                  if (
                                    !o &&
                                    document.activeElement ===
                                      addCustomIdRef.current
                                  )
                                    return;
                                  setAddCustomIdDropdownOpen(o);
                                }, 50);
                              }}
                              modal={false}
                            >
                              <DropdownMenu.Trigger>
                                <TextField.Slot
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setAddCustomIdDropdownOpen(
                                      !addCustomIdDropdownOpen,
                                    );
                                  }}
                                  side="right"
                                >
                                  <PiCaretDownFill />
                                </TextField.Slot>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content
                                align="end"
                                onCloseAutoFocus={() =>
                                  addCustomIdRef?.current?.focus()
                                }
                                style={{ width: 200, maxHeight: 300 }}
                              >
                                <div id="schema-attributes">
                                  {Object.keys(schema || {})
                                    .filter(
                                      (key) =>
                                        !Object.prototype.hasOwnProperty.call(
                                          formAttributes,
                                          key,
                                        ) &&
                                        key.includes(
                                          addCustomIdRef?.current?.value || "",
                                        ),
                                    )
                                    .map((key) => (
                                      <DropdownMenu.Item
                                        onSelect={() => {
                                          setAddCustomId(key);
                                          setAddCustomIdDropdownOpen(false);
                                        }}
                                        key={key}
                                      >
                                        {key}
                                      </DropdownMenu.Item>
                                    ))}
                                </div>
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          </TextField.Root>
                        </div>

                        <Select.Root
                          defaultValue="string"
                          size="2"
                          value={addCustomType}
                          onValueChange={(v) => setAddCustomType(v)}
                          disabled={!!schema?.[addCustomId]}
                        >
                          <Select.Trigger>
                            {attributeTypeReadable(addCustomType)}
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="string">String</Select.Item>
                            <Select.Item value="number">Number</Select.Item>
                            <Select.Item value="boolean">Boolean</Select.Item>
                            {/*todo: number[], string[]*/}
                          </Select.Content>
                        </Select.Root>
                      </Flex>
                    </Form.Field>
                    <div className="flex justify-end items-center gap-3 mt-2.5 -mb-1.5">
                      <Link
                        href="#"
                        size="2"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          cancelAddCustomField();
                        }}
                      >
                        Cancel
                      </Link>
                      <Button
                        type="button"
                        disabled={!addCustomId.trim()}
                        size="2"
                        onClick={() => addCustomField()}
                      >
                        Add field
                      </Button>
                    </div>
                  </div>
                )}
                {!jsonMode && !addingCustom && (
                  <Button
                    color="violet"
                    variant="ghost"
                    size="2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAddingCustom(true);
                      setAddCustomIdDropdownOpen(true);

                      const container =
                        document.querySelector("#attributesTab");
                      window.setTimeout(() => {
                        container?.scroll?.({
                          top: container?.scrollHeight,
                          behavior: "smooth",
                        });
                      }, 50);
                    }}
                    className="flex gap-1 mt-1"
                  >
                    <PiPlusCircleFill />
                    Add Field
                  </Button>
                )}
              </div>
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
              disabled={!dirty}
              onClick={() => {
                setDirty?.(true);
                saveOnBlur?.();
              }}
            >
              Apply
            </Button>
          </>
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
  saveOnBlur?: (newAttributes: Attributes) => void;
}) {
  let attributeType = getAttributeType(
    attributeKey,
    form.watch(attributeKey),
    schema,
  );
  //

  // todo: enum, number[], string[]
  // todo (maybe. or just use string): secureString, secureString[]
  return (
    <div className="w-full">
      <Form.Control asChild>
        {attributeType === "number" ? (
          <TextField.Root
            type="number"
            onChange={(e) => {
              form.setValue(attributeKey, Number(e.target.value));
              setDirty?.(true);
            }}
            value={form.watch(attributeKey)}
          />
        ) : attributeType === "boolean" ? (
          <Switch
            size="1"
            className="Switch"
            checked={form.watch(attributeKey)}
            onCheckedChange={(v: boolean) => {
              form.setValue(attributeKey, v);
              saveOnBlur?.({ [attributeKey]: v });
              setDirty?.(true);
            }}
          />
        ) : (
          // make it so that when you select it is the end of the text
          <TextField.Root
            type="text"
            onChange={(e) => {
              form.setValue(attributeKey, e.target.value);
              setDirty?.(true);
            }}
            value={form.watch(attributeKey)}
          />
        )}
      </Form.Control>
    </div>
  );
}

function getAttributeType(a: string, v: any, schema?: Record<string, string>) {
  if (schema?.[a]) return schema[a];
  return typeof v;
}
