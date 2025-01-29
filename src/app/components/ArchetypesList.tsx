import * as Accordion from "@radix-ui/react-accordion";

import React from "react";
import { Archetype } from "../tempGbExports";
import { Badge, Container, Flex } from "@radix-ui/themes";
import { Image } from "@chakra-ui/image";

function ArchetypeLabel({ archetype }: { archetype: Archetype }) {
  return (
    <Flex className="bg-white" width="100%">
      {archetype.name}{" "}
      <Badge>
        {archetype.source === "growthbook" ? (
          <Image src="logo128.png" alt="GrowthBook" w="16px" />
        ) : (
          "DevTools"
        )}
      </Badge>
    </Flex>
  );
}

export default function ArchetypesList({
  archetypes,
  selectedArchetypeId,
  setSelectedArchetypeId,
}: {
  archetypes: Archetype[];
  selectedArchetypeId: string | undefined;
  setSelectedArchetypeId: (value: string | undefined) => void;
}) {
  return (
    <Container width="100%">
      {archetypes.map((arch) => (
        <Accordion.Root
          key={arch.id}
          collapsible
          type="single"
          style={{ width: "100%" }}
          value={selectedArchetypeId}
          onValueChange={setSelectedArchetypeId}
        >
          <Accordion.Item value={arch.id} style={{ width: "100%" }}>
            <Accordion.Trigger style={{ width: "100%" }}>
              <ArchetypeLabel archetype={arch} />
            </Accordion.Trigger>
            <Accordion.Content style={{ width: "100%" }}>
              <Container style={{ border: "2px solid black" }}>
                {Object.keys(arch.attributes).map((key) => (
                  <div className="bg-white" key={key}>
                    {key}: {arch.attributes[key]}
                  </div>
                ))}
              </Container>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ))}
    </Container>
  );
}
