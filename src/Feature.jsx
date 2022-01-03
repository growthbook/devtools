import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import {
  Badge,
  Box,
  HStack,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from "@chakra-ui/layout";
import DebugLog from "./DebugLog";
import JSONCode from "./JSONCode";

export default function Feature({ result, feature, debug, id }) {
  return (
    <AccordionItem>
      <AccordionButton _expanded={{ bg: "purple.100" }}>
        <HStack spacing="4" flex="1">
          <Badge colorScheme="purple">{id}</Badge>
          <Text isTruncated opacity={0.6} fontSize="sm">
            {JSON.stringify(result.value)}
          </Text>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel bgColor="purple.50">
        <Stack spacing={3} ml={3}>
          <Box>
            <Text fontWeight="bold">Current Value</Text>
            <JSONCode code={result.value} />
          </Box>
          <Box>
            <Text fontWeight="bold">Default Value</Text>

            <JSONCode code={feature.defaultValue} />
          </Box>
          {feature.rules?.length > 0 && (
            <Box>
              <Text fontWeight="bold">Override Rules</Text>
              <OrderedList>
                {feature.rules?.map((rule, i) => {
                  const { condition, ...other } = rule;
                  return (
                    <ListItem key={i} mb={3}>
                      {condition && (
                        <HStack spacing={3}>
                          <Text>IF</Text>
                          <Box>
                            <JSONCode code={condition} />
                          </Box>
                        </HStack>
                      )}
                      <HStack spacing={3}>
                        {condition && <Text>THEN</Text>}
                        <Box>
                          <JSONCode code={other} />
                        </Box>
                      </HStack>
                    </ListItem>
                  );
                })}
              </OrderedList>
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
