import { IconButton } from "@chakra-ui/button";
import { HStack, Stack } from "@chakra-ui/layout";
import React, { ReactNode } from "react";
import { MdSync } from "react-icons/md";
import { GrowthBookDevToolsHeader } from "../../components/GrowthBookDevToolsHeader/GrowthBookDevToolsHeader";
import { requestRefresh, setOverrides } from "../controller";

export interface Props {
  children: ReactNode;
  overrides?: {
    features: Record<string, any>;
    attributes: Record<string, any>;
    variations: Record<string, number>;
  };
}

export default function Layout({ children, overrides }: Props) {
  return (
    <Stack p="5" spacing="2" maxW="container.lg" m="0 auto">
      <HStack justifyContent="center">
        <GrowthBookDevToolsHeader />

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
      </HStack>
      {children}
    </Stack>
  );
}
