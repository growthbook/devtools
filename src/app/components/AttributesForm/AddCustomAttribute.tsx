import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useResponsiveContext } from "@/app/hooks/useResponsive";

export default function AddCustomAttribute({
  formAttributes,
  addCustomField,
  schema,
}: {
  formAttributes: Attributes;
  addCustomField: (fieldName: string, fieldType: SDKAttributeType) => void;
  schema?: Record<string, SDKAttributeType>;
}) {
  const { isTiny } = useResponsiveContext();
  const [addingCustom, setAddingCustom] = useState(false);
  const [addCustomId, setAddCustomId] = useState("");
  const [addCustomIdDropdownOpen, setAddCustomIdDropdownOpen] = useState(false);
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
  }, [addCustomId, addCustomType]);

  useEffect(() => {
    if (schema?.[addCustomId]) {
      setAddCustomType(schema[addCustomId]);
    }
  }, [addCustomId]);

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

  return addingCustom ? (
    <Form.Root className="pb-2">
      <Form.Field className="FormFieldInline my-1 w-full" name="type">
        <Flex direction={isTiny ? "row" : "column"}>
          <Form.Label className="FormLabel mr-1 text-nowrap">
            <div className="inline-block -mb-2 overflow-hidden overflow-ellipsis">
              Field Type
            </div>
          </Form.Label>
        </Flex>
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
                  submit();
                  setAddCustomIdDropdownOpen(false);
                }
              }}
            >
              <DropdownMenu.Root
                open={addCustomIdDropdownOpen}
                onOpenChange={(o) => {
                  setTimeout(() => {
                    if (!o && document.activeElement === addCustomIdRef.current)
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
                      setAddCustomIdDropdownOpen(true);
                    }}
                    side="right"
                  >
                    <PiCaretDownFill />
                  </TextField.Slot>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="end"
                  onCloseAutoFocus={() => addCustomIdRef?.current?.focus()}
                >
                  <div id="schema-attributes">
                    {unusedSchemaAttributes.map((key) => (
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
            onValueChange={(v) => setAddCustomType(v as SDKAttributeType)}
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
          onClick={submit}
        >
          Add field
        </Button>
      </div>
    </Form.Root>
  ) : (
    <Button
      color="violet"
      variant="ghost"
      size="2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAddingCustom(true);
        setAddCustomIdDropdownOpen(true);

        const container = document.querySelector("#attributesTab");
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
  );
}
