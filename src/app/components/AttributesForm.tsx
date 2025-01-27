import React, {useEffect} from "react";
import * as Form from "@radix-ui/react-form";
import {Button, Switch, Link} from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import {UseFormReturn} from "react-hook-form";
import {PiXCircle} from "react-icons/pi";

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
  const attributes = form.getValues();

  const addField = (key: string) => {
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
            Object.keys(attributes).map((attributeKey, i) => {
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
                          <PiXCircle />
                        </Button>
                      )}
                      <div className="inline-block -mb-2 overflow-hidden overflow-ellipsis" style={{ minWidth: 80, maxWidth: 120 }}>
                        {attributeKey}
                      </div>
                    </Form.Label>
                    {renderInputField({ attributeKey, form, schema })}
                  </Form.Field>
                </div>
              );
          })
          : (
              <textarea
                className="Textarea mono"
                name={"__JSON_attributes__"}
                // todo: make uncontrolled, sync with form if valid JSON
                value={JSON.stringify(attributes, null, 2)}
                rows={12}
              />
          )}
          {dirty && (
            <div className="mt-2 flex justify-between items-center">
              <Link href="#" role="button" color="gray">
                Reset
              </Link>
              <Button type="button" size="2">
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
