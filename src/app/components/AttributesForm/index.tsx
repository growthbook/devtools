import React, { useEffect, useMemo } from "react";
import * as Form from "@radix-ui/react-form";
import {Button, Switch, Flex, TextField, IconButton} from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { UseFormReturn } from "react-hook-form";
import { PiX } from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import clsx from "clsx";
import { SDKAttribute, SDKAttributeType } from "@/app/tempGbExports";
import AddCustomAttribute from "./AddCustomAttribute";
import SelectField from "../Forms/SelectField";
import MultiSelectField from "../Forms/MultiSelectField";
import useGlobalState from "@/app/hooks/useGlobalState";

const arrayAttributeTypes = ["string[]", "number[]", "secureString[]"];

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
}: {
  form: UseFormReturn<Attributes>;
  dirty?: boolean;
  setDirty?: (d: boolean) => void;
  jsonMode?: boolean;
  textareaAttributes?: string;
  setTextareaAttributes?: (v: string) => void;
  textareaError?: boolean;
  setTextareaError?: (v: boolean) => void;
  schema: Record<string, SDKAttribute>;
  saveOnBlur?: (Attributes?: Attributes) => void;
}) {
  const [customAttrSchema, setCustomAttrSchema] = useGlobalState<
    Record<string, SDKAttribute>
  >("customAttributeSchema", {}, true);

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
          : arrayAttributeTypes.includes(customAttrType)
            ? []
            : "";
    setNewAppliedAttributeIds([...newAppliedAttributeIds, customAttrId]);
    setCustomAttrSchema({
      ...customAttrSchema,
      [customAttrId]: {
        property: customAttrId,
        datatype: customAttrType,
      },
    });
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
                {attributesWithoutCustom?.map((attributeKey, i) => {
                  return (
                    <div key={attributeKey}>
                      <Form.Field
                        className="FormFieldInline my-1"
                        name={attributeKey}
                        onBlur={() => {
                          saveOnBlur?.();
                        }}
                      >
                        <Form.Label className="FormLabel mr-2 flex-shrink-0">
                          <div
                            className="inline-block line-clamp-2 leading-4 mt-1.5"
                            style={{ width: "min(120px, 20vw)" }}
                          >
                            {attributeKey}
                          </div>
                        </Form.Label>
                        {renderInputField({
                          attributeKey,
                          form,
                          schema,
                          customAttrSchema,
                          setDirty,
                          saveOnBlur,
                        })}
                      </Form.Field>
                    </div>
                  );
                })}
                <div className="border-t border-gray-200 my-4 h-0" />
                {customAttributes.length > 0 ? customAttributes?.map((attributeKey, i) => {
                  return (
                    <div key={attributeKey}>
                      <Form.Field
                        className="FormFieldInline my-1"
                        name={attributeKey}
                        onBlur={() => {
                          saveOnBlur?.();
                        }}
                      >
                        <Form.Label className="FormLabel mr-2 flex-shrink-0">
                          <div
                            className="inline-block line-clamp-2 leading-4 mt-1.5"
                            style={{ width: "min(120px, 20vw)" }}
                          >
                            {attributeKey}
                          </div>
                        </Form.Label>
                        {renderInputField({
                          attributeKey,
                          form,
                          schema,
                          customAttrSchema,
                          setDirty,
                        })}
                        <IconButton
                          type="button"
                          size="2"
                          variant="ghost"
                          color="red"
                          style={{ margin: "0 0 0 8px" }}
                          onClick={() => removeField(attributeKey)}
                        >
                          <PiX />
                        </IconButton>
                      </Form.Field>
                    </div>
                  );
                }) : null }
                {customAttributes.length > 0 && (
                  <div className="border-t border-gray-200 my-4 h-0"/>
                )}
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
  customAttrSchema,
  setDirty,
  saveOnBlur,
}: {
  attributeKey: string;
  form: UseFormReturn<Attributes>;
  schema: Record<string, SDKAttribute>;
  customAttrSchema: Record<string, SDKAttribute>;
  setDirty?: (b: boolean) => void;
  saveOnBlur?: (newAttributes: Attributes) => void;
}) {
  let attributeType = getAttributeType(
    attributeKey,
    form.watch(attributeKey),
    schema,
    customAttrSchema,
  );

  return (
    <div className="w-full flex items-center">
      <Form.Control asChild>
        {attributeType === "number" ? (
          <TextField.Root
            type="number"
            onChange={(e) => {
              form.setValue(attributeKey, Number(e.target.value));
              setDirty?.(true);
            }}
            value={form.watch(attributeKey)}
            className="w-full"
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
        ) : attributeType === "enum" ? (
          <SelectField
            className="text-sm w-full"
            menuPlacement="top"
            value={form.watch(attributeKey)}
            options={
              schema[attributeKey].enum?.split(",")?.map((strSegment) => {
                const trimmed = strSegment.trim();
                return {
                  value: trimmed,
                  label: trimmed,
                };
              }) || []
            }
            onChange={(v) => form.setValue(attributeKey, v)}
          />
        ) : arrayAttributeTypes.includes(attributeType) ? (
          <MultiSelectField
            creatable
            placeholder="Add to list..."
            className="text-sm w-full"
            menuPlacement="top"
            value={form.watch(attributeKey)}
            options={(form.watch(attributeKey) || [])?.map((entry: string) => ({
              value: entry,
              label: entry,
            }))}
            onChange={(v) =>
              form.setValue(
                attributeKey,
                attributeType === "number[]" ? v?.map((n) => parseInt(n)) : v,
              )
            }
            formatCreateLabel={(input: string) => `Add "${input}"`}
            validOptionPattern={attributeType === "number[]" ? "^\\d+$" : ".+"}
          />
        ) : (
          <TextField.Root
            type="text"
            onChange={(e) => {
              form.setValue(attributeKey, e.target.value);
              setDirty?.(true);
            }}
            value={form.watch(attributeKey)}
            className="w-full"
          />
        )}
      </Form.Control>
    </div>
  );
}

function getAttributeType(
  a: string,
  v: any,
  schema: Record<string, SDKAttribute>,
  customAttrSchema: Record<string, SDKAttribute>,
) {
  if (schema[a]) return schema[a].datatype;
  if (customAttrSchema[a]) return customAttrSchema[a].datatype;
  return typeof v;
}
