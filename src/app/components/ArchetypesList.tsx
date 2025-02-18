import React, { useEffect } from "react";
import { Archetype } from "../tempGbExports";
import {
  Text,
  DropdownMenu, Link,
} from "@radix-ui/themes";
import {PiCaretDownFill, PiUser} from "react-icons/pi";
import useApi from "@/app/hooks/useApi";
import useGlobalState from "@/app/hooks/useGlobalState";
import useTabState from "@/app/hooks/useTabState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";

export default function ArchetypesList() {
  const [archetypes, setArchetypes] = useGlobalState<Archetype[]>(
    "allArchetypes",
    [],
    true
  );
    const [appOrigin, _setAppOrigin, _appOriginReady] = useGlobalState(
      APP_ORIGIN,
      CLOUD_APP_ORIGIN,
      true,
    );

  const {
    isLoading: archetypesLoading,
    error: archetypesError,
    data: archetypesData,
  } = useApi<{ archetypes: Archetype[] }>("/api/v1/archetypes");

  const [attributes, setAttributes] = useTabState<Record<string, any>>(
    "attributes",
    {}
  );
  const [forcedAttributes, setForcedAttributes] = useTabState<
  boolean>("forcedAttributes",false)

  const [selectedArchetype, setSelectedArchetype] = useTabState<
    Archetype | undefined
  >("selectedArchetype", undefined);

  const updateArchetype = (arch: Archetype) => {
    setAttributes({ archetypes, ...arch.attributes });
    setForcedAttributes(true);
    setSelectedArchetype(arch);
  };
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
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div className="flex items-center justify-between select-none">
          <Link
            size="2"
            role="button"
            href="#"
            className="block text-nowrap overflow-hidden overflow-ellipsis"
            style={{ maxWidth: "calc(100vw - 120px - 20px - 20px)" }}
          >
            <PiUser className="inline-block mr-1" />
            {selectedArchetype?.name || "Current User"}
          </Link>
          <PiCaretDownFill
            className="ml-0.5 text-violet-a11"
            size={12}
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        <DropdownMenu.Label>Archetypes</DropdownMenu.Label>
        {archetypes.map((arch) => (
          <DropdownMenu.Item
            key={arch.id}
            onSelect={() => updateArchetype(arch)}
          >
            <Text>{arch.name}</Text>
          </DropdownMenu.Item>
        ))}

        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={() => {
            setAttributes({});
            setForcedAttributes(false);
            setSelectedArchetype(undefined);
          }}
          color="red"
          disabled={!selectedArchetype}
        >
          Clear Override
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={
          // go to GrowthBook and add a new archetype
          () => {
            window.open(`${appOrigin}/archetypes`, "_blank", "noopener,noreferrer");
          }
        }> Add Archetype</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
