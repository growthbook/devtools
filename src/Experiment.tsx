import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { IconButton } from "@chakra-ui/button";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/layout";
import stringify from "json-stringify-pretty-compact";
import { MdHistory } from "react-icons/md";
import DebugLog from "./DebugLog";
import JSONCode from "./JSONCode";
import type {Result, Experiment as ExperimentInterface, ExperimentOverride} from "@growthbook/growthbook";
import { DebugLogs } from "./types";

export interface Props {
  result: Result;
  experiment: ExperimentInterface;
  override?: ExperimentOverride;
  debug: DebugLogs;
  force: (variation: number) => void;
  unforce: () => void;
  isForced: boolean;
}

export default function Experiment({
  result,
  experiment,
  override,
  debug,
  force,
  unforce,
  isForced,
}: Props) {
  const { variations, key, ...other } = experiment;

  return (
    <AccordionItem>
      <AccordionButton _expanded={{ bg: "purple.100" }}>
        <HStack spacing="4" flex="1">
          <Badge colorScheme="purple">{key}</Badge>
          {isForced && (
            <Box w="8px" h="8px" bgColor="blue.500" rounded="full" title="Overridden" />
          )}
          <Text isTruncated opacity={0.6} fontSize="sm">
            {JSON.stringify(result.value)}
          </Text>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel bgColor="purple.50">
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
              {variations.map((v: any, i: number) => {
                const isSelected = result.variationId === i;
                return (
                  <Box
                    key={i}
                    bgColor={isSelected ? "blue.300" : "white"}
                    borderWidth={1}
                    p={2}
                    cursor="pointer"
                    onClick={() => {
                      force(i);
                    }}
                  >
                    {stringify(v)}
                  </Box>
                );
              })}
            </Stack>
          </Box>
          {Object.keys(other).length > 0 && (
            <Box>
              <Text fontWeight="bold">Definition</Text>
              <JSONCode code={other} />
            </Box>
          )}
          {override && (
            <Box>
              <Text fontWeight="bold">Client Override</Text>
              <JSONCode code={override}/>
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
