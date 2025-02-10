import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Flex, Grid, Text } from "@radix-ui/themes";
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
    streaming,
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

  type displayStatusProps = {
    title: string;
    status?: string | boolean;
    statusColor: "green" | "red" | "gray"| "orange";
  };

  const displayStatus = ({title, status, statusColor} : displayStatusProps) => {
    if (typeof status === "boolean") {
      status = status ? "Yes" : "No";
    }
    return (
      <Flex gap="1">
        <Text size="2" weight="medium">
          {title}:
        </Text>
        <Text size="2" weight="light" color={statusColor}>
          {status}
        </Text>
      </Flex>
    );
  }

  const displayNoSdkFound = () => {
       return ( 
       <div>
          <div>
            {displayStatus({title: "Status", status: "No SDK found", statusColor: "red"})}
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
       );
  }

  const displaySDKFoundStatusesAndPayload = () => {

    const securityStatus = payloadDecrypted ? "Decrypted" : isRemoteEval ? "Remote Eval" : "Plaintext";
    const trackingCallBackStatus = trackingCallbackParams?.length === 2 ? "Found" : !trackingCallbackParams ? "None Found" : `Callback has ${trackingCallbackParams.length} params instead of 2`;
    const TrackingCallbackStatusColor = trackingCallbackParams?.length === 2 ? "green" : !trackingCallbackParams ? "red" : "orange";
    return (
      <Grid columns="2" gap="3">
      <div>
        {displayStatus({title: "Status", status: "Connected", statusColor: "green"})}
        {displayStatus({title: "Version", status: version, statusColor: "gray"})}
        {displayStatus({title: "Tracking Callback", status: trackingCallBackStatus, statusColor: TrackingCallbackStatusColor})}
        {displayStatus({title: "Log Events Callback", status: usingLogEvents, statusColor: "gray"})}
        {displayStatus({title: "Payload Security", status: securityStatus, statusColor: "gray"})}
        {displayStatus({title: "Sticky Bucketing", status: usingStickyBucketing, statusColor: "gray"})}
        {displayStatus({title: "Streaming", status: streaming, statusColor: "gray"})}
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
      </Grid>
    );
  }


  return (
    <div className="box mb-3">
      <Text weight="medium" size="4">
        GrowthBook SDK
      </Text>

      {sdkFound && (
       <>
        {displaySDKFoundStatusesAndPayload()}
       </>
      )}

      {sdkFound === false && (
        <> 
          {displayNoSdkFound()}
        </>
      )}

      {sdkFound === undefined && (
        <div>
          <Text size="2" weight="medium">
            Loading...
          </Text>
        </div>
      )}
    </div>
  );
}
