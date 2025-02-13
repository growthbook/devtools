import React, { useCallback, useEffect, useMemo, useState } from "react";
import uniqid from "uniqid";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGlobalState from "../hooks/useGlobalState";
import {
  Button,
  Checkbox,
  Container,
  Flex,
  Link,
  Popover,
  RadioGroup,
  Text,
} from "@radix-ui/themes";
import { Archetype, SDKAttribute } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import {
  PiArrowClockwise,
  PiArrowSquareOutBold,
  PiAsterisk,
  PiTrash,
} from "react-icons/pi";
import * as Form from "@radix-ui/react-form";
import useApi from "../hooks/useApi";
import ArchetypesList from "./ArchetypesList";
import { MW } from "@/app";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "./Settings";
import { at } from "node_modules/@types/lodash";

export default function AttributesTab() {
  const LABEL_H = 32;
  const SUBHEAD_H = 32;
  const CTAS_H = 50;
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

  const [selectedArchetypeId, setSelectedArchetypeId] = useState<
    string | undefined
  >("");

  const applyArchetype = useCallback(
    (archetype: Archetype) => {
      setAppliedArchetypeId(archetype.id);
      const newAttributes = { ...attributes, ...archetype.attributes };
      setAttributes(newAttributes);
      attributesForm.reset(newAttributes);
      setDirty(false);
    },
    [attributes]
  );

  const deleteArchetype = useCallback(
    (archId: string) => {
      const deleteIndex = archetypes.findIndex((arch) => arch.id === archId);
      if (archetypes[deleteIndex]?.source !== "local") return;
      setArchetypes([
        ...archetypes.slice(0, deleteIndex),
        ...archetypes.slice(deleteIndex + 1),
      ]);
    },
    [archetypes, setArchetypes]
  );

  const renameArchetype = useCallback(
    (archId: string, newName: string) => {
      const editIndex = archetypes.findIndex((arch) => arch.id === archId);
      if (archetypes[editIndex]?.source !== "local") return;
      archetypes[editIndex].name = newName;
      setArchetypes([
        ...archetypes.slice(0, editIndex),
        archetypes[editIndex],
        ...archetypes.slice(editIndex + 1),
      ]);
    },
    [archetypes, setArchetypes]
  );

  const [saveArchetypeOpen, setSaveArchetypeOpen] = useState(false);
  const saveArchetypeForm = useForm({
    defaultValues: {
      type: "new", // "new" | "existing"
      name: "",
    },
  });
  const newArchetypeIsValid =
    saveArchetypeForm.watch("name").trim().length > 0 &&
    !archetypes.find(
      (archetype) => archetype.name === saveArchetypeForm.watch("name")
    );

  const [appliedArchetypeId, setAppliedArchetypeId] = useState("");
  const appliedArchetype = useMemo(() => {
    const arch = archetypes.find((arch) => arch.id === appliedArchetypeId);
    if (arch?.source !== "local") {
      saveArchetypeForm.setValue("type", "new");
    }
    return arch;
  }, [appliedArchetypeId]);

  const canSaveToExistingArchetype = appliedArchetype?.source === "local";

  const submitArchetypeForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = saveArchetypeForm.getValues();
    if (values.type === "new") {
      if (!newArchetypeIsValid) return;
      const archetype: Archetype = {
        id: uniqid("sam_"),
        name: values.name,
        attributes: formAttributes,
        source: "local",
      };
      setArchetypes([...archetypes, archetype]);
      saveArchetypeForm.reset({
        type: "existing",
        name: archetype.name,
      });
    } else {
      if (!appliedArchetype) return;
      const appliedArchIndex = archetypes.findIndex(
        (arch) => arch.id === appliedArchetype.id
      );
      const archetype = archetypes[appliedArchIndex];
      archetype.attributes = formAttributes;
      setArchetypes([
        ...archetypes.slice(0, appliedArchIndex),
        archetype,
        ...archetypes.slice(appliedArchIndex + 1),
      ]);
    }
    setSaveArchetypeOpen(false);
  };

  const applyAttributes = () => {
    let newAttributes: Attributes;
    if (!jsonMode) {
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
    setAttributes(newAttributes);
    attributesForm.reset(newAttributes);
    setDirty(false);
  };

  const resetAttributes = () => {
    attributesForm.reset(attributes);
    setDirty(false);
  };

  const resetAttributesOverride = () => {
    setAttributes({});
    // attributesForm.reset({});
    setDirty(false); // we want to wait for the next render to reset with the initial attributes

  }

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
      <div className="flex justify-between items-top h-[100%]">
        <div className="w-[50%] pl-1 h-[100%]">
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
          <div
            className="attributesForm"
            style={{ height: `calc(100% - ${LABEL_H}px)` }}
          >
            <Flex
              justify="between"
              mb="2"
              pb="1"
              align="center"
              className="border-b border-b-slate-200"
              style={{ height: SUBHEAD_H }}
            >
              <Text size="1" weight="medium">
                {appliedArchetype?.name || "SDK Attributes"}
                {dirty && (
                  <PiAsterisk
                    size={12}
                    color="red"
                    className="inline-block relative"
                    style={{ top: -6 }}
                  />
                )}
              </Text>

              <Flex>
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
                <Button
                  mx="2"
                  size="1"
                  variant="outline"
                  color="red"
                  onClick={() => {
                    setDirty(true);
                    // I'm not sure why, but this reset doesn't apply the first time it's called.
                    // TODO: debug this and remove the extra call
                    resetAttributesOverride();
                  }}
                >
                  <PiTrash />
                  Reset Attributes
                </Button>
              </Flex>
            </Flex>

            <Container
              style={{ height: `calc(100% - ${SUBHEAD_H}px - ${CTAS_H}px)` }}
              overflowY="scroll"
              overflowX="hidden"
            >
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
              />
            </Container>
            <Flex
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
              <Flex px="1" align="center">
                <Button
                  disabled={!dirty}
                  size="2"
                  variant="ghost"
                  role="button"
                  onClick={resetAttributes}
                  mr="4"
                >
                  <PiArrowClockwise />
                  Revert
                </Button>
                <Button disabled={!dirty} size="2" onClick={applyAttributes}>
                  Apply
                </Button>
              </Flex>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  );
}
