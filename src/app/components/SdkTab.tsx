import React from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Code, Flex, Text } from "@radix-ui/themes";

export default function SdkTab() {
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const { sdkFound, version, errorMessage, canConnect, hasPayload, payload } = sdkData as SDKHealthCheckResult;
  console.log("data for sdk", sdkData);
  var jsonPretty = payload ? JSON.stringify(payload, null, 2) : "";  

  return (
    <div className="box mb-3 Z">
      <Text weight="medium" size="4">GrowthBook SDK</Text>
      {sdkFound ? (
        canConnect ? (
          <Flex pt="2">
            <div>
              <Flex gap="1">
                <Text size="2" weight="medium">Status:</Text>
                <Text size="2" weight="light" color="green">Connected</Text>
              </Flex>
              <Flex gap="1">
                <Text size="2" weight="medium">Version:</Text>
                <Text size="2" weight="light" color="green">{version}</Text>
              </Flex>
            </div>
          </Flex>
        ) :  hasPayload ?(
          <div>
            <div>
            <Flex gap="1">
              <Text size="2" weight="medium">Status:</Text>
              <Text size="2" weight="light" color="orange">Not connected</Text>
            </Flex>
            <Text size="1" weight="light"></Text>
            </div>
            <Flex gap="1">
              <Text size="2" weight="medium">Version:</Text>
              <Text size="2" weight="light" color="green">{version}</Text>
            </Flex>
          </div>
        ) : (
          <div>
            <h4>🔴 SDK not connected</h4>
            <div><strong>API error message: </strong><em> {errorMessage}</em></div>
            {!!version ? <div><strong>SDK Version: </strong> <em>{version}</em></div> :
            <div> <em>Version Not Found your version might be less than 0.29.0</em></div>}
          </div>
      )
      ) : sdkFound === false ? (
        <div>
          <h4>⚪ no SDK present</h4>
          <em>Refer to the <a href="https://docs.growthbook.io/lib/js" target="_blank" rel="noopener noreferrer">Getting Started with GrowthBook SDK</a> documentation</em>
        </div>
        ) : (
        <div>
          <em>Loading...</em>
        </div>
      )}
    </div>
  );
}
