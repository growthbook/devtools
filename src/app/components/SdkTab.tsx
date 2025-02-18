import React, { useEffect, useState } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { ChevronDownIcon, Flex, Grid, Link, Text } from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import { MW } from "@/app";

export default function SdkTab({ isResponsive } : { isResponsive: boolean }) {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    undefined,
  );
  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const {
    sdkFound,
    version,
    errorMessage,
    canConnect,
    hasPayload,
    payload,
    trackingCallbackParams,
    hasDecryptionKey,
    payloadDecrypted,
    usingLogEvents,
    isRemoteEval,
    usingStickyBucketing,
    streaming,
    apiHost,
    clientKey,
    streamingHost,
    streamingHostRequestHeaders,
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
    statusColor: "green" | "red" | "gray" | "orange";
    id: string;
  };

  const displayStatus = ({
    title,
    status,
    statusColor,
    id,
  }: displayStatusProps) => {
    if (typeof status === "boolean") {
      status = status ? "Yes" : "No";
    }
    return (
      <Flex
        gap="1"
        className="sdkDebugListItem"
        align="center"
        justify="between"
        px="3"
        onClick={() => setSelectedItem(id)}
      >
        <Text size="2" weight="medium">
          {title}
        </Text>
        <Flex gap="3" align="center">
          <Text size="2" weight="light" color={statusColor}>
            {status}
          </Text>
        </Flex>
      </Flex>
    );
  };

  const displayNoSdkFound = () => {
    return (
      <div>
        <div>
          {displayStatus({
            id: "status",
            title: "Status",
            status: "No SDK found",
            statusColor: "red",
          })}
        </div>
        <div>
          <Text size="1" weight="light">
            Refer to the{" "}
            <Link
              href="https://docs.growthbook.io/lib/js"
              target="_blank"
              rel="noopener noreferrer"
            >
              Getting Started with GrowthBook SDK
            </Link>{" "}
            documentation
          </Text>
        </div>
      </div>
    );
  };

  const displayRightPanel = () => {
    switch (selectedItem) {
      case "payload":
        return <ValueField value={payload} valueType="json" maxHeight={276} />;
      case "status":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Status
            </Text>
            <Text as="div" size="2" weight="regular" mb="2">
              {canConnect
                ? "The SDK is connected to the GrowthBook API."
                : "The SDK is not connected to the GrowthBook API."}
            </Text>
            <Text as="div" size="2" weight="regular">
              <strong>Host </strong> {apiHost ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular">
              <strong>Client Key </strong> {clientKey ?? "None"}
            </Text>
            {errorMessage && (
              <Text as="div" size="2" weight="light">
                error: {errorMessage ?? "None"}
              </Text>
            )}
          </div>
        );
      case "version":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Version
            </Text>
            <Text as="div" size="2" weight="regular">
              {!version ? (
                <Text>
                  "unable to find your sdk version this might be because your on
                  a old version of the SDK and consider updating to the lastest"
                </Text>
              ) : (
                <Text>
                  {" "}
                  you are on <strong>{version}</strong> version make sure that
                  you have all the features you require
                </Text>
              )}
            </Text>
          </div>
        );
      case "trackingCallback":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Tracking Callback
            </Text>
            <Text as="div" size="2" weight="regular">
              {trackingCallbackParams?.length === 2
                ? "The SDK is using a tracking callback."
                : !trackingCallbackParams
                  ? "The SDK is not using a tracking callback. you will need to add one to track events to your data warehouse.."
                  : `The SDK is using a tracking callback with ${trackingCallbackParams.length} params instead of 2. please check your implementation.`}
            </Text>
          </div>
        );
      case "logEvents":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Log Events Callback
            </Text>
            <Text as="div" size="2" weight="regular">
              {usingLogEvents
                ? "The SDK is using a log events callback. "
                : "The SDK is not using a log events callback. Log events is optional but you can add one to track events to your data warehouse."}
            </Text>
          </div>
        );
      case "security":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Payload Security
            </Text>
            <Text as="div" size="2" weight="regular">
              {hasDecryptionKey
                ? payloadDecrypted
                  ? "The SDK is using a decryption key and the payload is not being decrypted. please check you have the correct decryption key."
                  : "The SDK is using a decryption key and the payload is being decrypted."
                : isRemoteEval
                  ? "The SDK is using remote evaluation."
                  : "The SDK is not using a decryption key or remote eval. The payload is in plain text."}
            </Text>
          </div>
        );
      case "stickyBucketing":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Sticky Bucketing
            </Text>
            <Text as="div" size="2" weight="regular">
              {usingStickyBucketing
                ? "The SDK is using sticky bucketing."
                : "The SDK is not using sticky bucketing. Sticky bucketing is optional and used to ensure that users are consistently bucketed into the same experiment."}
            </Text>
          </div>
        );
      case "streaming":
        return (
          <div className="sdkDebugDetailedView">
            <Text as="div" weight="medium">
              Streaming
            </Text>
            <Text as="div" size="2" weight="regular">
              {streaming
                ? "The SDK is using streaming."
                : "The SDK is not using streaming. Streaming is optional and used to update the SDK with the latest data without refreshing the page."}
            </Text>
            <Text as="div" size="2" weight="regular">
              <strong>Host </strong> {streamingHost ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular">
              <strong>Client Key </strong> {clientKey ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular">
              <strong>Streaming host request headers </strong>{" "}
              {JSON.stringify(streamingHostRequestHeaders) ?? "None"}
            </Text>
          </div>
        );
      default:
        return null;
    }
  };

  const displaySDKFoundStatusesAndPayload = () => {
    const decryptedStatus = payloadDecrypted ? "Decrypted" : "DecryptionError";
    const securityStatus = hasDecryptionKey
      ? decryptedStatus
      : isRemoteEval
        ? "Remote Eval"
        : "Plain Text";
    const trackingCallBackStatus =
      trackingCallbackParams?.length === 2
        ? "Found"
        : !trackingCallbackParams
          ? "None Found"
          : `Callback has Incorrect Amount of Params`;
    const TrackingCallbackStatusColor =
      trackingCallbackParams?.length === 2
        ? "green"
        : !trackingCallbackParams
          ? "red"
          : "orange";
    const canConnectStatus = canConnect ? "Connected" : "Not Connected";
    const canConnectStatusColor = canConnect
      ? "green"
      : hasPayload
        ? "orange"
        : "red";

    return (
      <Grid columns="2" gap="3">
        <Flex direction="column" gap="1">
          {displayStatus({
            id: "status",
            title: "Status",
            status: canConnectStatus,
            statusColor: canConnectStatusColor,
          })}
          {displayStatus({
            id: "version",
            title: "Version",
            status: version,
            statusColor: "gray",
          })}
          {displayStatus({
            id: "trackingCallback",
            title: "Tracking Callback",
            status: trackingCallBackStatus,
            statusColor: TrackingCallbackStatusColor,
          })}
          {displayStatus({
            id: "logEvents",
            title: "Log Events Callback",
            status: usingLogEvents,
            statusColor: "gray",
          })}
          {displayStatus({
            id: "security",
            title: "Payload Security",
            status: securityStatus,
            statusColor: "gray",
          })}
          {displayStatus({
            id: "stickyBucketing",
            title: "Sticky Bucketing",
            status: usingStickyBucketing,
            statusColor: "gray",
          })}
          {displayStatus({
            id: "streaming",
            title: "Streaming",
            status: streaming,
            statusColor: "gray",
          })}
          {displayStatus({
            id: "payload",
            title: "Payload",
            status: hasPayload,
            statusColor: "gray",
          })}
        </Flex>
        {displayRightPanel()}
      </Grid>
    );
  };

  return (
    <div className="mx-auto px-2" style={{ maxWidth: MW }}>
      <Text weight="medium" size="4" as="div" className="py-3">
        GrowthBook SDK
      </Text>

      {sdkFound && <>{displaySDKFoundStatusesAndPayload()}</>}

      {sdkFound === false && <>{displayNoSdkFound()}</>}

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
