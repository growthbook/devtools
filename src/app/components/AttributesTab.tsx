import React, { useEffect, useState } from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGlobalState from "../hooks/useGlobalState";
import {
  Button,
  Checkbox,
  Container,
  Flex,
  Text,
} from "@radix-ui/themes";
import { Archetype, SDKAttribute } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import { PiXBold } from "react-icons/pi";
import useApi from "../hooks/useApi";
import { MW } from "@/app";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "./Settings";

export default function AttributesTab({ isResponsive } : { isResponsive: boolean }) {
  const LABEL_H = 32;
  const SUBHEAD_H = 32;
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const attributesForm = useForm<Attributes>({ defaultValues: attributes });
  const formAttributes = attributesForm.getValues();
  const formAttributesString = JSON.stringify(formAttributes, null, 2);
  const [textareaAttributes, setTextareaAttributes] =
    useState(formAttributesString);
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [jsonMode, setJsonMode] = useTabState(
    "attributesForm_useJsonMode",
    false
  );
  const [forcedAttributes, setForcedAttributes] = useTabState<boolean>(
    "forcedAttributes",
    false
  );
  const [newAppliedAttributeIds, setNewAppliedAttributeIds] = useTabState<
    string[]
  >("newAppliedAttributeIds", []);

  const [appOrigin] = useGlobalState(APP_ORIGIN, CLOUD_APP_ORIGIN, true);

  const [archetypes, setArchetypes] = useGlobalState<Archetype[]>(
    "allArchetypes",
    [],
    true
  );
  const {
    isLoading: archetypesLoading,
    error: archetypesError,
    data: archetypesData,
  } = useApi<{ archetypes: Archetype[] }>("/api/v1/archetypes");

  useEffect(() => {
    if (archetypesLoading || archetypesError || !archetypesData) return;
    setArchetypes(
      archetypes
        .filter((arch) => arch.source === "local")
        .concat(
          (archetypesData.archetypes || []).map((arch) => ({
            ...arch,
            source: "growthbook",
          }))
        )
    );
  }, [archetypesLoading, archetypesError, archetypesData]);

  const [attributeSchema, setAttributeSchema] = useGlobalState<
    Record<string, string>
  >("attributeSchema", {}, true);

  const {
    isLoading: attributesLoading,
    error: attributesError,
    data: attributesData,
  } = useApi<{ attributes: SDKAttribute[] }>("/api/v1/attributes");

  useEffect(() => {
    if (attributesLoading || attributesError || !attributesData) return;
    setAttributeSchema(
      Object.fromEntries(
        (attributesData.attributes || []).map((attr) => [
          attr.property,
          attr.datatype,
        ])
      )
    );
  }, [attributesLoading, attributesError, attributesData]);

  const [selectedArchetype, setSelectedArchetype] = useTabState<
    Archetype | undefined
  >("selectedArchetype", undefined);

  const applyAttributes = () => {
    let newAttributes: Attributes;
    if (!jsonMode) {
      // check to see if the two objects are the same to avoid unnecessary updates
      newAttributes = formAttributes;
    } else {
      try {
        newAttributes = JSON.parse(textareaAttributes);
        if (!newAttributes || typeof newAttributes !== "object") {
          throw new Error("invalid type");
        }
      } catch (e) {
        setTextareaError(true);
        return;
      }
    }
    const newOverriddenAttributes = Object.fromEntries(
      Object.keys(newAttributes)
        .filter((key: string) => {
          return (
            JSON.stringify(newAttributes[key]) !==
            JSON.stringify(attributes[key])
          );
        })
        .map((key: string) => {
          if (!attributes.hasOwnProperty(key)) {
            setNewAppliedAttributeIds([...newAppliedAttributeIds, key]);
          }
          return [key, newAttributes[key]];
        })
    );
    // check if newAttributes has any keys that are removed from attributes
    Object.keys(attributes).forEach((key) => {
      (key: string) => {
        if (!newAttributes.hasOwnProperty(key)) {
          setNewAppliedAttributeIds(
            newAppliedAttributeIds.filter((id) => id !== key)
          );
        }
      };
    });
    if (Object.keys(newOverriddenAttributes).length > 0) {
      setForcedAttributes(true);
      setSelectedArchetype(undefined);
      setAttributes({ ...attributes, ...newOverriddenAttributes });
    } else if (Object.keys(newAttributes).length === 0) {
      setSelectedArchetype(undefined);
      setForcedAttributes(false);
    }
    attributesForm.reset({ ...attributes, ...newAttributes });
    setDirty(false);
  };

  const resetAttributesOverride = () => {
    setForcedAttributes(false);
    setNewAppliedAttributeIds([]);
    setSelectedArchetype(undefined);
    setAttributes({});
    setDirty(false); // we want to wait for the next render to reset with the initial attributes
  };

  // listen to SDK changes to set attributes form
  useEffect(() => {
    if (!dirty) {
      attributesForm.reset(attributes);
    }
  }, [JSON.stringify(attributes)]);

  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div
      className="mx-auto px-3 h-[100%]"
      style={{
        maxWidth: MW,
        overflowX: "hidden",
      }}
    >
      <div
        className="flex justify-between items-top h-[100%] mx-auto"
        style={{ maxWidth: 600 }}
      >
        <div className="w-[100%] pl-1 h-[100%]">
          <Flex style={{ height: LABEL_H }} align="center">
            <Text
              my="2"
              weight="medium"
              color="gray"
              size="1"
              className="uppercase"
            >
              User Attributes
            </Text>
          </Flex>
          <div className="attributesForm">
            <Flex
              justify="between"
              mb="2"
              pb="1"
              align="center"
              className="border-b border-b-slate-200"
              style={{ height: SUBHEAD_H }}
            >
              <Flex gap="2" align="center">
                <Text size="1" weight="medium">
                  {forcedAttributes
                    ? selectedArchetype?.name || "Custom Attributes"
                    : "User Attributes"}
                </Text>
                {forcedAttributes && (
                  <Button
                    color="amber"
                    variant="solid"
                    radius="full"
                    size="1"
                    onClick={(e) => {
                      e.preventDefault();
                      resetAttributesOverride();
                    }}
                    className="flex gap-1 items-center bg-amber-200 text-amber-700 hover:bg-amber-300"
                  >
                    Clear override
                    <PiXBold />
                  </Button>
                )}
              </Flex>
              <label className="flex items-center text-xs cursor-pointer select-none">
                <Checkbox
                  checked={jsonMode}
                  onCheckedChange={() => setJsonMode(!jsonMode)}
                  size="1"
                  mr="1"
                  className="cursor-pointer"
                />
                <span>JSON input</span>
              </label>
            </Flex>

            <Container className="p-3" overflowX="hidden">
              <AttributesForm
                form={attributesForm}
                dirty={dirty}
                setDirty={setDirty}
                jsonMode={jsonMode}
                textareaAttributes={textareaAttributes}
                setTextareaAttributes={setTextareaAttributes}
                textareaError={textareaError}
                setTextareaError={setTextareaError}
                schema={attributeSchema}
                saveOnBlur={applyAttributes}
              />
            </Container>
            {/* <Flex
              align="center"
              justify="between"
              width="100%"
              className="shadow-sm-up border-t border-t-slate-200 px-3"
              style={{ height: CTAS_H }}
            >
              <Popover.Root
                open={saveArchetypeOpen}
                onOpenChange={(o) => setSaveArchetypeOpen(o)}
              >
                <Popover.Trigger>
                  <Button variant="ghost">Save...</Button>
                </Popover.Trigger>
                <Popover.Content style={{ width: 200 }}>
                  <Form.Root
                    className="FormRoot small"
                    onSubmit={submitArchetypeForm}
                  >
                    {canSaveToExistingArchetype && (
                      <Form.Field className="FormField" name="type">
                        <Form.Label className="FormLabel">
                          Save User Attributes as...
                        </Form.Label>
                        <RadioGroup.Root
                          value={saveArchetypeForm.watch("type")}
                          onValueChange={(value) => {
                            saveArchetypeForm.setValue("type", value);
                          }}
                        >
                          <RadioGroup.Item value="new">
                            New Archetype
                          </RadioGroup.Item>
                          <RadioGroup.Item value="existing">
                            Update "{appliedArchetype.name}"
                          </RadioGroup.Item>
                        </RadioGroup.Root>
                      </Form.Field>
                    )}
                    {saveArchetypeForm.watch("type") === "new" && (
                      <Form.Field className="FormField" name="name">
                        <Form.Label className="FormLabel">
                          Archetype Name
                        </Form.Label>
                        <Form.Control asChild>
                          <input
                            className="Input"
                            {...saveArchetypeForm.register("name")}
                          />
                        </Form.Control>
                      </Form.Field>
                    )}
                    <div className="mt-2">
                      <Form.Submit
                        asChild
                        disabled={
                          (saveArchetypeForm.watch("type") === "new" &&
                            !newArchetypeIsValid) ||
                          (saveArchetypeForm.watch("type") === "existing" &&
                            !canSaveToExistingArchetype)
                        }
                      >
                        <Button size="1" className="w-full">
                          Save
                        </Button>
                      </Form.Submit>
                    </div>
                  </Form.Root>
                </Popover.Content>
              </Popover.Root>
            </Flex> */}
          </div>
        </div>
      </div>
    </div>
  );
}
