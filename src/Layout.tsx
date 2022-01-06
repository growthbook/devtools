import { IconButton } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Heading, HStack, Stack } from "@chakra-ui/layout";
import { ReactNode } from "react";
import { MdSync } from "react-icons/md";
import { requestRefresh, setOverrides } from "./controller";
import logo from "./logo.svg";

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
      </HStack>
      {children}
    </Stack>
  );
}
