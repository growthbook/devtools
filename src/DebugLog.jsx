import { Box } from "@chakra-ui/layout";
import stringify from "json-stringify-pretty-compact";

export default function DebugLog({ debug }) {
  return (
    <Box
      bgColor="gray.700"
      color="white"
      p={2}
      as="pre"
      fontSize="sm"
      maxH={300}
      overflowY="auto"
    >
      {debug.map(([msg, ctx], i) => {
        const {rule, id, condition, ...other} = ctx;
        const ruleJSON = stringify(rule);
        const otherJSON = stringify(other);
        return (
          <Box mb={2} key={i}>
            &gt; {msg}
            {ruleJSON &&  ruleJSON !== "{}" && (
              <Box color="gray.400" fontSize="xs" ml={4}>
                {ruleJSON}
              </Box>
            )}
            {otherJSON &&  otherJSON !== "{}" && (
              <Box color="gray.400" fontSize="xs" ml={4}>
                {otherJSON}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
