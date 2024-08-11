import {Button, IconButton} from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Heading, HStack, Stack } from "@chakra-ui/layout";
import React, { ReactNode } from "react";
import { MdSync } from "react-icons/md";
import {requestOpenVisualEditor, requestRefresh, setOverrides} from "../controller";
import logo from "./logo.svg";
import useApiKey from "../../visual_editor/lib/hooks/useApiKey";

export interface Props {
  children: ReactNode;
  overrides?: {
    features: Record<string, any>;
    attributes: Record<string, any>;
    variations: Record<string, number>;
  };
}

export default function Layout({ children, overrides }: Props) {

  const { apiHost, apiKey: clientKey } = useApiKey();

  return (
    <Stack p="5" spacing="2" maxW="container.lg" m="0 auto">
      <HStack justifyContent="center">
        <Image src={logo} alt="GrowthBook" w="190px" />

        <Heading as="h1" size="lg" color="gray.500">
          DevTools
        </Heading>

        <IconButton
          size="sm"
          variant="ghost"
          ml={2}
          icon={<MdSync size="18px" />}
          aria-label="Sync with Page"
          title="Sync with Page"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (overrides) {
              setOverrides(overrides);
            }
            requestRefresh();
          }}
        />

        {apiHost && clientKey ? (
          <Button
            display="inline-block"
            py="3"
            height="auto"
            colorScheme="blue"
            onClick={()=>{
              requestOpenVisualEditor({ apiHost, apiKey: clientKey, source: "layout" });
            }}
          >
            <div>Open Visual Editor</div>
            <small>Design a no-code experiment</small>
          </Button>
        ): <div>
          No api host or client key
        </div>}
      </HStack>

      {children}
    </Stack>
  );
}
