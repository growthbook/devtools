import { Box, Code, Heading, HStack, Text } from "@chakra-ui/layout";
import React from "react";
import { RxCheck, RxClipboard } from "react-icons/rx";
import { useClipboard } from "@chakra-ui/react";

interface ClientInfoProps {
  apiHost: string;
  clientKey: string;
}
export default function ClientInfo(props: ClientInfoProps) {
  const requestUrl = `${props.apiHost}/api/features/${props.clientKey}`;
  const { onCopy: onCopyClientKey, hasCopied: hasCopiedClientKey } =
    useClipboard(props.clientKey);
  const { onCopy: onCopyApiHost, hasCopied: hasCopiedApiHost } = useClipboard(
    props.apiHost,
  );
  const { onCopy: onCopyRequestUrl, hasCopied: hasCopiedRequestUrl } =
    useClipboard(requestUrl);
  return (
    <Box>
      <Heading as="h2" size="md" mb={2}>
        Client configuration
      </Heading>
      <Box my={0.5}>
        <HStack>
          <Text size="sm" color="gray.500" py={1} width={20}>
            Request URL
          </Text>
          <Code p={0.5} px={1} color="red.400" bg="gray.100" borderRadius="md">
            {`${props.apiHost}/api/features/${props.clientKey}`}
          </Code>
          {hasCopiedRequestUrl ? (
            <RxCheck />
          ) : (
            <RxClipboard cursor="pointer" onClick={onCopyRequestUrl} />
          )}
        </HStack>
      </Box>
      <Box my={0.5}>
        <HStack>
          <Text size="sm" color="gray.500" py={1} width={20}>
            API Host
          </Text>
          <Code p={0.5} px={1} color="red.400" bg="gray.100" borderRadius="md">
            {props.apiHost}
          </Code>
          {hasCopiedApiHost ? (
            <RxCheck />
          ) : (
            <RxClipboard cursor="pointer" onClick={onCopyApiHost} />
          )}
        </HStack>
      </Box>
      <Box my={0.5}>
        <HStack>
          <Text size="sm" color="gray.500" py={1} width={20}>
            Key
          </Text>
          <Code p={0.5} px={1} color="red.400" bg="gray.100" borderRadius="md">
            {props.clientKey}
          </Code>
          {hasCopiedClientKey ? (
            <RxCheck />
          ) : (
            <RxClipboard cursor="pointer" onClick={onCopyClientKey} />
          )}
        </HStack>
      </Box>
    </Box>
  );
}
