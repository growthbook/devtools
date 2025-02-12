import * as Accordion from "@radix-ui/react-accordion";
import React, { useState } from "react";
import { Archetype } from "../tempGbExports";
import { Avatar, Button, Container, Flex, Link, Text } from "@radix-ui/themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { PiDotsThreeVerticalBold, PiUserBold } from "react-icons/pi";
import EditableValueField from "./EditableValueField";

function ArchetypeLabel({
  archetype,
  applied,
  applyArchetype,
  deleteArchetype,
  renameArchetype,
}: {
  archetype: Archetype;
  applied: boolean;
  applyArchetype: () => void;
  deleteArchetype: () => void;
  renameArchetype: (newName: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(archetype.name);

  return (
    <div className="flex gap-2 items-center">
      <Avatar
        size="1"
        radius="full"
        fallback={
          archetype.source === "growthbook" ? (
            <img src="logo128.png" alt="GrowthBook" width="16px" />
          ) : (
            <PiUserBold />
          )
        }
      />
      <Flex direction="column" align="start" justify="start" flexGrow="1">
        <Text size="2" weight="medium" className="text-gray-800 line-clamp-1">
          {editingName ? (
            <EditableValueField
              value={localName}
              setValue={setLocalName}
              valueType="string"
            />
          ) : (
            archetype.name
          )}
        </Text>
        <Link role="button" color="gray" size="1">
          View details
        </Link>
      </Flex>
      <Button
        disabled={applied}
        mx="2"
        onClick={() => {
          applyArchetype();
        }}
      >
        Use
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div>
            <Button variant="ghost">
              <PiDotsThreeVerticalBold />
            </Button>
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="bg-violet-2"
            style={{
              minWidth: "100px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DropdownMenu.Item>
              <Button
                disabled={archetype.source !== "local"}
                variant="ghost"
                onClick={(e) => {
                  setEditingName(true);
                }}
              >
                Rename
              </Button>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Button
                disabled={archetype.source !== "local"}
                color="red"
                variant="ghost"
                onClick={deleteArchetype}
              >
                Delete
              </Button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default function ArchetypesList({
  archetypes,
  selectedArchetypeId,
  setSelectedArchetypeId,
  appliedArchetypeId,
  applyArchetype,
  deleteArchetype,
  renameArchetype,
}: {
  archetypes: Archetype[];
  selectedArchetypeId: string | undefined;
  setSelectedArchetypeId: (value: string | undefined) => void;
  appliedArchetypeId: string | undefined;
  applyArchetype: (arch: Archetype) => void;
  deleteArchetype: (archId: string) => void;
  renameArchetype: (archId: string, name: string) => void;
}) {
  return (
    <Container width="100%">
      {archetypes.map((arch) => (
        <Accordion.Root
          key={arch.id}
          collapsible
          type="single"
          value={selectedArchetypeId}
          onValueChange={setSelectedArchetypeId}
          className={clsx("accordionCard w-full mb-2", {
            selected: selectedArchetypeId === arch.id,
            active: appliedArchetypeId === arch.id,
          })}
        >
          <Accordion.Item value={arch.id} className="w-full">
            <Accordion.Trigger asChild className="w-full p-1.5">
              <div>
                <ArchetypeLabel
                  archetype={arch}
                  applied={appliedArchetypeId === arch.id}
                  applyArchetype={() => applyArchetype(arch)}
                  deleteArchetype={() => deleteArchetype(arch.id)}
                  renameArchetype={(name) => renameArchetype(arch.id, name)}
                />
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="accordionInner overflow-hidden w-full">
              <div className="flex flex-col gap-0.5 box mx-2 mb-2 overflow-auto w-100 max-h-[100px] text-xs">
                {Object.keys(arch.attributes).map((key, i) => (
                  <div key={key}>
                    {key}:{" "}
                    <Text truncate>
                      <code>{JSON.stringify(arch.attributes[key])}</code>
                    </Text>
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ))}
    </Container>
  );
}
