import React, { ReactNode, useState } from "react";
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
import { summarizeIngestor } from "@/utils/ingestor";
import useMissingAttributes from "@/app/hooks/useMissingAttributes";
import {
  eventLoggerReplacesCallbacks,
  hasTrackingCallbackIssues,
  isMissingTrackingCallback,
} from "@/utils/sdkCallbacks";

const latestSdkVersion = packageJson.version;
const latestSdkParts = latestSdkVersion.split(".");
latestSdkParts[2] = "0";
const latestMinorSdkVersion = latestSdkParts.join(".");

export const LEFT_PERCENT = 0.5;

export const sdkItems = [
  "status",
  "plugins",
  "externalSdks",
  "payload",
  "attributes",
  "stickyBucketing",
  // "streaming",
  "trackingCallback",
  "onFeatureUsage",
  "logEvent",
  "eventIngestor",
] as const;
export type SdkItem = (typeof sdkItems)[number];

export default function SdkTab() {
  const { isResponsive } = useResponsiveContext();

  const [selectedItem, setSelectedItem] = useState<SdkItem | undefined>(
    !isResponsive ? "status" : undefined,
  );

  const {
    sdkFound,
    externalSdks,
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
    ingestor,
    clientKey,
    plugins,
  } = useSdkData();
  const ingestorSummary = summarizeIngestor(ingestor, clientKey);
  const missingAttributes = useMissingAttributes();

  const numExternalSdks = Object.keys(externalSdks || {}).length;

  // A failed decryption usually leaves no payload, so check it first
  const decryptionFailed = hasDecryptionKey && !payloadDecrypted;
  const payloadStatus = decryptionFailed
    ? "Decryption Error"
    : !hasPayload
      ? "No"
      : hasDecryptionKey
        ? "Yes (Encrypted)"
        : isRemoteEval
          ? "Yes (Remote Eval)"
          : "Yes";
  const trackingCallbackIssues = hasTrackingCallbackIssues({
    hasTrackingCallback,
    trackingCallbackParams,
    version,
  });
  // A rest param stands in for any arity, so a count would mislead
  const trackingCallbackParamCount = trackingCallbackParams?.some((p) =>
    p.startsWith("..."),
  )
    ? undefined
    : trackingCallbackParams?.length;
  const callbacksNotNeeded = eventLoggerReplacesCallbacks({ usingLogEvent });
  const trackingCallbackStatus = !hasTrackingCallback
    ? callbacksNotNeeded
      ? "N/A"
      : "None Found"
    : trackingCallbackIssues
      ? "Found (issues)"
      : trackingCallbackParamCount
        ? `${trackingCallbackParamCount} param${trackingCallbackParamCount === 1 ? "" : "s"}`
        : "Found";
  const trackingCallbackStatusColor = !hasTrackingCallback
    ? callbacksNotNeeded
      ? "gray"
      : "red"
    : trackingCallbackIssues
      ? "orange"
      : "green";
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
            title="SDK"
            status={
              sdkFound ? (
                <>
                  <Text color={versionStatusColor}>
                    {version || "unknown"}
                    {version && versionStatusColor !== "green"
                      ? " (outdated)"
                      : null}
                  </Text>
                  <Text color="gray"> · </Text>
                  {canConnectStatus}
                </>
              ) : (
                canConnectStatus
              )
            }
            color={sdkFound === undefined ? "gray" : canConnectStatusColor}
          />
        </div>

        {sdkFound && (
          <div
            key={`sdkTab_sdkItems_plugins`}
            className={clsx("itemCard flex items-center justify-between", {
              selected: selectedItem === "plugins",
            })}
            onClick={() => setSelectedItem("plugins")}
          >
            <ItemStatus
              title="Plugins"
              status={plugins?.length ? plugins.length : "None"}
              color="gray"
            />
          </div>
        )}

        <div
          key={`sdkTab_sdkItems_externalSdks`}
          className={clsx("itemCard flex items-center justify-between", {
            selected: selectedItem === "externalSdks",
          })}
          onClick={() => setSelectedItem("externalSdks")}
        >
          <ItemStatus
            title="Back-end SDKs"
            status={numExternalSdks}
            color="gray"
          />
        </div>

        {sdkFound && (
          <>
            <SectionDivider />

            <div
              key={`sdkTab_sdkItems_payload`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "payload",
              })}
              onClick={() => setSelectedItem("payload")}
            >
              <ItemStatus
                title="SDK Payload"
                status={payloadStatus}
                color={decryptionFailed ? "orange" : "gray"}
              />
            </div>

            <div
              key={`sdkTab_sdkItems_attributes`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "attributes",
              })}
              onClick={() => setSelectedItem("attributes")}
            >
              <ItemStatus
                title="Attributes"
                status={
                  missingAttributes.length
                    ? `${missingAttributes.length} not set`
                    : "All set"
                }
                color={missingAttributes.length ? "orange" : "gray"}
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
              />
            </div>

            <SectionDivider />

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
                status={
                  usingOnFeatureUsage
                    ? "Yes"
                    : callbacksNotNeeded
                      ? "N/A"
                      : "No"
                }
                color="gray"
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
              />
            </div>

            <div
              key={`sdkTab_sdkItems_eventIngestor`}
              className={clsx("itemCard flex items-center justify-between", {
                selected: selectedItem === "eventIngestor",
              })}
              onClick={() => setSelectedItem("eventIngestor")}
            >
              <ItemStatus
                title="Event Ingestor"
                status={ingestorSummary.status}
                color={ingestorSummary.color}
              />
            </div>
          </>
        )}
      </div>
      {selectedItem && (
        <SdkItemPanel
          selectedItem={selectedItem}
          selectItem={setSelectedItem}
          unsetSelectedItem={() => setSelectedItem(undefined)}
          widthPercent={rightPercent}
          latestSdkVersion={latestSdkVersion}
          latestMinorSdkVersion={latestMinorSdkVersion}
        />
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="mx-4 my-1.5 border-t border-gray-a6" />;
}

function ItemStatus({
  title,
  status,
  color,
}: {
  title: string;
  status?: string | ReactNode | boolean;
  color: "green" | "red" | "gray" | "orange";
}) {
  if (typeof status === "boolean") {
    status = status ? "Yes" : "No";
  }
  return (
    <>
      <div className="title pl-4 pr-3">{title}</div>
      <div className="flex pr-4 items-center flex-shrink-0 text-sm">
        <Text color={color}>{status}</Text>
        <PiCaretRight className="ml-3 text-gray-10" />
      </div>
    </>
  );
}

export function getSdkStatus(
  sdkData: SDKHealthCheckResult,
): "green" | "yellow" | "red" {
  const numExternalSdks = Object.keys(sdkData.externalSdks || {}).length;
  if (
    (!sdkData.canConnect && !sdkData.hasPayload && !numExternalSdks) ||
    (!sdkData.version && !numExternalSdks) ||
    (sdkData.version &&
      paddedVersionString(sdkData.version) < paddedVersionString("0.30.0"))
  ) {
    return "red";
  }
  if (
    (!sdkData.canConnect && !numExternalSdks) ||
    (sdkData.canConnect && !sdkData.hasPayload) ||
    (isMissingTrackingCallback(sdkData) && !numExternalSdks) ||
    hasTrackingCallbackIssues(sdkData) ||
    (sdkData.hasPayload && !sdkData.payloadDecrypted) ||
    (paddedVersionString(sdkData.version) <
      paddedVersionString(latestMinorSdkVersion) &&
      !numExternalSdks)
  ) {
    return "yellow";
  }
  return "green";
}
