import React, { FC } from "react";
import { Image } from "@chakra-ui/image";
import { Heading } from "@chakra-ui/layout";
import { HStack } from "@chakra-ui/react";
import logo from "./logo.svg";

export const GrowthBookDevToolsHeader: FC = () => {
  return (
    <HStack justifyContent="center">
      <Image src={logo} alt="GrowthBook" w="190px" />

      <Heading as="h1" size="lg" color="gray.500">
        DevTools v2
      </Heading>
    </HStack>
  )
}
