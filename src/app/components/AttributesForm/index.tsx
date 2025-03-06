import React, { useEffect, useMemo } from "react";
import * as Form from "@radix-ui/react-form";
import { Button, Flex, IconButton, Link } from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { UseFormReturn } from "react-hook-form";
import { PiArrowCounterClockwise, PiX } from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";
import clsx from "clsx";
import { SDKAttribute, SDKAttributeType } from "@/app/gbTypes";
import AddCustomAttribute from "./AddCustomAttribute";
import useGlobalState from "@/app/hooks/useGlobalState";
import TextareaAutosize from "react-textarea-autosize";
import InputField from "@/app/components/AttributesForm/InputFields";

const arrayAttributeTypes = ["string[]", "number[]", "secureString[]"];

export default function AttributesForm({
  form,
  dirty = false,
  setDirty,
  jsonMode = false,
  textareaAttributes,
  setTextareaAttributes,
  resetTextarea,
  textareaError,
  setTextareaError,
  schema,
  saveOnBlur,
}: {
  form: UseFormReturn<Attributes>;
  dirty?: boolean;
  setDirty?: (d: boolean) => void;
  jsonMode: boolean;
  textareaAttributes: string;
  setTextareaAttributes: (v: string) => void;
  resetTextarea: () => void;
  textareaError: boolean;
  setTextareaError: (v: boolean) => void;
  schema: Record<string, SDKAttribute>;
  saveOnBlur: (Attributes?: Attributes) => void;
}) {
  const [customAttrSchema, setCustomAttrSchema] = useGlobalState<
    Record<string, SDKAttribute>
  >("customAttributeSchema", {}, true);
  const [overriddenAttributes, setOverriddenAttributes] =
    useTabState<Attributes>("overriddenAttributes", {});
  const addCustomField = (
    customAttrId: string,
    customAttrType: SDKAttributeType,
  ) => {
    setDirty?.(true);
    if (attributes[customAttrId]) {
      return;
    }
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
    setOverriddenAttributes({
      ...overriddenAttributes,
      [customAttrId]: newAttributes[customAttrId],
    });
    form.reset(newAttributes);
  };

  const resetAttribute = (key: string) => {
    setDirty?.(true);
    if (overriddenAttributes.hasOwnProperty(key)) {
      const overriddenAttributesCopy = { ...overriddenAttributes };
      delete overriddenAttributesCopy[key];
      setOverriddenAttributes(overriddenAttributesCopy);
    }
    setDirty?.(false);
  };
  const [newAppliedAttributeIds, setNewAppliedAttributeIds] = useTabState<
    string[]
  >("newAppliedAttributeIds", []);
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const formAttributes = form.watch();
  const formAttributesString = JSON.stringify(formAttributes, null, 2);

  const removeField = (key: string) => {
    if (!newAppliedAttributeIds.includes(key)) {
      return;
    }
    setNewAppliedAttributeIds(newAppliedAttributeIds.filter((k) => k !== key));
    setDirty?.(true);
    const newAttributes = form.watch();
    delete newAttributes?.[key];
    // update json to remove the attribute
    setTextareaAttributes?.(JSON.stringify(newAttributes, null, 2));
    form.reset(newAttributes);
    const savedAttributes = { ...attributes };
    delete savedAttributes?.[key];
    setAttributes(savedAttributes);
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

  const saveAndUpdateAttribute = (attributeKey: string, value: any) => {
    if (!jsonMode) {
      resetTextarea();
      form.reset(formAttributes);
    }
    form.setValue(attributeKey, value);
    saveOnBlur?.({ [attributeKey]: value });
  };

  return (
    <div>
      <Form.Root className="FormRoot m-0 small">
        <div>
          {!jsonMode ? (
            !Object.keys(formAttributes).length ? (
              <div className="mb-2">
                <em>No attributes found.</em>
              </div>
            ) : (
              <Flex direction="column">
                {attributesWithoutCustom?.map((attributeKey, i) => {
                  const attributeType = getAttributeType(
                    attributeKey,
                    form.watch(attributeKey),
                    schema,
                    customAttrSchema,
                  );
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
                        <InputField
                          attributeKey={attributeKey}
                          save={saveAndUpdateAttribute}
                          type={attributeType}
                          schema={schema}
                          value={form.watch(attributeKey)}
                        />
                        <div style={{ width: 50 }}>
                          {overriddenAttributes.hasOwnProperty(
                            attributeKey,
                          ) && (
                            <IconButton
                              type="button"
                              size="2"
                              variant="ghost"
                              color="orange"
                              style={{ margin: "0 0 0 8px" }}
                              onClick={() => resetAttribute(attributeKey)}
                            >
                              <PiArrowCounterClockwise />
                            </IconButton>
                          )}
                        </div>
                      </Form.Field>
                    </div>
                  );
                })}
                <div className="border-t border-gray-a6 my-4 h-0" />
                {customAttributes.length > 0
                  ? customAttributes?.map((attributeKey, i) => {
                      const attributeType = getAttributeType(
                        attributeKey,
                        form.watch(attributeKey),
                        schema,
                        customAttrSchema,
                      );
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
                            <InputField
                              attributeKey={attributeKey}
                              save={saveAndUpdateAttribute}
                              type={attributeType}
                              schema={schema}
                              value={form.watch(attributeKey)}
                            />
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
                    })
                  : null}
                {customAttributes.length > 0 && (
                  <div className="border-t border-gray-a6 my-4 h-0" />
                )}
              </Flex>
            )
          ) : (
            <>
              <div
                className="rt-TextAreaRoot rt-r-size-2 rt-variant-surface mb-2"
                style={{ minHeight: "unset !important" }}
              >
                <TextareaAutosize
                  className={clsx("rt-reset rt-TextAreaInput mono", {
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
                  style={{
                    fontSize: "12px",
                    lineHeight: "16px",
                    padding: "6px 6px",
                  }}
                  minRows={15}
                />
              </div>
              <div className="flex items-center justify-end mt-2 gap-3">
                {dirty && (
                  <Link
                    href="#"
                    size="2"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      resetTextarea();
                    }}
                  >
                    Cancel
                  </Link>
                )}
                <Button
                  type="button"
                  disabled={!dirty}
                  onClick={() => {
                    setDirty?.(true);
                    saveOnBlur?.();
                  }}
                >
                  Apply
                </Button>
              </div>
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
