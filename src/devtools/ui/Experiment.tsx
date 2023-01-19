import React from "react";
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { IconButton } from "@chakra-ui/button";
import { Badge, Box, Flex, HStack, Stack, Text } from "@chakra-ui/layout";
import { MdHistory } from "react-icons/md";
import DebugLog from "./DebugLog";
import JSONCode from "./JSONCode";
import type {
  Result,
  Experiment as ExperimentInterface,
  ExperimentOverride,
} from "@growthbook/growthbook";
import { DebugLogs } from "../../../devtools";
import stringify from "json-stringify-pretty-compact";

export interface Props {
  result: Result<any>;
  experiment: ExperimentInterface<any>;
  override?: ExperimentOverride;
  debug: DebugLogs;
  force: (variation: number) => void;
  unforce: () => void;
  isForced: boolean;
}

const COLORS = [
  "purple",
  "orange",
  "teal",
  "pink",
  "cyan",
  "yellow",
  "green",
  "red",
];

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 2,
});

export default function Experiment({
  result,
  experiment,
  override,
  debug,
  force,
  unforce,
  isForced,
}: Props) {
  const { variations, key, weights, ...other } = experiment;

  return (
    <AccordionItem>
      <AccordionButton _expanded={{ bg: "gray.100" }}>
        <HStack spacing="4" flex="1">
          <Badge colorScheme="purple">{key}</Badge>
          {isForced && (
            <Box
              w="8px"
              h="8px"
              bgColor="blue.500"
              rounded="full"
              title="Overridden"
            />
          )}
          <Text isTruncated opacity={0.6} fontSize="sm">
            {JSON.stringify(result.value)}
          </Text>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel bgColor="gray.50">
        <Stack spacing={3} ml={3}>
          <Box>
            <HStack>
              <Text fontWeight="bold">Variations</Text>
              {isForced && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<MdHistory size="16px" />}
                  aria-label="Revert Override"
                  title="Revert Override"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    unforce();
                  }}
                />
              )}
            </HStack>
            <Stack spacing={0} mb={3}>
              <HStack spacing={0} mb={2} overflowX="hidden">
                {variations.map((_v: any, i: number) => {
                  const isSelected = result.variationId === i;
                  const weight = weights?.[i] ?? 1 / variations.length;
                  const color = COLORS[i % COLORS.length];
                  return (
                    <Box
                      bg={`${color}.500`}
                      overflowX="hidden"
                      h="18px"
                      w={percentFormatter.format(weight)}
                      opacity={isSelected ? 1 : 0.7}
                      transition="opacity 0.3s"
                    >
                      <Text
                        ml="10px"
                        fontSize="10px"
                        lineHeight="18px"
                        color="white"
                        fontWeight="bold"
                      >
                        {Math.round(weight * 100)}%
                      </Text>
                    </Box>
                  );
                })}
              </HStack>
              {variations.map((v: any, i: number) => {
                const isSelected = result.variationId === i;
                const color = COLORS[i % COLORS.length];
                return (
                  <Flex key={i}>
                    <Box
                      w="6px"
                      bg={`${color}.500`}
                      opacity={isSelected ? 1 : 0.7}
                      transition="opacity 0.3s"
                    />
                    <Box
                      flex="1"
                      transition="background-color 0.3s"
                      bgColor={isSelected ? `${color}.100` : "white"}
                      _hover={{
                        bgColor: isSelected ? `${color}.100` : `${color}.50`,
                      }}
                      borderWidth={1}
                      p={2}
                      cursor="pointer"
                      onClick={() => {
                        force(i);
                      }}
                    >
                      {stringify(v)}
                    </Box>
                  </Flex>
                );
              })}
            </Stack>
          </Box>
          {Object.keys(other).length > 0 && (
            <Box>
              <Text fontWeight="bold">Other Settings</Text>
              <JSONCode code={other} />
            </Box>
          )}
          {override && (
            <Box>
              <Text fontWeight="bold">Client Override</Text>
              <JSONCode code={override} />
            </Box>
          )}
          {debug?.length > 0 && (
            <Box>
              <Text fontWeight="bold">Debug Log</Text>
              <DebugLog debug={debug} />
            </Box>
          )}
        </Stack>
      </AccordionPanel>
    </AccordionItem>
  );
}
