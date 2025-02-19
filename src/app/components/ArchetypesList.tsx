import React, { useEffect } from "react";
import { Archetype } from "../tempGbExports";
import { Text, DropdownMenu, Link, Flex } from "@radix-ui/themes";
import {
  PiCaretDownFill,
  PiCheck,
  PiPencilSimple,
  PiUser,
  PiUserCircle,
} from "react-icons/pi";
import useApi from "@/app/hooks/useApi";
import useGlobalState from "@/app/hooks/useGlobalState";
import useTabState from "@/app/hooks/useTabState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";

export default function ArchetypesList() {
  const [archetypes, setArchetypes] = useGlobalState<Archetype[]>(
    "allArchetypes",
    [],
    true,
  );
  const [appOrigin, _setAppOrigin, _appOriginReady] = useGlobalState(
    APP_ORIGIN,
    CLOUD_APP_ORIGIN,
    true
  );

  const {
    isLoading: archetypesLoading,
    error: archetypesError,
    data: archetypesData,
  } = useApi<{ archetypes: Archetype[] }>("/api/v1/archetypes");

  const [_attributes, setAttributes] = useTabState<Record<string, any>>(
    "attributes",
    {},
  );
  const [forcedAttributes, setForcedAttributes] = useTabState<boolean>(
    "forcedAttributes",
    false,
  );

  const [selectedArchetype, setSelectedArchetype] =
    useTabState<Archetype | null>("selectedArchetype", null);

  const updateArchetype = (arch: Archetype) => {
    setAttributes({ ...arch.attributes });
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
          })),
        ),
    );
  }, [archetypesLoading, archetypesError, archetypesData]);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div className="flex items-center justify-between select-none mt-0.5">
          <Link
            size="2"
            role="button"
            href="#"
            className="block text-nowrap overflow-hidden overflow-ellipsis"
            style={{ maxWidth: "calc(100vw - 120px - 20px - 20px)" }}
          >
            <PiUserCircle className="inline-block mr-1" />
            {selectedArchetype?.name || "Current User"}
          </Link>
          <PiCaretDownFill className="ml-0.5 text-violet-a11" size={12} />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        <DropdownMenu.Label className="font-semibold uppercase text-slate-a10 py-1 h-auto text-xs">
          Preview
        </DropdownMenu.Label>
        <DropdownMenu.Item
          onSelect={() => {
            setAttributes({});
            setForcedAttributes(false);
            setSelectedArchetype(null);
          }}
          disabled={!selectedArchetype}
        >
          <Flex gap="1" align="center">
          <div className="w-4">{!selectedArchetype && <PiCheck />}</div> <Text> Current User</Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label className="font-semibold uppercase text-slate-a10 py-1 h-auto text-xs">
          Archetypes
        </DropdownMenu.Label>
        {archetypes.map((arch) => (
          <DropdownMenu.Item
            key={arch.id}
            onSelect={() => updateArchetype(arch)}
            disabled={selectedArchetype?.id === arch.id}
          >
            <Flex gap="1" align="center">
              <div className="w-4">{selectedArchetype?.id === arch.id && <PiCheck />} </div>
              <Text> {arch.name}</Text>
            </Flex>
          </DropdownMenu.Item>
        ))}

        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={
            // go to GrowthBook and add a new archetype
            () => {
              window.open(
                `${appOrigin}/archetypes`,
                "_blank",
                "noopener,noreferrer"
              );
            }
          }
        >
          <Flex gap="1" align="center">
          <div className="w-4"> <PiPencilSimple /></div> <Text> Manage Archetypes</Text>{" "}
          </Flex>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
