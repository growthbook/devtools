import React, {useEffect} from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import {Checkbox, RadioGroup, Select} from "@radix-ui/themes";
import { Archetype } from "../tempGbExports";
import AttributesForm from "./AttributesForm";
import {useForm} from "react-hook-form";

type ArchetypeSource = "growthbook" | "local";
type Archetypes = Record<ArchetypeSource, Archetype[]>;

export default function AttributesTab() {
  const [sdkAttributes] = useTabState<Attributes>("sdkAttributes", {});
  const attributesForm = useForm<Attributes>({ defaultValues: sdkAttributes });
  const [jsonMode, setJsonMode] = useTabState("attributesForm_useJsonMode", false);

  const [archetypeSource, setArchetypeSource] = useTabState<ArchetypeSource>(
    "archetypeSource",
    "growthbook"
  );
  const [archetypes, setArchetypes] = useTabState<Archetypes>("archetypes", {
    growthbook: [],
    local: [],
  });
  const currArchetypeList = archetypes[archetypeSource];

  const [selectedArchetype, setSelectedArchetype] = useTabState<
    Archetype | undefined
  >("selectedArchetype", undefined);
  const archetypeAttributesForm = useForm<Attributes>({ defaultValues: selectedArchetype?.attributes || {} });

  // listen to SDK changes to set attributes form
  useEffect(() => {
    attributesForm.reset(sdkAttributes)
  }, [JSON.stringify(sdkAttributes)]);

  return (
    <div className="flex justify-between items-top">
      <div className="flex-none basis-[49%] px-3 py-2 border border-gray-200x rounded-lg bg-white">
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
              currArchetypeList.find((arch) => arch.id === archId)
            )
          }
        >
          <Select.Trigger placeholder="Archetype..." variant="surface"/>
        </Select.Root>
        {selectedArchetype ? (
          <AttributesForm
            form={archetypeAttributesForm}
          />
        ): null}
      </div>
      <div className="flex-none basis-[49%] box px-3 py-2 border border-gray-200x rounded-lg bg-white">
        <div className="flex items-end justify-between mb-2">
          <div className="label">User Attributes</div>
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
          jsonMode={jsonMode}
        />
      </div>
    </div>
  );
}
