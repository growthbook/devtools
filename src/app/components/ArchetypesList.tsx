import * as Accordion from "@radix-ui/react-accordion";
import React from "react";
import { Archetype } from "../tempGbExports";
import { Avatar, Button, Container, Flex, Link, Text } from "@radix-ui/themes";
import clsx from "clsx";
import { PiUserBold } from "react-icons/pi";

function ArchetypeLabel({
  archetype,
  applied,
  applyArchetype,
}: {
  archetype: Archetype;
  applied: boolean;
  applyArchetype: () => void;
}) {
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
          {archetype.name}
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
    </div>
  );
}

export default function ArchetypesList({
  archetypes,
  selectedArchetypeId,
  setSelectedArchetypeId,
  appliedArchetypeId,
  applyArchetype,
}: {
  archetypes: Archetype[];
  selectedArchetypeId: string | undefined;
  setSelectedArchetypeId: (value: string | undefined) => void;
  appliedArchetypeId: string | undefined;
  applyArchetype: (arch: Archetype) => void;
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
