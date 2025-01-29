import React, { useCallback, useEffect, useState } from "react";
import uniqid from "uniqid";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import useGlobalState from "../hooks/useGlobalState";
import { Button, Checkbox, Link, Popover, Select } from "@radix-ui/themes";
import { Archetype, SDKAttribute } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import { PiAsterisk, PiBookmark } from "react-icons/pi";
import * as Form from "@radix-ui/react-form";
import useApi from "../hooks/useApi";
import ArchetypesList from "./ArchetypesList";

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
        attributesData.attributes.map((attr) => [attr.property, attr.datatype])
      )
    );
  }, [attributesLoading, attributesError, attributesData]);

  const [selectedArchetypeId, setSelectedArchetypeId] = useTabState<
    string | undefined
  >("selectedArchetypeId", undefined);
  const selectedArchetype = archetypes.find(
    (arch) => arch.id === selectedArchetypeId
  );

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
    saveArchetypeForm.watch("name").trim().length > 0 &&
    !archetypes.find(
      (archetype) => archetype.name !== saveArchetypeForm.watch("name")
    );
  const submitArchetypeForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = saveArchetypeForm.getValues();
    if (values.type === "new") {
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
    }
    setSaveArchetypeOpen(false);
  };

  const applyAttributes = () => {
    if (!jsonMode) {
      setAttributes(formAttributes);
      attributesForm.reset(formAttributes);
      setDirty?.(false);
    } else {
      try {
        const newAttributes: Attributes = JSON.parse(textareaAttributes);
        if (!newAttributes || typeof newAttributes !== "object") {
          throw new Error("invalid type");
        }
        setAttributes(newAttributes);
        attributesForm.reset(newAttributes);
        setDirty?.(false);
      } catch (e) {
        setTextareaError(true);
      }
    }
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

  return (
    <>
      <div className="flex justify-between items-top">
        <div className="flex-none basis-[50%]">
          <div className="">
            <div className="label lg mb-2">Archetypes</div>
            <ArchetypesList
              archetypes={archetypes}
              selectedArchetypeId={selectedArchetypeId}
              setSelectedArchetypeId={setSelectedArchetypeId}
            />
          </div>
        </div>
        <div className="flex-none basis-[50%]">
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
            <div className="mb-1">
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
        <div
          className="flex items-center gap-3 shadow-sm-up fixed bottom-0 left-0 px-3 py-2 w-full bg-zinc-50"
          style={{ height: 50, zIndex: 100000 }}
        >
          <div className="flex-1 items-center w-[50%]">
            <Button
              disabled={!selectedArchetype}
              onClick={applyArchetype}
              variant="soft"
            >
              Use Archetype
            </Button>
          </div>
          <div className="flex items-center gap-3 w-[50%]">
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
                    <Select.Root
                      size="1"
                      value={saveArchetypeForm.watch("type")}
                      onValueChange={(v) =>
                        saveArchetypeForm.setValue("type", v)
                      }
                    >
                      <Select.Trigger variant="surface" className="w-full" />
                      <Select.Content>
                        {/* TODO: does this need to filter only local archetypes? */}
                        {archetypes.length > 0 && (
                          <Select.Item value="existing">
                            {saveArchetypeForm.watch("name")}
                          </Select.Item>
                        )}
                        <Select.Item value="new">New Archetype</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Form.Field>
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
                  <div className="mt-4">
                    <Form.Submit asChild disabled={!newArchetypeIsValid}>
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
      )}
    </>
  );
}
