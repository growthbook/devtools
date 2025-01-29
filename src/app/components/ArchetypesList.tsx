import * as Accordion from "@radix-ui/react-accordion";

import React from "react";
import { Archetype } from "../tempGbExports";
import { Badge, Container, Flex, Text } from "@radix-ui/themes";
import { Image } from "@chakra-ui/image";
import clsx from "clsx";
import style from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark";

function ArchetypeLabel({ archetype }: { archetype: Archetype }) {
  return (
    <Flex width="100%">
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
          <Accordion.Item
            className="mb-2"
            value={arch.id}
            style={{ width: "100%" }}
          >
            <Accordion.Trigger
              className={clsx("accordionCard", {
                selected: selectedArchetypeId === arch.id,
              })}
              style={{ width: "100%" }}
            >
              <ArchetypeLabel archetype={arch} />
            </Accordion.Trigger>
            <Accordion.Content
              className="accordionContent"
              style={{ width: "100%" }}
            >
              <Container>
                {Object.keys(arch.attributes).map((key, i) => (
                  <Container
                    key={key}
                    mb={i < Object.keys(arch.attributes).length - 1 ? "1" : "0"}
                  >
                    {key}:{" "}
                    <Text truncate>
                      <code>{JSON.stringify(arch.attributes[key])}</code>
                    </Text>
                  </Container>
                ))}
              </Container>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ))}
    </Container>
  );
}
