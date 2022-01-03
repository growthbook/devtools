import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/layout";
import stringify from "json-stringify-pretty-compact";
import DebugLog from "./DebugLog";
import JSONCode from "./JSONCode";

export default function Experiment({ result, experiment, debug }) {
  const { variations, key, ...other } = experiment;

  return (
    <AccordionItem>
      <AccordionButton _expanded={{ bg: "purple.100" }}>
        <HStack spacing="4" flex="1">
          <Badge colorScheme="purple">{key}</Badge>
          <Text isTruncated opacity={0.6} fontSize="sm">
            {JSON.stringify(result.value)}
          </Text>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel bgColor="purple.50">
        <Stack spacing={3} ml={3}>
          <Box>
            <Text fontWeight="bold">Variations</Text>
            <Stack spacing={0} mb={3}>
              {variations.map((v, i) => {
                const isSelected = result.variationId === i;
                return (
                  <Box
                    key={i}
                    bgColor={isSelected ? "blue.300" : "white"}
                    borderWidth={1}
                    p={2}
                  >
                    {stringify(v)}
                  </Box>
                );
              })}
            </Stack>
          </Box>
          {Object.keys(other).length > 0 && (
            <Box>
              <Text fontWeight="bold">Configuration</Text>
              <JSONCode code={other} />
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
