import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Code, Flex, Text } from "@radix-ui/themes";

export default function SdkTab() {
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const {
    sdkFound,
    version,
    errorMessage,
    canConnect,
    hasPayload,
    payload,
    devModeEnabled,
  } = sdkData as SDKHealthCheckResult;
  var jsonPretty = payload ? JSON.stringify(payload, null, 2) : "";

  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div className="box mb-3">
      <Text weight="medium" size="4">
        GrowthBook SDK
      </Text>
      {sdkFound ? (
        canConnect ? (
          <Flex pt="2">
            <div>
              <Flex gap="1">
                <Text size="2" weight="medium">
                  Status:
                </Text>
                <Text size="2" weight="light" color="green">
                  Connected
                </Text>
              </Flex>
              <Flex gap="1">
                <Text size="2" weight="medium">
                  Version:
                </Text>
                <Text size="2" weight="light" color="green">
                  {version}
                </Text>
              </Flex>
              <Flex gap="1">
                <Text size="2" weight="medium">
                  Dev mode set:
                </Text>{" "}
                <Text
                  size="2"
                  weight="light"
                  color={devModeEnabled ? "green" : "red"}
                >
                  {devModeEnabled ? "yes" : "no"}
                </Text>{" "}
              </Flex>
            </div>
            {/* <div>
              <Flex direction="row" gap="1">
                <Text size="2" weight="medium">
                  Payload:
                </Text>
              </Flex>
              <Code size="1" style={{ whiteSpace: "pre-wrap" }}>
                {jsonPretty}
              </Code>
            </div> */}
          </Flex>
        ) : hasPayload ? (
          <Flex gap="1">
            <div>
              <div>
                <Flex gap="1">
                  <Text size="2" weight="medium">
                    Status:
                  </Text>
                  <Text size="2" weight="light" color="orange">
                    Not connected
                  </Text>
                </Flex>
                <Text size="1" weight="light"></Text>
              </div>
              <Flex gap="1">
                <Text size="2" weight="medium">
                  Version:
                </Text>
                <Text size="2" weight="light" color="green">
                  {version}
                </Text>
              </Flex>
              <Text size="1" weight="light">
                We found payload but client key is not connected
              </Text>
            </div>
            {/* <div>
              <Flex direction="row" gap="1">
                <Text size="2" weight="medium">
                  Payload:
                </Text>
              </Flex>
              <Code size="1" style={{ whiteSpace: "pre-wrap" }}>
                {jsonPretty}
              </Code>
            </div> */}
          </Flex>
        ) : (
          <div>
            <Flex gap="1">
              <Text size="2" weight="medium">
                Status:
              </Text>
              <Text size="2" weight="light" color="red">
                Not connected
              </Text>
            </Flex>
            <Flex gap="1">
              <Text size="2" weight="medium">
                Error Message:
              </Text>
              <Text size="2" weight="light">
                {errorMessage}
              </Text>
            </Flex>
            {!!version ? (
              <Flex gap="1">
                <Text size="2" weight="medium">
                  Version:
                </Text>
                <Text size="2" weight="light" color="green">
                  {version}
                </Text>
              </Flex>
            ) : (
              <Text size="1" weight="light">
                Version Not Found your version might be less than 0.29.0
              </Text>
            )}
          </div>
        )
      ) : sdkFound === false ? (
        <div>
          <div>
            <Flex gap="1">
              <Text size="2" weight="medium">
                Status:
              </Text>
              <Text size="2" weight="light" color="red">
                No SDK found
              </Text>
            </Flex>
          </div>
          <div>
            <Text size="1" weight="light">
              Refer to the{" "}
              <a
                href="https://docs.growthbook.io/lib/js"
                target="_blank"
                rel="noopener noreferrer"
              >
                Getting Started with GrowthBook SDK
              </a>{" "}
              documentation
            </Text>
          </div>
        </div>
      ) : (
        <div>
          <Text size="2" weight="medium">
            Loading...
          </Text>
        </div>
      )}
    </div>
  );
}
