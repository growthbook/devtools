import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import {Button, Flex, Link, TextField} from "@radix-ui/themes";
import { Attributes } from "@growthbook/growthbook";
import { PiPlusCircleFill } from "react-icons/pi";
import {
  attributeDataTypes, primitiveDataTypes,
  SDKAttribute,
  SDKAttributeType,
} from "@/app/tempGbExports";
import { useResponsiveContext } from "@/app/hooks/useResponsive";
import SelectField from "../Forms/SelectField";
import clsx from "clsx";

export default function AddCustomAttribute({
  formAttributes,
  addCustomField,
  schema,
}: {
  formAttributes: Attributes;
  addCustomField: (fieldName: string, fieldType: SDKAttributeType) => void;
  schema?: Record<string, SDKAttribute>;
}) {
  const { isResponsive } = useResponsiveContext();
  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const addCustomIdRef = useRef<HTMLInputElement>(null);
  const [addCustomType, setAddCustomType] =
    useState<SDKAttributeType>("string");

  const unusedSchemaAttributes = Object.keys(schema || {}).filter(
    (key) =>
      !Object.prototype.hasOwnProperty.call(formAttributes, key) &&
      key.includes(addCustomIdRef?.current?.value || ""),
  );

  const cancelAddCustomField = () => {
    setAddingCustom(false);
    setAddCustomId("");
    setAddCustomType("string");
  };

  const submit = useCallback(() => {
    addCustomField(addCustomId, addCustomType);
    cancelAddCustomField();
  }, [addCustomId, addCustomType]);

  useEffect(() => {
    if (schema?.[addCustomId]) {
      setAddCustomType(schema[addCustomId].datatype);
    } else if (!primitiveTypes.has(addCustomType)) {
      setAddCustomType("string");
    }
  }, [addCustomId]);

  const attributeTypeReadable = (type: SDKAttributeType) => {
    switch (type) {
      case "string":
        return "String";
      case "number":
        return "Number";
      case "boolean":
        return "Boolean";
      case "enum":
        return "Enum";
      case "secureString":
        return "Secure String";
      case "string[]":
        return "String Array";
      case "number[]":
        return "Num Array";
      case "secureString[]":
        return "Secure String Array";
    }
  };

  const primitiveTypes = new Set([
    "string",
    "number",
    "boolean",
    "string[]",
    "number[]",
  ]);

  if (!addingCustom)
    return (
      <Button
        color="violet"
        variant="ghost"
        size="2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAddingCustom(true);

          const container = document.querySelector("#pageBody");
          window.setTimeout(() => {
            container?.scroll?.({
              top: container?.scrollHeight,
              behavior: "smooth",
            });
          }, 50);
        }}
        className="flex mt-1"
      >
        <PiPlusCircleFill />
        Add Field
      </Button>
    );

  return (
    <Form.Root className="FormRoot pb-2 small" onSubmit={submit}>
      <Flex direction={isResponsive ? "column" : "row"} gapX="2" gapY="1">
        <Form.Field className="FormFieldInline my-1" name="type">
          <Flex
            direction={isResponsive ? "row" : "column"}
            pr={!isResponsive ? "2" : undefined}
            justify="between"
            flexGrow="1"
          >
            <Form.Label className="FormLabel text-nowrap text-sm">
              <div className={clsx("inline-block -mb-1 overflow-hidden overflow-ellipsis", { "mt-1" : isResponsive })}>
                Field Type
              </div>
            </Form.Label>

            <Flex
              align="center"
              flexGrow="1"
              ml={isResponsive ? "2" : "0"}
              minWidth="150px"
              maxWidth="350px"
            >
              <SelectField
                value={addCustomType}
                options={(Object.keys(schema ?? {}).includes(addCustomId) ? attributeDataTypes : primitiveDataTypes).map((opt) => ({
                  label: attributeTypeReadable(opt),
                  value: opt,
                }))}
                formatOptionLabel={(val) => val.label}
                isOptionDisabled={(opt) => !primitiveTypes.has(opt.value)}
                onChange={(v) => setAddCustomType(v as SDKAttributeType)}
                disabled={!!schema?.[addCustomId]}
                className="w-full text-sm"
                isSearchable
                menuPlacement="top"
              />
            </Flex>
          </Flex>
        </Form.Field>
        <Form.Field className="FormFieldInline my-1 flex-grow" name="name">
          <Flex
            direction={isResponsive ? "row" : "column"}
            justify="between"
            flexGrow="1"
          >
            <Form.Label className="FormLabel text-nowrap text-sm">
              <div className={clsx("inline-block -mb-1 overflow-hidden overflow-ellipsis", {"mt-1": isResponsive})}>
                Field Name
              </div>
            </Form.Label>
            <Flex
              align="center"
              flexGrow="1"
              ml={isResponsive ? "2" : "0"}
              maxWidth="350px"
              minWidth="200px"
            >
              {Object.keys(schema || {}).length ? (
              <SelectField
                className="w-full text-sm"
                creatable
                isClearable
                isSearchable
                options={unusedSchemaAttributes.map((attr) => ({
                  value: attr,
                  label: attr,
                }))}
                formatOptionLabel={(value) => (
                  <div className="text-nowrap line-clamp-1">{value.label}</div>
                )}
                value={addCustomId}
                onChange={setAddCustomId}
                formatCreateLabel={(val) => `Use custom field name "${val}"`}
                validOptionPattern=".+"
                menuPlacement="top"
              />
              ) : (
                <TextField.Root
                  type="text"
                  onChange={(e) => {
                    setAddCustomId(e.target.value);
                  }}
                  value={addCustomId}
                  className="w-full"
                />
              )}
            </Flex>
          </Flex>
        </Form.Field>
        <Flex
          my="1"
          direction={isResponsive ? "row" : "column"}
          justify="end"
        >
          <label className="FormLabel text-nowrap">
            <div className="inline-block -mb-1 overflow-hidden overflow-ellipsis"></div>
          </label>
          <Flex align="center" gapX="3">
            <Button
              type="button"
              disabled={!addCustomId.trim()}
              size="2"
              onClick={submit}
              className="flex-shrink-0"
              ml="2"
            >
              Add field
            </Button>
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
          </Flex>
        </Flex>
      </Flex>
    </Form.Root>
  );
}
