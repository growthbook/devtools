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
      <Flex direction="column" pt="2">
        <Flex gap="1">
          <Text size="2" weight="medium">
            Status:
          </Text>
          {canConnect ? (
            <Text size="2" weight="light" color="green">
              Connected
            </Text>
          ) : sdkFound ? (
            <Text size="2" weight="light" color="orange">
              Not connected
            </Text>
          ) : (
            <Text size="2" weight="light" color="red">
              No SDK found
            </Text>
          )}
        </Flex>

        {!sdkFound && (
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
        )}

        {sdkFound && (
          <div>
            <Flex gap="1">
              <Text size="2" weight="medium">
                Version:
              </Text>
              {!!version ? (
                <Text size="2" weight="light" color="green">
                  {version}
                </Text>
              ) : (
                <Text size="1" weight="light">
                  Version Not Found your version might be less than 0.29.0
                </Text>
              )}
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
        )}

        {hasPayload && (
          <div>
            <Flex gap="1">
              <Text size="2" weight="medium">
                Payload:
              </Text>
            </Flex>
            <div className="max-h-[200px] box overflow-auto">
              <Code size="1" style={{ whiteSpace: "pre-wrap" }}>
                {jsonPretty}
              </Code>
            </div>
          </div>
        )}

        {errorMessage && (
          <Flex gap="1">
            <Text size="2" weight="medium">
              Error Message:
            </Text>
            <Text size="2" weight="light">
              {errorMessage}
            </Text>
          </Flex>
        )}
      </Flex>
    </div>
  );
}
