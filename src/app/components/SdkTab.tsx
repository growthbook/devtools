import React, { useEffect } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Flex, Grid, Link, Text } from "@radix-ui/themes";
import { Prism } from "react-syntax-highlighter";
import {ghcolors as codeTheme} from "react-syntax-highlighter/dist/esm/styles/prism";
import ValueField from "@/app/components/ValueField";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill } from "react-icons/pi";

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
      <Flex gap="1" className="sdkDebugListItem" align="center" justify="between" px="3">
        <Text size="2" weight="medium">
          {title}
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

    const decryptedStatus = payloadDecrypted ? "Decrypted" : "DecryptionError";
    const securityStatus =  hasDecryptionKey ? decryptedStatus : isRemoteEval ? "Remote Eval" : "Plain Text";
    const trackingCallBackStatus = trackingCallbackParams?.length === 2 ? "Found" : !trackingCallbackParams ? "None Found" : `Callback has ${trackingCallbackParams.length} params instead of 2`;
    const TrackingCallbackStatusColor = trackingCallbackParams?.length === 2 ? "green" : !trackingCallbackParams ? "red" : "orange";
    const canConnectStatus = canConnect ? "Connected" : "Not Connected";
    const canConnectStatusColor = canConnect ? "green" : hasPayload? "orange" : "red";

    return (
      <Grid gap="2" columns="2">
        <Flex direction="column" gap="1">
          {displayStatus({title: "Status", status: canConnectStatus, statusColor: canConnectStatusColor})}
          {displayStatus({title: "Version", status: version, statusColor: "gray"})}
          {displayStatus({title: "Tracking Callback", status: trackingCallBackStatus, statusColor: TrackingCallbackStatusColor})}
          {displayStatus({title: "Log Events Callback", status: usingLogEvents, statusColor: "gray"})}
          {displayStatus({title: "Payload Security", status: securityStatus, statusColor: "gray"})}
          {displayStatus({title: "Sticky Bucketing", status: usingStickyBucketing, statusColor: "gray"})}
          {displayStatus({title: "Streaming", status: streaming, statusColor: "gray"})}
        </Flex>
        {payload ? (
          <Accordion.Root
            className="accordion"
            type="single"
            collapsible
          >
            <Accordion.Item value="Payload">
              <Accordion.Trigger className="trigger mb-0.5">
                <Link
                  size="2"
                  role="button"
                  className="hover:underline"
                >
                  <PiCaretRightFill
                    className="caret mr-0.5"
                    size={12}
                  />
                  Payload
                </Link>
              </Accordion.Trigger>
              <Accordion.Content className="accordionInner overflow-hidden w-full">
                <ValueField
                  value={payload}
                  valueType="json"
                  maxHeight={276}
                />
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        ) : null}
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
