import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/accordion";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button, IconButton } from "@chakra-ui/button";
import {
  Badge,
  Box,
  HStack,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/textarea";
import stringify from "json-stringify-pretty-compact";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdEdit, MdHistory } from "react-icons/md";
import DebugLog from "./DebugLog";
import JSONCode from "./JSONCode";
import {
  FeatureResult,
  FeatureDefinition,
  FeatureRule,
} from "@growthbook/growthbook";
import { DebugLogs } from "../../../devtools";
import { Switch } from "@chakra-ui/react";

export interface Props {
  result: FeatureResult;
  feature: FeatureDefinition;
  debug: DebugLogs;
  id: string;
  forceValue: (value: any) => void;
  isForced: boolean;
  unforce: () => void;
}

export default function Feature({
  result,
  feature,
  debug,
  id,
  forceValue,
  isForced,
  unforce,
}: Props) {
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState("");
  const form = useForm({
    defaultValues: {
      value: "",
    },
  });

  const isBoolean = result.value === true || result.value === false;

  // ensure we persist the forced value when page is reloaded
  useEffect(() => {
    if (!isForced) return;
    forceValue(result.value);
  }, [result, feature, isForced]);

  return (
    <AccordionItem>
      <AccordionButton _expanded={{ bg: "gray.100" }}>
        <HStack spacing="2" flex="1">
          <Badge colorScheme="purple">{id}</Badge>
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
            <Text fontWeight="bold">
              Current Value
              {!edit && !isBoolean && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<MdEdit size="16px" />}
                  aria-label="Edit User Attributes"
                  title="Edit User Attributes"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setEdit(true);
                    form.reset({
                      value: stringify(result.value),
                    });
                  }}
                />
              )}
              {isForced && !edit && (
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
            </Text>
            {edit ? (
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  try {
                    const parsed = JSON.parse(values.value);
                    forceValue(parsed);
                    setEdit(false);
                    setError("");
                  } catch (e: any) {
                    setError(e.message);
                  }
                })}
              >
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                <Textarea
                  {...form.register("value")}
                  rows={3}
                  mb={2}
                  autoFocus
                />
                <HStack spacing={2}>
                  <Button colorScheme="purple" type="submit">
                    Override Value
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      setEdit(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                </HStack>
              </form>
            ) : (
              <>
                {isBoolean ? (
                  <Switch
                    colorScheme="purple"
                    isChecked={result.value === true}
                    onChange={(e) => {
                      forceValue(e.target.checked);
                    }}
                  />
                ) : (
                  <JSONCode code={result.value} />
                )}
              </>
            )}
          </Box>
          <Box>
            <Text fontWeight="bold">Default Value</Text>
            <JSONCode code={feature.defaultValue} />
          </Box>
          {feature.rules && feature.rules.length > 0 && (
            <Box>
              <Text fontWeight="bold">Override Rules</Text>
              <OrderedList>
                {feature.rules?.map((rule: FeatureRule, i: number) => {
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
