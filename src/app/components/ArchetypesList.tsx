import * as Accordion from "@radix-ui/react-accordion";
import React from "react";
import { Archetype } from "../tempGbExports";
import {Avatar, Badge, Container, Flex, Text} from "@radix-ui/themes";
import clsx from "clsx";
import {PiUserBold} from "react-icons/pi";

function ArchetypeLabel({ archetype }: { archetype: Archetype }) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar
        size="1"
        radius="full"
        fallback={
          archetype.source === "growthbook"
            ? <img src="logo128.png" alt="GrowthBook" width="16px" />
            : <PiUserBold />
        }
      />
      <span className="text-xs text-gray-800">
        {archetype.name}
      </span>
    </div>
  );
}

export default function ArchetypesList({
  archetypes,
  selectedArchetypeId,
  setSelectedArchetypeId,
  appliedArchetypeId,
}: {
  archetypes: Archetype[];
  selectedArchetypeId: string | undefined;
  setSelectedArchetypeId: (value: string | undefined) => void;
  appliedArchetypeId: string | undefined;
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
          <Accordion.Item
            value={arch.id}
            className="w-full"
          >
            <Accordion.Trigger className="w-full p-1.5">
              <ArchetypeLabel archetype={arch} />
            </Accordion.Trigger>
            <Accordion.Content
              className="accordionInner overflow-hidden w-full"
            >
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
