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
import { SDKAttributeType } from "@/app/tempGbExports";
import AddCustomAttribute from ".//AddCustomAttribute";

export default function AttributesForm({
  form,
  isTiny,
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
  isTiny: boolean;
  dirty?: boolean;
  setDirty?: (d: boolean) => void;
  jsonMode?: boolean;
  textareaAttributes?: string;
  setTextareaAttributes?: (v: string) => void;
  textareaError?: boolean;
  setTextareaError?: (v: boolean) => void;
  schema?: Record<string, SDKAttributeType>;
  saveOnBlur?: (Attributes?: Attributes) => void;
  canAddRemoveFields?: boolean;
}) {
  const addCustomField = (
    customAttrId: string,
    customAttrType: SDKAttributeType,
  ) => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    newAttributes[customAttrId] =
      customAttrType === "number"
        ? 0
        : customAttrType === "boolean"
          ? false
          : "";
    // todo: number[], string[]
    setNewAppliedAttributeIds([...newAppliedAttributeIds, customAttrId]);
    form.reset(newAttributes);
  };

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

  return (
    <div>
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

      {!jsonMode && (
        <AddCustomAttribute
          formAttributes={formAttributes}
          schema={schema}
          addCustomField={addCustomField}
        />
      )}
    </div>
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
