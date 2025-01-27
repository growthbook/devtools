import React from "react";
import * as Form from "@radix-ui/react-form";
import { Switch } from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import {UseFormReturn} from "react-hook-form";

export default function AttributesForm({
  form,
  jsonMode = false,
  schema,
}: {
  form: UseFormReturn<Attributes>;
  jsonMode?: boolean;
  schema?: Record<string, string>;
}) {
  const attributes = form.getValues();

  return (
    <>
      <div>
        <Form.Root className="FormRoot small">
          {!jsonMode ?
            Object.keys(attributes).map((a, i) => {
              return (
                <div key={a}>
                  <Form.Field className="FormFieldInline my-1" name={a}>
                    <Form.Label className="FormLabel mr-1" style={{ minWidth: 80 }}>{a}</Form.Label>
                    {renderInputField(a, form, schema)}
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
        </Form.Root>
      </div>
    </>
  );
}

function renderInputField(a: string, form: UseFormReturn<Attributes>, schema?: Record<string, string>) {
  let attributeType = getAttributeType(a, form.watch(a), schema);
  // todo: enum, number[], string[]
  // todo (maybe. or just use string): secureString, secureString[]
  return (
    <Form.Control asChild>
      {attributeType === "number" ? (
        <input className="Input" type="number" {...form.register(a)} />
      ): attributeType === "boolean" ? (
        <Switch size="2" className="Switch" checked={form.watch(a)} onCheckedChange={(v: boolean) => form.setValue(a, v)} />
      ) : (
        <input className="Input" {...form.register(a)} />
      )}
    </Form.Control>
  );
}

function getAttributeType(a: string, v: any, schema?: Record<string, string>) {
  if (schema?.[a]) return schema[a];
  return typeof v;
}
