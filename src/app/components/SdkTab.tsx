import React, { useEffect, useState } from "react";
import useTabState from "../hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import {IconButton, Link, Text} from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import {MW, NAV_H} from "@/app";
import clsx from "clsx";
import {PiXBold} from "react-icons/pi";

const customTheme = {
  padding: "5px",
  margin: 0,
  border: "0px none",
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  lineHeight: "12px",
  maxHeight: 200,
};

export const LEFT_PERCENT = 0.4;

export default function SdkTab({ isResponsive } : { isResponsive: boolean }) {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    !isResponsive ? "status" : undefined
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
    usingLogEvent,
    isRemoteEval,
    usingStickyBucketing,
    streaming,
    apiHost,
    clientKey,
    streamingHost,
    streamingHostRequestHeaders,
  } = sdkData as SDKHealthCheckResult;

  const decryptedStatus = payloadDecrypted ? "Decrypted" : "DecryptionError";
  const securityStatus = hasDecryptionKey
    ? decryptedStatus
    : isRemoteEval
      ? "Remote Eval"
      : "Plain Text";
  const trackingCallbackStatus =
    trackingCallbackParams?.length === 2
      ? "Found"
      : !trackingCallbackParams
        ? "None Found"
        : `Callback has Incorrect Amount of Params`;
  const trackingCallbackStatusColor =
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

  useEffect(() => window.scrollTo({ top: 0 }), []);

  const displayRightPanel = () => {
    switch (selectedItem) {
      case "payload":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              SDK Payload
            </h1>
            <ValueField value={payload} valueType="json" maxHeight={null}/>
          </div>
        );
      case "status":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              SDK Status
            </h1>
            <Text as="div" size="2" weight="regular" mb="2">
              {canConnect
                ? "The SDK is connected to the GrowthBook API."
                : "The SDK is not connected to the GrowthBook API."}
            </Text>
            <Text as="div" size="2" weight="regular">
              <label className="inline-block font-semibold" style={{ width: 150 }}>Host:</label> {apiHost ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular">
              <label className="inline-block font-semibold" style={{ width: 150 }}>Client Key:</label> {clientKey ?? "None"}
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
          <div>
            <h1 className="text-md mb-4 font-bold">
              SDK Version
            </h1>
            <Text as="div" size="2" weight="regular">
              {!version ? (
                <Text>
                  Unable to find your SDK version. You might be using
                  an old version of the SDK. Consider updating to the latest version.
                </Text>
              ) : (
                <Text>
                  {" "}
                  You are on version <strong>{version}</strong> of the JavaScript SDK.
                </Text>
              )}
            </Text>
          </div>
        );
      case "trackingCallback":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              Tracking Callback
            </h1>
            <Text as="div" size="2" weight="regular">
              {trackingCallbackParams?.length === 2
                ? (<>The SDK is using a <code className="text-pink-700">trackingCallback</code>.</>)
                : !trackingCallbackParams
                ? (<>The SDK is not using a <code className="text-pink-700">trackingCallback</code>. You will need to
                    add one to track experiment exposure to your data warehouse.</>)
                : (<>The SDK is using a <code className="text-pink-700">trackingCallback</code> with {trackingCallbackParams.length} params instead of 2. Please check your implementation.</>)
              }
            </Text>
          </div>
        );
      case "logEvent":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              Log Event Callback
            </h1>
            <Text as="div" size="2" weight="regular">
              {usingLogEvent
                ? (<>The SDK is using a <code className="text-pink-700">logEvent</code> callback.</>)
                : (<>The SDK is not using a <code className="text-pink-700">logEvent</code> callback. This callback is
                  optional but you can add one to track events to your data warehouse.</>)
              }
            </Text>
          </div>
        );
      case "security":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              Payload Security
            </h1>
            <Text as="div" size="2" weight="regular">
              {hasDecryptionKey
                ? payloadDecrypted
                  ? "The SDK is using a decryption key and the payload is not being decrypted. Please check you have the correct decryption key."
                  : "The SDK is using a decryption key and the payload is being decrypted."
                : isRemoteEval
                  ? "The SDK is using remote evaluation."
                  : "The SDK is not using a decryption key or remote evaluation. The payload is in plain text."}
            </Text>
          </div>
        );
      case "stickyBucketing":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              Sticky Bucketing
            </h1>
            <Text as="div" size="2" weight="regular">
              {usingStickyBucketing
                ? "The SDK is using sticky bucketing."
                : "The SDK is not using sticky bucketing. Sticky bucketing is optional and is used to ensure that users are consistently bucketed."}
            </Text>
          </div>
        );
      case "streaming":
        return (
          <div>
            <h1 className="text-md mb-4 font-bold">
              Streaming
            </h1>
            <Text as="div" size="2" weight="regular" mb="2">
              {streaming
                ? "The SDK is using streaming (SSE)."
                : "The SDK is not using streaming (SSE). Streaming is optional and is used to update the SDK with the latest data without refreshing the page."}
            </Text>
            <Text as="div" size="2" weight="regular">
              <label className="inline-block font-semibold" style={{ width: 150 }}>Streaming host:</label> {streamingHost ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular">
              <label className="inline-block font-semibold" style={{ width: 150 }}>Client
                Key:</label> {clientKey ?? "None"}
            </Text>
            <Text as="div" size="2" weight="regular" mt="2">
              <label className="inline-block font-semibold mr-2">Streaming host request
                headers:</label>
              <div className="mt-1">
                {JSON.stringify(streamingHostRequestHeaders) ?? "None"}
              </div>
            </Text>
          </div>
        );
      default:
        return null;
    }
  };

  const fullWidthListView = !selectedItem;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;
  const rightPercent = isResponsive ? 1 : 1 - LEFT_PERCENT;

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: MW,
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: `${leftPercent * 100}vw`,
          maxWidth: MW * leftPercent,
        }}
      >
        {sdkFound === false && <NoSdkFound />}

        {sdkFound === undefined && (
          <div>
            <Text size="2" weight="medium">
              Loading...
            </Text>
          </div>
        )}

        {sdkFound === true && (
          <>
            <div
              key={`sdkTab_sdkItems_status`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "status",
              })}
              onClick={() => setSelectedItem("status")}
            >
              <ItemStatus title="Status" status={canConnectStatus} color={canConnectStatusColor}/>
            </div>

            <div
              key={`sdkTab_sdkItems_version`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "version",
              })}
              onClick={() => setSelectedItem("version")}
            >
              <ItemStatus title="Version" status={version} color="gray"/>
            </div>

            <div
              key={`sdkTab_sdkItems_trackingCallback`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "trackingCallback",
              })}
              onClick={() => setSelectedItem("trackingCallback")}
            >
              <ItemStatus title="Tracking Callback" status={trackingCallbackStatus} color={trackingCallbackStatusColor}/>
            </div>

            <div
              key={`sdkTab_sdkItems_logEvent`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "logEvent",
              })}
              onClick={() => setSelectedItem("logEvent")}
            >
              <ItemStatus title="Log Event Callback" status={usingLogEvent} color="gray"/>
            </div>

            <div
              key={`sdkTab_sdkItems_security`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "security",
              })}
              onClick={() => setSelectedItem("security")}
            >
              <ItemStatus title="Payload Security" status={securityStatus} color="gray"/>
            </div>

            <div
              key={`sdkTab_sdkItems_stickyBucketing`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "stickyBucketing",
              })}
              onClick={() => setSelectedItem("stickyBucketing")}
            >
              <ItemStatus title="Sticky Bucketing" status={usingStickyBucketing} color="gray"/>
            </div>

            <div
              key={`sdkTab_sdkItems_streaming`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "streaming",
              })}
              onClick={() => setSelectedItem("streaming")}
            >
              <ItemStatus title="Streaming" status={streaming} color="gray"/>
            </div>

            <div
              key={`sdkTab_sdkItems_payload`}
              className={clsx("featureCard flex items-center justify-between", {
                selected: selectedItem === "payload",
              })}
              onClick={() => setSelectedItem("payload")}
            >
              <ItemStatus title="SDK Payload" status={hasPayload} color="gray"/>
            </div>
          </>
        )}
      </div>

      <div
        className="featureDetailWrapper fixed overflow-y-auto"
        style={{
          top: NAV_H,
          height: `calc(100vh - ${NAV_H}px)`,
          width: `${rightPercent * 100}vw`,
          maxWidth: MW * rightPercent,
          right: selectedItem
            ? `calc(max((100vw - ${MW}px)/2 + 8px, 0px))`
            : `-${rightPercent * 100}vw`,
          zIndex: 1000,
          pointerEvents: !open ? "none" : undefined,
        }}
      >
        <div className="featureDetail px-6 py-4" key={`selected_${selectedItem}`}>
          {isResponsive && (
            <IconButton
              size="3"
              variant="ghost"
              radius="full"
              className="absolute right-3 top-3"
              style={{ margin: 0 }}
              onClick={(e) => {
                e.preventDefault();
                setSelectedItem(undefined);
              }}
            >
              <PiXBold />
            </IconButton>
          )}

          {displayRightPanel()}
        </div>
      </div>

    </div>
  );
}

function ItemStatus({
  title,
  status,
  color,
  fullWidth,
}: {
  title: string;
  status? : string | boolean;
  color: "green" | "red" | "gray" | "orange";
  fullWidth?: boolean;
}) {
  if (typeof status === "boolean") {
    status = status ? "Yes" : "No";
  }
  return (
    <>
      <div className="title pl-2.5 pr-6">
        {title}
      </div>
      <div className="flex pr-2.5 items-center flex-shrink-0 text-sm"

      >
        <Text color={color}>
          {status}
        </Text>
      </div>
    </>
  );
};

function NoSdkFound() {
  return (
    <div>
      <div>
        <ItemStatus title="Status" status="No SDK found" color="red" />
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
