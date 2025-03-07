import React, { useState } from "react";
import { SDKHealthCheckResult } from "devtools";
import { Text } from "@radix-ui/themes";
import { MW } from "@/app";
import clsx from "clsx";
import { PiCaretRight } from "react-icons/pi";
import { useResponsiveContext } from "@/app/hooks/useResponsive";
import SdkItemPanel from "./SdkItemPanel";
import useSdkData from "@/app/hooks/useSdkData";
import { paddedVersionString } from "@growthbook/growthbook";
import packageJson from "@growthbook/growthbook/package.json";

const latestSdkVersion = packageJson.version;
const latestSdkParts = latestSdkVersion.split(".");
latestSdkParts[2] = "0";
const latestMinorSdkVersion = latestSdkParts.join(".");

export const LEFT_PERCENT = 0.5;

export const sdkItems = [
  "status",
  "version",
  "trackingCallback",
  "security",
  "stickyBucketing",
  "streaming",
  "payload",
  "logEvent",
  "onFeatureUsage",
] as const;
export type SdkItem = (typeof sdkItems)[number];

export default function SdkTab() {
  const { isResponsive } = useResponsiveContext();

  const [selectedItem, setSelectedItem] = useState<SdkItem | undefined>(
    !isResponsive ? "status" : undefined,
  );

  const {
    sdkFound,
    version,
    canConnect,
    hasPayload,
    hasTrackingCallback,
    trackingCallbackParams,
    hasDecryptionKey,
    payloadDecrypted,
    usingLogEvent,
    usingOnFeatureUsage,
    isRemoteEval,
    usingStickyBucketing,
    streaming,
  } = useSdkData();

  const decryptedStatus = payloadDecrypted ? "Decrypted" : "DecryptionError";
  const securityStatus = hasDecryptionKey
    ? decryptedStatus
    : isRemoteEval
      ? "Remote Eval"
      : "Plain Text";
  const trackingCallbackStatus =
    trackingCallbackParams?.length === 2
      ? "Found"
      : !hasTrackingCallback
        ? "None Found"
        : "Found (issues)";
  const trackingCallbackStatusColor =
    trackingCallbackParams?.length === 2
      ? "green"
      : !hasTrackingCallback
        ? "red"
        : "orange";
  const canConnectStatus =
    sdkFound === undefined
      ? "Loading..."
      : !sdkFound
        ? "No SDK Found"
        : canConnect
          ? "Connected"
          : "Not Connected";
  const canConnectStatusColor = canConnect
    ? "green"
    : hasPayload
      ? "orange"
      : "red";
  const versionStatusColor = !version
    ? "red"
    : paddedVersionString(version) < paddedVersionString("0.30.0")
      ? "red"
      : paddedVersionString(version) <
          paddedVersionString(latestMinorSdkVersion)
        ? "orange"
        : "green";

  const fullWidthListView = !selectedItem;
  const leftPercent = fullWidthListView ? 1 : LEFT_PERCENT;
  const rightPercent = isResponsive ? 1 : 1 - LEFT_PERCENT;

  return (
    <div
      className="mx-auto pt-1"
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
        <div
          key={`sdkTab_sdkItems_status`}
          className={clsx("itemCard flex items-center justify-between", {
            selected: selectedItem === "status",
          })}
          onClick={() => setSelectedItem("status")}
        >
          <ItemStatus
            title="Status"
            status={canConnectStatus}
            color={canConnectStatusColor}
            showCaret={isResponsive}
          />
        </div>

        {sdkFound && (
          <>
            <div
              key={`sdkTab_sdkItems_version`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "version",
              })}
              onClick={() => setSelectedItem("version")}
            >
              <ItemStatus
                title="Version"
                status={
                  (version ? version : "unknown") +
                  (version && versionStatusColor !== "green"
                    ? " (outdated)"
                    : "")
                }
                color={versionStatusColor}
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_trackingCallback`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "trackingCallback",
              })}
              onClick={() => setSelectedItem("trackingCallback")}
            >
              <ItemStatus
                title="Tracking Callback"
                status={trackingCallbackStatus}
                color={trackingCallbackStatusColor}
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_security`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "security",
              })}
              onClick={() => setSelectedItem("security")}
            >
              <ItemStatus
                title="Payload Security"
                status={securityStatus}
                color="gray"
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_stickyBucketing`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "stickyBucketing",
              })}
              onClick={() => setSelectedItem("stickyBucketing")}
            >
              <ItemStatus
                title="Sticky Bucketing"
                status={usingStickyBucketing}
                color="gray"
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_streaming`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "streaming",
              })}
              onClick={() => setSelectedItem("streaming")}
            >
              <ItemStatus
                title="Streaming"
                status={streaming}
                color="gray"
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_payload`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "payload",
              })}
              onClick={() => setSelectedItem("payload")}
            >
              <ItemStatus
                title="SDK Payload"
                status={hasPayload}
                color="gray"
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_logEvent`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "logEvent",
              })}
              onClick={() => setSelectedItem("logEvent")}
            >
              <ItemStatus
                title="Log Event Callback"
                status={usingLogEvent}
                color="gray"
                showCaret={isResponsive}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_onFeatureUsage`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "onFeatureUsage",
              })}
              onClick={() => setSelectedItem("onFeatureUsage")}
            >
              <ItemStatus
                title="On Feature Usage Callback"
                status={usingOnFeatureUsage}
                color="gray"
                showCaret={isResponsive}
              />
            </div>
          </>
        )}
      </div>
      {selectedItem && (
        <SdkItemPanel
          selectedItem={selectedItem}
          unsetSelectedItem={() => setSelectedItem(undefined)}
          widthPercent={rightPercent}
          latestSdkVersion={latestSdkVersion}
          latestMinorSdkVersion={latestMinorSdkVersion}
          hasPayload={hasPayload}
        />
      )}
    </div>
  );
}

function ItemStatus({
  title,
  status,
  color,
  showCaret,
}: {
  title: string;
  status?: string | boolean;
  color: "green" | "red" | "gray" | "orange";
  showCaret: boolean;
}) {
  if (typeof status === "boolean") {
    status = status ? "Yes" : "No";
  }
  return (
    <>
      <div className="title pl-4 pr-6">{title}</div>
      <div className="flex pr-4 items-center flex-shrink-0 text-sm">
        <Text color={color}>{status}</Text>
        {showCaret && (
          <div className="ml-5 font-bold">
            <PiCaretRight />
          </div>
        )}
      </div>
    </>
  );
}

export function getSdkStatus(
  sdkData: SDKHealthCheckResult,
): "green" | "yellow" | "red" {
  if (
    !sdkData.canConnect ||
    !sdkData.version ||
    (sdkData.version &&
      paddedVersionString(sdkData.version) < paddedVersionString("0.30.0"))
  ) {
    return "red";
  }
  if (
    !sdkData.hasPayload ||
    sdkData.trackingCallbackParams?.length !== 2 ||
    !sdkData.payloadDecrypted ||
    (sdkData.version &&
      paddedVersionString(sdkData.version) <
        paddedVersionString(latestMinorSdkVersion))
  ) {
    return "yellow";
  }
  return "green";
}
