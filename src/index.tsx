import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { Container, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { onGrowthBookData, requestRefresh } from "./controller";
import { RefreshMessage } from "./types";

function WaitForGrowthBook() {
  const [data, setData] = useState<RefreshMessage | null>(null);

  useEffect(() => {
    const remove = onGrowthBookData((data) => {
      setData(data);
    });
    requestRefresh();
    return remove;
  }, []);

  if (!data) {
    return (
      <Container textAlign="center" p={5}>
        <Spinner />
        <Text>Trying to connect to page's GrowthBook SDK</Text>
      </Container>
    );
  }

  return (
    <App
      features={data.features}
      experiments={data.experiments}
      attributes={data.attributes}
    />
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <WaitForGrowthBook />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);