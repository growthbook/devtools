import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Flex, Text } from "@radix-ui/themes";
import { Prism } from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
import { max } from "node_modules/@types/lodash";

export default function SdkTab() {
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const {
    sdkFound,
    version,
    errorMessage,
    canConnect,
    hasPayload,
    payload,
    hasTrackingCallback,
    trackingCallbackParams,
    hasDecryptionKey,
    payloadDecrypted,
    usingLogEvents,
    isRemoteEval,
    usingStickyBucketing,
    streamingHost,
  } = sdkData as SDKHealthCheckResult;

  const customTheme = {
    padding: "5px",
    margin: 0,
    border: "0px none",
    backgroundColor: "transparent",
    whiteSpace: "pre-wrap",
    lineHeight: "12px",
    maxHeight: 200,
  };
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
            <div style={{width:"50%"}}>
              <Flex gap="1" justify="between">
                <Text size="2" weight="medium">
                  Status:
                </Text>
                <Text size="2" weight="light" color="green">
                  Connected
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
                <Text size="2" weight="medium">
                  Version:
                </Text>
                <Text size="2" weight="light" color="green">
                  {version}
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
              <Text size="2" weight="medium">
                  Tacking Callback:
                </Text>
                <Text size="2" weight="light" color={usingStickyBucketing && trackingCallbackParams?.length === 2 ? "green" : "red"}>
                  {hasTrackingCallback} (params: {trackingCallbackParams?.join(", ")})
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
              <Text size="2" weight="medium">
                  Log Events:
                </Text>
                <Text size="2" weight="light" color={usingLogEvents ? "green" : "red"}>
                  {usingLogEvents ? "Has custom" : "not set"}
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
              <Text size="2" weight="medium">
                  Decrypted Payload:
                </Text>
                <Text size="2" weight="light" color={payloadDecrypted ? "green" : "red"}>
                  {payloadDecrypted? "payload is encryped": "payload is not encryped"} 
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
              <Text size="2" weight="medium">
                  Remote Eval:
                </Text>
                <Text size="2" weight="light" color={isRemoteEval ? "green" : "red"}>
                  {isRemoteEval? "using remote eval": "remote eval not set"} 
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
                <Text size="2" weight="medium">
                  Sticky Bucketing:
                </Text>
                <Text size="2" weight="light" color={usingStickyBucketing ? "green" : "red"}>
                  {usingStickyBucketing? "using stricky bucketing": "not using"} 
                </Text>
              </Flex>
              <Flex gap="1" justify="between">
                <Text size="2" weight="medium">
                  Streaming Host:
                </Text>
                <Text size="2" weight="light" color={streamingHost ? "green" : "red"}>
                  {streamingHost? streamingHost : "not set"} 
                </Text>
              </Flex>
            </div>
            <div style={{width:"50%"}}>
                         <Prism
                    language="json"
                    style={codeTheme}
                    customStyle={{...customTheme}}
                    codeTagProps={{
                      className: "text-2xs-important !whitespace-pre-wrap",
                    }}
                  >
                    {jsonPretty}
                  </Prism>
            </div>
          
          </Flex>
        ) : hasPayload ? (
          <Flex gap="1">
            <div>
              <div>
              <Flex gap="1" justify="between">
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
              <Flex gap='1'>
              <Text size="2" weight="medium">
                  Tacking Callback:
                </Text>
                <Text size="2" weight="light" color={usingStickyBucketing && trackingCallbackParams?.length === 2 ? "green" : "red"}>
                  {hasTrackingCallback} (params: {trackingCallbackParams?.join(", ")})
                </Text>
              </Flex>
              <Flex gap='1'>
              <Text size="2" weight="medium">
                  Log Events:
                </Text>
                <Text size="2" weight="light" color={usingLogEvents ? "green" : "red"}>
                  {usingLogEvents ? "Has custom" : "not set"}
                </Text>
              </Flex>
              <Flex gap='1'>
              <Text size="2" weight="medium">
                  Decrypted Payload:
                </Text>
                <Text size="2" weight="light" color={payloadDecrypted ? "green" : "red"}>
                  {payloadDecrypted? "payload is encryped": "payload is not encryped"} 
                </Text>
              </Flex>
              <Flex gap='1'>
              <Text size="2" weight="medium">
                  Remote Eval:
                </Text>
                <Text size="2" weight="light" color={isRemoteEval ? "green" : "red"}>
                  {isRemoteEval? "using remote eval": "remote eval not set"} 
                </Text>
              </Flex>
              <Flex gap='1'>
                <Text size="2" weight="medium">
                  Sticky Bucketing:
                </Text>
                <Text size="2" weight="light" color={usingStickyBucketing ? "green" : "red"}>
                  {usingStickyBucketing? "using stricky bucketing": "not using"} 
                </Text>
              </Flex>
              <Flex gap='1'>
                <Text size="2" weight="medium">
                  Streaming Host:
                </Text>
                <Text size="2" weight="light" color={streamingHost ? "green" : "red"}>
                  {streamingHost? streamingHost : "not set"} 
                </Text>
              </Flex>
              <Text size="1" weight="light">
                We found payload but client key is not connected
              </Text>
            </div>
              <div>
                 <Text size="2" weight="medium">
                    Payload:
                  </Text>
                  <Prism
                    language="json"
                    style={codeTheme}
                    customStyle={{...customTheme}}
                    codeTagProps={{
                      className: "text-2xs-important !whitespace-pre-wrap",
                    }}
                  >
                    {jsonPretty}
                  </Prism>
            </div>
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
