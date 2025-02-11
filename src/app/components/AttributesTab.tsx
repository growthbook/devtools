import React, { useCallback, useEffect, useMemo, useState } from "react";
import uniqid from "uniqid";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGlobalState from "../hooks/useGlobalState";
import {
  Button,
  Checkbox,
  Link,
  Popover,
  RadioGroup,
  Select,
} from "@radix-ui/themes";
import { Archetype, SDKAttribute } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import { PiAsterisk, PiBookmark } from "react-icons/pi";
import * as Form from "@radix-ui/react-form";
import useApi from "../hooks/useApi";
import ArchetypesList from "./ArchetypesList";
import { isMatch } from "lodash";
import { MW } from "@/app";

export default function AttributesTab() {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const attributesForm = useForm<Attributes>({ defaultValues: attributes });
  const formAttributes = attributesForm.getValues();
  const hasAttributes = Object.keys(formAttributes).length > 0;
  const formAttributesString = JSON.stringify(formAttributes, null, 2);
  const [textareaAttributes, setTextareaAttributes] =
    useState(formAttributesString);
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [jsonMode, setJsonMode] = useTabState(
    "attributesForm_useJsonMode",
    false
  );

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
  >("selectedArchetypeId");
  const selectedArchetype = archetypes.find(
    (arch) => arch.id === selectedArchetypeId
  );

  const currAttributes = attributesForm.watch();
  const appliedArchetypeId = useMemo(() => {
    // isMatch checks for a subset rather than full equality, so if all of the archetype's attributes
    // are included in the attr form and unchanged then it's considered in-use
    return archetypes.find((arch) => isMatch(currAttributes, arch.attributes))
      ?.id;
  }, [currAttributes, archetypes]);

  const applyArchetype = useCallback(() => {
    if (!selectedArchetype) return;
    attributesForm.reset({ ...attributes, ...selectedArchetype.attributes });
    setDirty(true);
  }, [selectedArchetype]);

  const [saveArchetypeOpen, setSaveArchetypeOpen] = useState(false);
  const saveArchetypeForm = useForm({
    defaultValues: {
      type: "new", // "new" | "existing"
      name: "",
      id: "",
    },
  });
  const newArchetypeIsValid =
    saveArchetypeForm.watch("type") === "new" &&
    saveArchetypeForm.watch("name").trim().length > 0 &&
    !archetypes.find(
      (archetype) => archetype.name === saveArchetypeForm.watch("name")
    );
  const existingArchetypeIsValid =
    saveArchetypeForm.watch("type") === "existing" &&
    !!archetypes.find(
      (archetype) => archetype.id === saveArchetypeForm.watch("id")
    );
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
        id: archetype.id,
      });
    } else {
      if (!existingArchetypeIsValid) return;
      const existingArchIndex = archetypes.findIndex(
        (arch) => arch.id === values.id
      );
      const archetype = archetypes[existingArchIndex];
      archetype.attributes = formAttributes;
      setArchetypes([
        ...archetypes.slice(0, existingArchIndex),
        archetype,
        ...archetypes.slice(existingArchIndex + 1),
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
    setDirty?.(false);
  };

  const resetAttributes = () => {
    attributesForm.reset(attributes);
    setDirty?.(false);
  };

  // listen to SDK changes to set attributes form
  useEffect(() => {
    if (!dirty) {
      attributesForm.reset(attributes);
    }
  }, [JSON.stringify(attributes)]);

  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div className={`max-w-[${MW}px] mx-3`}>
      <div className="flex justify-between items-top">
        <div className="w-[50%] pr-2">
          <div className="">
            <div className="label lg mb-2">Archetypes</div>
            <ArchetypesList
              archetypes={archetypes}
              selectedArchetypeId={selectedArchetypeId}
              setSelectedArchetypeId={setSelectedArchetypeId}
              appliedArchetypeId={appliedArchetypeId}
            />
          </div>
        </div>
        <div className="w-[50%] pl-1">
          <div className="flex items-end justify-between mb-2">
            <div className="label lg">
              User Attributes
              {dirty && (
                <PiAsterisk
                  size={12}
                  color="red"
                  className="inline-block relative"
                  style={{ top: -6 }}
                />
              )}
            </div>
            <div className="mb-1 mr-1">
              <label className="flex items-center text-xs cursor-pointer select-none">
                <Checkbox
                  checked={jsonMode}
                  onCheckedChange={(v) => setJsonMode(!jsonMode)}
                  size="1"
                  mr="1"
                  className="cursor-pointer"
                />
                <span>JSON input</span>
              </label>
            </div>
          </div>
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
        </div>
      </div>

      {hasAttributes && (
        <div className="flex items-center justify-center shadow-sm-up fixed bottom-0 left-0 px-3 py-2 w-full h-[50px] z-front bg-zinc-50">
          <div className={`w-full max-w-[${MW}px] mx-auto flex items-center`}>
            <div className="w-[50%] pr-2 flex items-center">
              <Button
                disabled={!selectedArchetype}
                onClick={applyArchetype}
                variant="soft"
              >
                Use Archetype
              </Button>
            </div>
            <div className="w-[50%] pl-1 flex items-center gap-3">
              <Popover.Root
                open={saveArchetypeOpen}
                onOpenChange={(o) => setSaveArchetypeOpen(o)}
              >
                <Popover.Trigger>
                  <Button variant="soft">
                    <PiBookmark />
                    Save...
                  </Button>
                </Popover.Trigger>
                <Popover.Content style={{ width: 200 }}>
                  <Form.Root
                    className="FormRoot small"
                    onSubmit={submitArchetypeForm}
                  >
                    <Form.Field className="FormField" name="type">
                      <Form.Label className="FormLabel">
                        Save User Attributes as...
                      </Form.Label>
                      <RadioGroup.Root
                        value={saveArchetypeForm.watch("type")}
                        onValueChange={(value) => {
                          saveArchetypeForm.setValue("type", value);
                          saveArchetypeForm.setValue(
                            "id",
                            value === "new"
                              ? ""
                              : selectedArchetype?.id || archetypes[0]?.id || ""
                          );
                        }}
                      >
                        <RadioGroup.Item value="new">
                          New Archetype
                        </RadioGroup.Item>
                        <RadioGroup.Item value="existing">
                          Update Existing Archetype
                        </RadioGroup.Item>
                      </RadioGroup.Root>
                    </Form.Field>
                    {saveArchetypeForm.watch("type") === "new" ? (
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
                    ) : (
                      <Form.Field className="FormField" name="id">
                        <Form.Label className="FormLabel">Archetype</Form.Label>
                        <Select.Root
                          size="1"
                          value={saveArchetypeForm.watch("id")}
                          onValueChange={(v) => {
                            saveArchetypeForm.setValue("id", v);
                          }}
                        >
                          <Select.Trigger
                            variant="surface"
                            className="w-full"
                          />
                          <Select.Content>
                            {archetypes.map((arch) => (
                              <Select.Item key={arch.id} value={arch.id}>
                                {arch.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Form.Field>
                    )}

                    <div className="mt-4">
                      <Form.Submit
                        asChild
                        disabled={
                          !(
                            (saveArchetypeForm.watch("type") === "new" &&
                              newArchetypeIsValid) ||
                            (saveArchetypeForm.watch("type") === "existing" &&
                              existingArchetypeIsValid)
                          )
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
              <div className="flex-1" />
              {dirty && (
                <>
                  <Link
                    href="#"
                    size="2"
                    role="button"
                    color="gray"
                    onClick={resetAttributes}
                  >
                    Reset
                  </Link>
                  <Button type="button" size="2" onClick={applyAttributes}>
                    Apply
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
