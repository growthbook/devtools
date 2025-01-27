import React from "react";
import * as Form from "@radix-ui/react-form";
import { Switch } from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";

export default function AttributesForm({
  attributeValues = {},
  jsonMode = false,
  schema,
}: {
  attributeValues?: Attributes;
  jsonMode?: boolean;
  schema?: Record<string, string>;
}) {
  return (
    <>
      <div>
        <Form.Root className="FormRoot small">
          {!jsonMode ?
            Object.entries(attributeValues).map(([a, v]) => {
              return (
                <div>
                  <Form.Field className="FormFieldInline my-1" name={a}>
                    <Form.Label className="FormLabel mr-1" style={{ minWidth: 80 }}>{a}</Form.Label>
                    {renderInputField(a, v, schema)}
                  </Form.Field>
                </div>
              );
          })
          : (
            <textarea value={JSON.stringify(attributeValues, null, 2)}/>
          )}
        </Form.Root>
      </div>
    </>
  );
}

function renderInputField(a: string, v: any, schema?: Record<string, string>) {
  let attributeType = getAttributeType(a, v, schema);
  if (attributeType === "number") {
    return (
      <Form.Control asChild>
        <input className="Input" type="number" name={a} value={v} />
      </Form.Control>
    );
  }
  if (attributeType === "boolean") {
    return (
      <Form.Control asChild>
        <Switch size="2" className="Switch" name={a} checked={v} />
      </Form.Control>
    );
  }
  return (
    <Form.Control asChild>
      <input className="Input" name={a} value={v} />
    </Form.Control>
  );
}

function getAttributeType(a: string, v: any, schema?: Record<string, string>) {
  if (schema?.[a]) return schema[a];
  return typeof v;
}
