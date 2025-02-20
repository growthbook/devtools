import React, { ReactElement, useEffect, useMemo, useState } from "react";
import useTabState from "@/app/hooks/useTabState";
import { SDKHealthCheckResult } from "devtools";
import { Button, IconButton, Link, Text } from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import { MW, NAV_H } from "@/app";
import clsx from "clsx";
import {
  PiArrowsClockwise,
  PiCaretRight,
  PiCaretRightFill,
  PiXBold,
} from "react-icons/pi";
import * as Accordion from "@radix-ui/react-accordion";
import { useResponsiveContext } from "@/app/hooks/useResponsive";

export const LEFT_PERCENT = 0.5;

export default function SdkTab() {
  const { isResponsive } = useResponsiveContext();

  const [selectedItem, setSelectedItem] = useState<string | undefined>(
    !isResponsive ? "status" : undefined
  );

  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);

  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      let activeTab = tabs[0];
      setActiveTabId(activeTab?.id);
      if (activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: "GB_REQUEST_REFRESH",
        });
      }
    });
  };

  const [sdkData] = useTabState<SDKHealthCheckResult | {}>("sdkData", {});
  const {
    sdkFound,
    version,
    hasWindowConfig,
    errorMessage,
    canConnect,
    hasPayload,
    payload,
    hasTrackingCallback,
    trackingCallbackParams,
    hasDecryptionKey,
    payloadDecrypted,
    usingLogEvent,
    usingOnFeatureUsage,
    isRemoteEval,
    usingStickyBucketing,
    stickyBucketAssignmentDocs,
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

  const item:
    | {
        title: string;
        content: ReactElement | null;
      }
    | undefined = useMemo(() => {
    switch (selectedItem) {
      case "payload":
        return {
          title: "SDK Payload",
          content: (
            <ValueField value={payload} valueType="json" maxHeight={null} />
          ),
        };

      case "status":
        return {
          title: "SDK Status",
          content: (
            <>
              {!sdkFound ? (
                <>
                  {sdkFound === undefined ? (
                    <Text
                      as="div"
                      size="2"
                      weight="regular"
                      mb="4"
                      color="gray"
                    >
                      Attempting to connect to SDK...
                    </Text>
                  ) : null}

                  <div className="my-3">
                    {!activeTabId && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-3">
                        DevTools was unable to attach to the current window.
                        <div className="mt-0.5 text-xs">
                          Is your DevTools instance docked to the browser
                          window?
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="2"
                      onClick={() => {
                        refresh();
                      }}
                      disabled={refreshing}
                      mt="2"
                    >
                      <PiArrowsClockwise /> Refresh DevTools
                    </Button>
                  </div>

                  <Text as="div" size="2" weight="regular" mb="3">
                    No SDK was found.
                  </Text>
                  <Text as="div" size="2" weight="regular" mb="3">
                    Ensure that{" "}
                    <code className="text-pink-800">enableDevMode: true</code>{" "}
                    is set when creating your GrowthBook SDK instance
                    (JavaScript and React only).
                  </Text>
                  <Text as="div" size="2" weight="regular" mb="6">
                    If your site has a Content Security Policy (CSP), check
                    whether the CSP allows your HTML Script Tag or SDK to load.{" "}
                    <Link
                      size="2"
                      href="https://docs.growthbook.io/lib/script-tag#content-security-policy-csp"
                    >
                      Read more
                    </Link>
                  </Text>
                  <Text as="div" size="2" weight="regular" mb="2">
                    See our SDK implementation guides:
                  </Text>
                  <div className="py-0.5">
                    <Link
                      size="2"
                      href="https://docs.growthbook.io/lib/script-tag"
                    >
                      HTML Script Tag SDK
                    </Link>
                  </div>
                  <div className="py-0.5">
                    <Link size="2" href="https://docs.growthbook.io/lib/js">
                      JavaScript SDK
                    </Link>
                  </div>
                  <div className="py-0.5">
                    <Link size="2" href="https://docs.growthbook.io/lib/react">
                      React SDK
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Text as="div" size="2" weight="regular" mb="2">
                    {canConnect
                      ? "The SDK is connected to the GrowthBook API."
                      : "The SDK is not connected to the GrowthBook API."}
                  </Text>
                  <Text as="div" size="2" weight="regular" mb="2">
                    <div className="font-semibold mb-0.5">Host:</div>
                    <code className="text-pink-800">{apiHost ?? "None"}</code>
                  </Text>
                  <Text as="div" size="2" weight="regular" mb="2">
                    <div className="font-semibold mb-0.5">Client Key:</div>
                    <code className="text-pink-800">{clientKey ?? "None"}</code>
                  </Text>
                  {errorMessage && (
                    <Text as="div" size="2" weight="light">
                      error: {errorMessage ?? "None"}
                    </Text>
                  )}
                </>
              )}
            </>
          ),
        };

      case "version":
        return {
          title: "SDK Version",
          content: (
            <Text as="div" size="2" weight="regular">
              {!version ? (
                <Text>
                  Unable to find your SDK version. You might be using an old
                  version of the SDK. Consider updating to the latest version.
                </Text>
              ) : (
                <>
                  <Text>
                    Detected version <strong>{version}</strong> of the
                    JavaScript SDK.
                    {hasWindowConfig
                      ? " Embedded via the HTML Script Tag."
                      : null}
                  </Text>
                </>
              )}
            </Text>
          ),
        };

      case "trackingCallback":
        return {
          title: "Tracking Callback",
          content: (
            <Text as="div" size="2" weight="regular">
              {trackingCallbackParams?.length === 2 ? (
                <>
                  The SDK is using a{" "}
                  <code className="text-pink-800">trackingCallback</code>.
                </>
              ) : !hasTrackingCallback ? (
                <>
                  The SDK is not using a{" "}
                  <code className="text-pink-800">trackingCallback</code>. You
                  will need to add one to track experiment exposure to your data
                  warehouse.
                </>
              ) : (
                <>
                  The SDK is using a{" "}
                  <code className="text-pink-800">trackingCallback</code> with{" "}
                  {trackingCallbackParams?.length ? (
                    <em className="text-amber-600">
                      {trackingCallbackParams.length}
                    </em>
                  ) : (
                    <>
                      an <em className="text-amber-600">unknown</em> number of
                    </>
                  )}{" "}
                  param{trackingCallbackParams?.length !== 1 ? "s" : ""} instead
                  of 2. Please check your implementation.
                </>
              )}
            </Text>
          ),
        };

      case "logEvent":
        return {
          title: "Log Event Callback",
          content: (
            <Text as="div" size="2" weight="regular">
              {usingLogEvent ? (
                <>
                  The SDK is using a{" "}
                  <code className="text-pink-800">logEvent</code> callback.
                </>
              ) : (
                <>
                  The SDK is not using a{" "}
                  <code className="text-pink-800">logEvent</code> callback. This
                  optional callback allows you to track events to a data
                  warehouse directly from the SDK.
                </>
              )}
            </Text>
          ),
        };

      case "onFeatureUsage":
        return {
          title: "On Feature Usage Callback",
          content: (
            <Text as="div" size="2" weight="regular">
              {usingOnFeatureUsage ? (
                <>
                  The SDK is using an{" "}
                  <code className="text-pink-800">onFeatureUsage</code>{" "}
                  callback.
                </>
              ) : (
                <>
                  The SDK is not using a{" "}
                  <code className="text-pink-800">onFeatureUsage</code>{" "}
                  callback. This optional callback allows you to track feature
                  flag telemetry to a data warehouse.
                </>
              )}
            </Text>
          ),
        };

      case "security":
        return {
          title: "Payload Security",
          content: (
            <Text as="div" size="2" weight="regular">
              {hasDecryptionKey
                ? payloadDecrypted
                  ? "The SDK is using a decryption key and the payload is not being decrypted. Please check you have the correct decryption key."
                  : "The SDK is using a decryption key and the payload is being decrypted."
                : isRemoteEval
                  ? "The SDK is using remote evaluation."
                  : "The SDK is not using a decryption key or remote evaluation. The payload is in plain text."}
            </Text>
          ),
        };

      case "stickyBucketing":
        return {
          title: "Sticky Bucketing",
          content: (
            <>
              <Text as="div" size="2" weight="regular">
                {usingStickyBucketing
                  ? "The SDK is using sticky bucketing."
                  : "The SDK is not using sticky bucketing. Sticky bucketing is optional and is used to ensure that users are consistently bucketed."}
              </Text>
              {usingStickyBucketing && stickyBucketAssignmentDocs ? (
                <Accordion.Root
                  className="accordion mt-2"
                  type="single"
                  collapsible
                >
                  <Accordion.Item value="debug-log">
                    <Accordion.Trigger className="trigger mb-0.5">
                      <Link size="2" role="button" className="hover:underline">
                        <PiCaretRightFill className="caret mr-0.5" size={12} />
                        Sticky bucket assignments
                      </Link>
                    </Accordion.Trigger>
                    <Accordion.Content className="accordionInner overflow-hidden w-full">
                      <ValueField
                        value={Object.values(stickyBucketAssignmentDocs)}
                        valueType="json"
                        maxHeight={null}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              ) : null}
            </>
          ),
        };

      case "streaming":
        return {
          title: "Streaming",
          content: (
            <>
              <Text as="div" size="2" weight="regular" mb="2">
                {streaming
                  ? "The SDK is using streaming (SSE)."
                  : "The SDK is not using streaming (SSE). Streaming is optional and is used to update the SDK with the latest data without refreshing the page."}
              </Text>
              <Text as="div" size="2" weight="regular" mb="2">
                <div className="font-semibold mb-0.5">Streaming host:</div>
                <code className="text-pink-800">{streamingHost ?? "None"}</code>
              </Text>
              <Text as="div" size="2" weight="regular">
                <div className="font-semibold mb-0.5">Client Key:</div>
                <code className="text-pink-800">{clientKey ?? "None"}</code>
              </Text>
              <Text as="div" size="2" weight="regular" mt="2">
                <div className="font-semibold">
                  Streaming host request headers:
                </div>
                <div>
                  <code className="text-pink-800">
                    {JSON.stringify(streamingHostRequestHeaders) ?? "None"}
                  </code>
                </div>
              </Text>
            </>
          ),
        };

      default:
        return undefined;
    }
  }, [selectedItem, sdkData, refreshing]);

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
                status={version}
                color="gray"
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
        <div className="featureDetail" key={`selected_${selectedItem}`}>
          <div className="header">
            <div className="flex items-start gap-2">
              <h2 className="font-bold flex-1 my-1.5">{item?.title}</h2>
              {isResponsive && (
                <IconButton
                  size="3"
                  variant="ghost"
                  radius="full"
                  style={{ margin: "0 -8px -10px 0" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedItem(undefined);
                  }}
                >
                  <PiXBold />
                </IconButton>
              )}
            </div>
          </div>
          <div className="content">
            <div className="my-2">{item?.content}</div>
          </div>
        </div>
      </div>
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
  sdkData: SDKHealthCheckResult
): "green" | "yellow" | "red" {
  if (!sdkData.canConnect) {
    return "red";
  }
  if (
    !sdkData.hasPayload ||
    sdkData.trackingCallbackParams?.length !== 2 ||
    !sdkData.payloadDecrypted
  ) {
    return "yellow";
  }
  return "green";
}
