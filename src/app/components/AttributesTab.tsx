import React from "react";
import { Attributes } from "@growthbook/growthbook";
import useTabState from "../hooks/useTabState";
import { RadioGroup, Select } from "@radix-ui/themes";
import { Archetype } from "../tempGbExports";
import AttributesForm from "./AttributesForm";

type ArchetypeSource = "growthbook" | "local";
type Archetypes = Record<ArchetypeSource, Archetype[]>;

export default function AttributesTab() {
  const [sdkAttributes] = useTabState<Attributes>("sdkAttributes", {});
  const [archetypeSource, setArchetypeSource] = useTabState<ArchetypeSource>(
    "archetypeSource",
    "growthbook"
  );
  const [archetypes, setArchetypes] = useTabState<Archetypes>("archetypes", {
    growthbook: [],
    local: [],
  });
  const [selectedArchetype, setSelectedArchetype] = useTabState<
    Archetype | undefined
  >("selectedArchetype", undefined);

  const currArchetypeList = archetypes[archetypeSource];

  return (
    <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
      <div className="label">Attributes</div>
      <table width="100%">
        <tbody>
          <tr>
            <td width="50%">
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
                <Select.Trigger placeholder="Archetype..." variant="surface" />
              </Select.Root>
              <AttributesForm attributeValues={selectedArchetype?.attributes} />
            </td>
            <td width="50%">
              <AttributesForm attributeValues={sdkAttributes} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
