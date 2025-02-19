import React, { useEffect } from "react";
import { Archetype } from "../tempGbExports";
<<<<<<< Updated upstream
import { Text, DropdownMenu, Link } from "@radix-ui/themes";
import { PiCaretDownFill, PiUser } from "react-icons/pi";
=======
import { Text, DropdownMenu, Link, Flex } from "@radix-ui/themes";
import {
  PiCaretDownFill,
  PiCheck,
  PiPencilSimple,
  PiPencilSimpleSlash,
  PiUser,
} from "react-icons/pi";
>>>>>>> Stashed changes
import useApi from "@/app/hooks/useApi";
import useGlobalState from "@/app/hooks/useGlobalState";
import useTabState from "@/app/hooks/useTabState";
import { APP_ORIGIN, CLOUD_APP_ORIGIN } from "@/app/components/Settings";
import { Pi } from "node_modules/@phosphor-icons/react/dist/ssr";

export default function ArchetypesList() {
  const [archetypes, setArchetypes] = useGlobalState<Archetype[]>(
    "allArchetypes",
    [],
    true,
  );
  const [appOrigin, _setAppOrigin, _appOriginReady] = useGlobalState(
    APP_ORIGIN,
    CLOUD_APP_ORIGIN,
    true,
  );
<<<<<<< Updated upstream
=======
  const [appOrigin, _setAppOrigin, _appOriginReady] = useGlobalState(
    APP_ORIGIN,
    CLOUD_APP_ORIGIN,
    true
  );
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
  const [forcedAttributes, setForcedAttributes] = useTabState<boolean>(
    "forcedAttributes",
    false
  );
>>>>>>> Stashed changes

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
        <div className="flex items-center justify-between select-none">
          <Link
            size="2"
            role="button"
            href="#"
            className="block text-nowrap overflow-hidden overflow-ellipsis"
            style={{ maxWidth: "calc(100vw - 120px - 20px - 20px)" }}
          >
            <PiUser className="inline-block mr-1" />
            {selectedArchetype?.name || "Default User"}
          </Link>
          <PiCaretDownFill className="ml-0.5 text-violet-a11" size={12} />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        <DropdownMenu.Item
          onSelect={() => {
            setAttributes({});
            setForcedAttributes(false);
            setSelectedArchetype(null);
          }}
          disabled={!selectedArchetype}
        >
          <Flex gap="1" align="center">
          <div className="w-4">{!selectedArchetype && <PiCheck />}</div> <Text> Default User</Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Archetypes</DropdownMenu.Label>
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
<<<<<<< Updated upstream
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
        <DropdownMenu.Item
=======
>>>>>>> Stashed changes
          onSelect={
            // go to GrowthBook and add a new archetype
            () => {
              window.open(
                `${appOrigin}/archetypes`,
                "_blank",
<<<<<<< Updated upstream
                "noopener,noreferrer",
=======
                "noopener,noreferrer"
>>>>>>> Stashed changes
              );
            }
          }
        >
<<<<<<< Updated upstream
          {" "}
          Add Archetype
=======
          <Flex gap="1" align="center">
          <div className="w-4"> <PiPencilSimple /></div> <Text> Manage Archetypes</Text>{" "}
          </Flex>
>>>>>>> Stashed changes
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
