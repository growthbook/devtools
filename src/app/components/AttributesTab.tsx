import React, { useEffect, useState } from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import {Button, Checkbox, Dialog, IconButton, Link, RadioGroup, Select} from "@radix-ui/themes";
import { Archetype } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import { useForm } from "react-hook-form";
import {PiAsterisk, PiBookmark, PiGearSix, PiX} from "react-icons/pi";
import SettingsForm, {API_HOST} from "@/app/components/Settings";
import * as Form from "@radix-ui/react-form";

type ArchetypeSource = "growthbook" | "local";
type Archetypes = Record<ArchetypeSource, Archetype[]>;

export default function AttributesTab() {
  const [attributes, setAttributes] = useTabState<Attributes>("attributes", {});
  const attributesForm = useForm<Attributes>({ defaultValues: attributes });
  const formAttributes = attributesForm.getValues();
  const hasAttributes = Object.keys(formAttributes).length > 0;
  const formAttributesString = JSON.stringify(formAttributes, null, 2);
  const [textareaAttributes, setTextareaAttributes] = useState(formAttributesString);
  const [textareaError, setTextareaError] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [jsonMode, setJsonMode] = useTabState(
    "attributesForm_useJsonMode",
    false,
  );

  const [saveUserModalOpen, setSaveUserModalOpen] = useState(false);
  const saveUserForm = useForm({ defaultValues: {
    userType: "__new__",
    userName: "",
  }});
  const submitUserForm = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const values = saveUserForm.getValues();
    console.log({values})
    close?.();
  };

  const [archetypeSource, setArchetypeSource] = useTabState<ArchetypeSource>(
    "archetypeSource",
    "growthbook",
  );
  const [archetypes, setArchetypes] = useTabState<Archetypes>("archetypes", {
    growthbook: [],
    local: [],
  });
  const currArchetypeList = archetypes[archetypeSource];

  const [selectedArchetype, setSelectedArchetype] = useTabState<
    Archetype | undefined
  >("selectedArchetype", undefined);
  const archetypeAttributesForm = useForm<Attributes>({
    defaultValues: selectedArchetype?.attributes || {},
  });

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
            <div className="label mb-2">Saved Users</div>
            <RadioGroup.Root
              value={archetypeSource}
              onValueChange={setArchetypeSource}
            >
              <RadioGroup.Item value="growthbook">Archetypes</RadioGroup.Item>
              <RadioGroup.Item value="local">Saved Users</RadioGroup.Item>
            </RadioGroup.Root>
            <Select.Root
              defaultValue={currArchetypeList[0]?.id}
              value={selectedArchetype?.id}
              onValueChange={(archId) =>
                setSelectedArchetype(
                  currArchetypeList.find((arch) => arch.id === archId),
                )
              }
            >
              <Select.Trigger placeholder="Archetype..." variant="surface" />
            </Select.Root>
          </div>
          {selectedArchetype ? (
            <AttributesForm form={archetypeAttributesForm} />
          ) : null}
        </div>
        <div className="flex-none basis-[50%]">
          <div className="flex items-end justify-between mb-2">
            <div className="label">
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
          />
        </div>
      </div>

      {hasAttributes && (
        <div
          className="flex items-center gap-3 shadow-sm-up fixed bottom-0 left-0 px-3 py-2 w-full bg-zinc-50"
          style={{ height: 50, zIndex: 100000 }}
        >
          <div className="flex-1" />
          <div className="flex items-center gap-3 w-[50%]">
            <Button variant="soft" onClick={() => setSaveUserModalOpen(true)}>
              <PiBookmark />
              Save as...
            </Button>
            <div className="flex-1" />
            {dirty && (
              <>
                <Link href="#" role="button" color="gray" onClick={resetAttributes}>
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

      <Dialog.Root
        open={saveUserModalOpen}
        onOpenChange={(o) => setSaveUserModalOpen(o)}
      >
        <Dialog.Trigger>
          <Button>
            <div className="px-4">
              <PiGearSix size={20} />
            </div>
          </Button>
        </Dialog.Trigger>
        <Dialog.Content className="ModalBody">
          <Dialog.Title>Save User as</Dialog.Title>
          <Form.Root className="FormRoot" onSubmit={submitUserForm}>
            <Select.Root {...saveUserForm.register("userType")}>
              <Select.Trigger variant="surface" className="w-full" />
              <Select.Content>
                <Select.Item value="__new__">New Saved User</Select.Item>
                {/* todo: map local archetypes */}
              </Select.Content>
            </Select.Root>
            {saveUserForm.watch("userType") === "__new__" && (
              <Form.Field className="FormField" name="userName">
                <Form.Label className="FormLabel">Name</Form.Label>
                <Form.Control asChild>
                  <input className="Input" {...saveUserForm.register("userName")} />
                </Form.Control>
              </Form.Field>
            )}
            <div className="mt-8">
              <Form.Submit asChild>
                <Button size="3" className="w-full">
                  Save
                </Button>
              </Form.Submit>
            </div>
          </Form.Root>
          <Dialog.Close
            style={{position: "absolute", top: 5, right: 5}}
          >
            <IconButton
              color="gray"
              highContrast
              size="1"
              variant="outline"
              radius="full"
            >
              <PiX size={20}/>
            </IconButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
