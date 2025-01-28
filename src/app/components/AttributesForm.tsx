import React, {useEffect, useRef, useState} from "react";
import * as Form from "@radix-ui/react-form";
import {Button, Switch, Link, Select} from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import {UseFormReturn} from "react-hook-form";
import {PiPlusCircle, PiXCircle} from "react-icons/pi";
import useTabState from "@/app/hooks/useTabState";

export default function AttributesForm({
  form,
  dirty = false,
  setDirty,
  jsonMode = false,
  schema,
  canAddRemoveFields = true,
}: {
  form: UseFormReturn<Attributes>;
  dirty?: boolean;
  setDirty?: (d: boolean) => void;
  jsonMode?: boolean;
  schema?: Record<string, string>;
  canAddRemoveFields?: boolean;
}) {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const [addCustomType, setAddCustomType] = useState("string");
  const formAttributes = form.getValues();

  const addField = (key: string, type: string) => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    newAttributes[key] = undefined;
    form.reset(newAttributes);
  }
  const removeField = (key: string) => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    delete newAttributes?.[key];
    form.reset(newAttributes);
  };
  const addCustomField = () => {
    setDirty?.(true);
    const newAttributes = form.getValues();
    newAttributes[addCustomId] = addCustomType === "number" ? 0 : addCustomType === "boolean" ? false : "string";
    // todo: number[], string[]
    form.reset(newAttributes);
    setAddingCustom(false);
    setAddCustomId("");
    setAddCustomType("string");
  }
  const cancelAddCustomField = () => {
    setAddingCustom(false);
    setAddCustomId("");
    setAddCustomType("string");
  }
  const applyAttributes = () => {
    setAttributes(formAttributes);
    form.reset(formAttributes);
    setDirty?.(false);
  }
  const resetAttributes = () => {
    form.reset(attributes);
    setDirty?.(false);
  }

  useEffect(() => {
    if (form.formState.isDirty && !dirty) {
      setDirty?.(true);
    }
  }, [form.formState, dirty]);

  return (
    <>
      <div>
        <Form.Root className="FormRoot small">
          {!jsonMode ?
            Object.keys(formAttributes).map((attributeKey, i) => {
              return (
                <div key={attributeKey}>
                  <Form.Field className="FormFieldInline my-1" name={attributeKey}>
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
                          <PiXCircle/>
                        </Button>
                      )}
                      <div className="inline-block -mb-2 overflow-hidden overflow-ellipsis"
                           style={{minWidth: 80, maxWidth: 120}}>
                        {attributeKey}
                      </div>
                    </Form.Label>
                    {renderInputField({attributeKey, form, schema})}
                  </Form.Field>
                </div>
              );
            })
            : (
              <textarea
                className="Textarea mono"
                name={"__JSON_attributes__"}
                // todo: make uncontrolled, sync with form if valid JSON
                value={JSON.stringify(formAttributes, null, 2)}
                rows={12}
              />
            )}
          {canAddRemoveFields && (
            <div className="mt-2">
              {/*todo: map through unused attributes from schema*/}
              {!addingCustom ? (
                <div key="add_custom">
                  <Button
                    type="button"
                    size="2"
                    variant="ghost"
                    className="px-1 mt-0.5 mr-0.5"
                    onClick={() => {
                      setAddingCustom(true);
                    }}
                  >
                    <PiPlusCircle /> Add {schema ? "custom" : ""}attribute...
                  </Button>
                </div>
              ) : (
                <div key="add_custom" className="mt-1 flex justify-between items-center" style={{ fontSize: 12 }}>
                  <div className="flex items-center gap-1 mr-3">
                    <span>Add</span>
                    <input placeholder="field name" className="Input" value={addCustomId} onChange={(e) => {
                      const v = e.target.value;
                      setAddCustomId(v);
                    }}/>
                    <Select.Root defaultValue="string" size="1" value={addCustomType}
                                 onValueChange={(v) => setAddCustomType(v)}>
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
                  <div className="flex items-center gap-1">
                    <Button disabled={!addCustomId.trim()} type="button" size="1" onClick={() => addCustomField()}>
                      Add
                    </Button>
                    <Button type="button" size="1" color="gray" variant="outline" onClick={() => cancelAddCustomField()}>
                      X
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {dirty && (
            <div className="mt-2 flex justify-between items-center">
              <Link href="#" role="button" color="gray" onClick={resetAttributes}>
                Reset
              </Link>
              <Button type="button" size="2" onClick={applyAttributes}>
                Apply
              </Button>
            </div>
          )}
        </Form.Root>
      </div>
    </>
);
}

function renderInputField({
  attributeKey,
  form,
  schema,
}: {
  attributeKey: string;
  form: UseFormReturn<Attributes>;
  schema?: Record<string, string>;
}) {
  let attributeType = getAttributeType(attributeKey, form.watch(attributeKey), schema);
  // todo: enum, number[], string[]
  // todo (maybe. or just use string): secureString, secureString[]
  return (
    <Form.Control asChild>
      {attributeType === "number" ? (
        <input className="Input" type="number" {...form.register(attributeKey)} />
      ): attributeType === "boolean" ? (
        <Switch size="2" className="Switch" checked={form.watch(attributeKey)} onCheckedChange={(v: boolean) => form.setValue(attributeKey, v)} />
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
