import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import App from "src/devtools/_legacy/ui/App";
import { ChakraProvider } from "@chakra-ui/react";
import { Alert, AlertDescription, AlertIcon } from "@chakra-ui/alert";
import { Box, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { onGrowthBookData, requestRefresh } from "src/devtools/_legacy/controller";
import { RefreshMessage } from "devtools";
import { Button } from "@chakra-ui/button";
import Layout from "src/devtools/_legacy/ui/Layout";

function WaitForGrowthBook() {
  const [data, setData] = useState<RefreshMessage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const remove = onGrowthBookData((err, data) => {
      setError(err);
      setData(data);
    });
    requestRefresh();
    return remove;
  }, []);

  if (!data || error) {
    return (
      <Layout>
        {error ? (
          <Box>
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Box mt={3} textAlign="center">
              <Button
                colorScheme="blue"
                onClick={(_e) => {
                  setError("");
                  requestRefresh();
                }}
                type="button"
              >
                Try Again
              </Button>
            </Box>
          </Box>
        ) : (
          <Box textAlign="center" mt={4} mb={4}>
            <Spinner />
            <Text>Trying to connect to page's GrowthBook SDK</Text>
          </Box>
        )}
      </Layout>
    );
  }

  return <App {...data} />;
}

const container = document.getElementById("root");

const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <WaitForGrowthBook />
    </ChakraProvider>
  </React.StrictMode>,
);
