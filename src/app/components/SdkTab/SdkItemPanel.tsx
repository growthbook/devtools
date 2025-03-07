import React, { useEffect, useState } from "react";
import { Button, Callout, Flex, IconButton, Link, Text } from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import { MW, NAV_H } from "@/app";
import {
  PiArrowsClockwise,
  PiArrowSquareOut,
  PiCaretRightFill, PiWarningFill, PiWarningOctagonFill,
  PiXBold,
} from "react-icons/pi";
import * as Accordion from "@radix-ui/react-accordion";
import { useResponsiveContext } from "@/app/hooks/useResponsive";
import { SdkItem } from "./index";
import useSdkData from "@/app/hooks/useSdkData";
import { SDKHealthCheckResult } from "devtools";
import { getActiveTabId } from "@/app/hooks/useTabState";
import { paddedVersionString } from "@growthbook/growthbook";

const panelTitles: Record<SdkItem, string> = {
  status: "SDK Status",
  version: "SDK Version",
  trackingCallback: "Tracking Callback",
  security: "Payload Security",
  stickyBucketing: "Sticky Bucketing",
  streaming: "Streaming",
  payload: "SDK Payload",
  logEvent: "Log Event Callback",
  onFeatureUsage: "On Feature Usage Callback",
};

const panels: Record<
  SdkItem,
  React.FC<
    SDKHealthCheckResult & {
      latestSdkVersion: string;
      latestMinorSdkVersion: string;
      hasPayload: boolean;
    }
  >
> = {
  status: statusPanel,
  version: versionPanel,
  trackingCallback: trackingCallbackPanel,
  security: securityPanel,
  stickyBucketing: stickyBucketingPanel,
  streaming: streamingPanel,
  payload: payloadPanel,
  logEvent: logEventPanel,
  onFeatureUsage: onFeatureUsagePanel,
};

const doclinks: Record<SdkItem, string | undefined> = {
  status:
    "https://docs.growthbook.io/quick-start#step-2-integrate-growthbook-into-your-application",
  version:
    "https://github.com/growthbook/growthbook/blob/main/packages/shared/src/sdk-versioning/CAPABILITIES.md",
  trackingCallback:
    "https://docs.growthbook.io/lib/js#experimentation-ab-testing",
  security: "https://docs.growthbook.io/lib/js#remote-evaluation",
  stickyBucketing: "https://docs.growthbook.io/app/sticky-bucketing",
  streaming: "https://docs.growthbook.io/lib/js#streaming-updates",
  payload: "https://docs.growthbook.io/lib/js#loading-features-and-experiments",
  logEvent: undefined,
  onFeatureUsage: "https://docs.growthbook.io/lib/js#feature-usage-callback",
};

export default function SdkItemPanel({
  selectedItem,
  unsetSelectedItem,
  widthPercent,
  latestSdkVersion,
  latestMinorSdkVersion,
  hasPayload,
}: {
  selectedItem: SdkItem;
  unsetSelectedItem: () => void;
  widthPercent: number;
  latestSdkVersion: string;
  latestMinorSdkVersion: string;
  hasPayload: boolean;
}) {
  const { isResponsive } = useResponsiveContext();

  return (
    <div
      className="featureDetailWrapper fixed overflow-y-auto"
      style={{
        top: NAV_H,
        height: `calc(100vh - ${NAV_H}px)`,
        width: `${widthPercent * 100}vw`,
        maxWidth: MW * widthPercent,
        right: selectedItem
          ? `calc(max((100vw - ${MW}px)/2 + 8px, 0px))`
          : `-${widthPercent * 100}vw`,
        zIndex: 1000,
        pointerEvents: !open ? "none" : undefined,
      }}
    >
      <Flex
        className="featureDetail"
        key={`selected_${selectedItem}`}
        direction="column"
        height="100%"
      >
        <div className="header">
          <div className="flex items-start gap-2">
            <h2 className="font-bold flex-1 my-1.5">
              {panelTitles[selectedItem]}
            </h2>
            {isResponsive && (
              <IconButton
                size="3"
                variant="ghost"
                radius="full"
                style={{ margin: "0 -8px -10px 0" }}
                onClick={(e) => {
                  e.preventDefault();
                  unsetSelectedItem();
                }}
              >
                <PiXBold />
              </IconButton>
            )}
          </div>
        </div>
        <Flex className="content" flexGrow="1" direction="column">
          <Flex direction="column" flexGrow="1" justify="between" align="start">
            <div
              className="my-2"
              style={{
                maxWidth: `calc(${widthPercent * 100}vw - 32px)`,
              }}
            >
              <ItemPanel
                selectedItem={selectedItem}
                latestSdkVersion={latestSdkVersion}
                latestMinorSdkVersion={latestMinorSdkVersion}
              />
            </div>
            {doclinks[selectedItem] ? (
              <Link
                size="2"
                target="_blank"
                href={doclinks[selectedItem]}
                mt="3"
                mb="2"
              >
                View documentation
                <PiArrowSquareOut className="inline-block mb-1 ml-0.5" />
              </Link>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}

function ItemPanel({
  selectedItem,
  latestSdkVersion,
  latestMinorSdkVersion,
}: {
  selectedItem: SdkItem;
  latestSdkVersion: string;
  latestMinorSdkVersion: string;
}) {
  const PanelComponent = panels[selectedItem];
  const sdkData = useSdkData();
  return (
    <PanelComponent
      {...sdkData}
      latestSdkVersion={latestSdkVersion}
      latestMinorSdkVersion={latestMinorSdkVersion}
    />
  );
}

function statusPanel({
  sdkFound,
  canConnect,
  apiHost,
  clientKey,
  errorMessage,
}: SDKHealthCheckResult) {
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [refreshing, setRefreshing] = useState<boolean>(true);

  const refresh = async () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
    const activeTabId = await getActiveTabId();
    setActiveTabId(activeTabId);
    if (activeTabId) {
      if (chrome?.tabs) {
        await chrome.tabs.sendMessage(activeTabId, {
          type: "GB_REQUEST_REFRESH",
        });
      } else {
        await chrome.runtime.sendMessage({
          type: "GB_REQUEST_REFRESH",
        });
      }
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      {!sdkFound ? (
        <>
          {sdkFound === undefined ? (
            <Text as="div" size="2" weight="regular" mb="2" color="gray">
              Attempting to connect to SDK...
            </Text>
          ) : null}

          <div className="mb-4">
            {!activeTabId && !refreshing ? (
              <Callout.Root
                color="red"
                size="1"
                className="mb-4"
              >
                <Callout.Icon>
                  <PiWarningOctagonFill />
                </Callout.Icon>
                <Callout.Text>
                  DevTools was unable to attach to the current window.
                </Callout.Text>
              </Callout.Root>
            ) : null}
            <Button
              variant="outline"
              size="2"
              onClick={() => {
                refresh();
              }}
              disabled={refreshing}
            >
              <PiArrowsClockwise /> Refresh DevTools
            </Button>
          </div>

          <Text as="div" size="2" weight="regular" mb="3" color="red">
            No SDK was found.
          </Text>
          <Text as="div" size="2" weight="regular" mb="3">
            Ensure that{" "}
            <code className="text-pink-600">enableDevMode: true</code> is set
            when creating your GrowthBook SDK instance (JavaScript and React
            only).
          </Text>
          <Text as="div" size="2" weight="regular" mb="6">
            If your site has a Content Security Policy (CSP), check whether the
            CSP allows your HTML Script Tag or SDK to load.{" "}
            <Link
              size="2"
              href="https://docs.growthbook.io/lib/script-tag#content-security-policy-csp"
            >
              Read more
            </Link>
          </Text>
          <Text as="div" size="2" weight="regular" mb="1">
            See our SDK implementation guides:
          </Text>
          <div>
            <Link size="2" href="https://docs.growthbook.io/lib/script-tag">
              HTML Script Tag SDK
            </Link>
          </div>
          <div>
            <Link size="2" href="https://docs.growthbook.io/lib/js">
              JavaScript SDK
            </Link>
          </div>
          <div>
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
            <code className="text-pink-600">{apiHost ?? "None"}</code>
          </Text>
          <Text as="div" size="2" weight="regular" mb="2">
            <div className="font-semibold mb-0.5">Client Key:</div>
            <code className="text-pink-600">{clientKey ?? "None"}</code>
          </Text>
          {errorMessage && (
            <Text as="div" size="2" weight="light">
              error: {errorMessage ?? "None"}
            </Text>
          )}
        </>
      )}
    </>
  );
}

function versionPanel({
  hasWindowConfig,
  version,
  latestSdkVersion,
  latestMinorSdkVersion,
}: SDKHealthCheckResult & {
  latestSdkVersion: string;
  latestMinorSdkVersion: string;
}) {
  return (
    <Text as="div" size="2" weight="regular">
      {!version ? (
        <>
          <Text>
            Unable to find your SDK version. This may indicate a version prior to 0.30.0.
          </Text>
          <div className="mt-4">
            <Callout.Root
              color="red"
              size="1"
              className="mt-2 mb-4"
            >
              <Callout.Icon>
                <PiWarningOctagonFill />
              </Callout.Icon>
              <Callout.Text>
                Possibly using an unsupported legacy version of the SDK (&lt;0.30.0)
              </Callout.Text>
            </Callout.Root>
            <Text>
              Versions prior to 0.30.0 are unsupported in DevTools. Additionally, versions prior to
              0.23.0 are considered unstable. Consider updating to the latest version.
            </Text>
          </div>
        </>
      ) : (
        <>
          <Text>
            Detected version <strong>{version}</strong> of the JavaScript SDK.
            {hasWindowConfig ? " Embedded via the HTML Script Tag." : null}
          </Text>
          {paddedVersionString(version) < paddedVersionString("0.30.0") ? (
            <div className="mt-4">
              <Callout.Root
                color="red"
                size="1"
                className="mt-2 mb-4"
              >
                <Callout.Icon>
                  <PiWarningOctagonFill />
                </Callout.Icon>
                <Callout.Text>
                  Using an unsupported legacy version of the SDK ({version}).
                </Callout.Text>
              </Callout.Root>
              <Text>
                Versions prior to 0.30.0 are unsupported in DevTools. Consider
                updating to the latest version.
              </Text>
            </div>
          ) : paddedVersionString(version) <
            paddedVersionString(latestMinorSdkVersion) ? (
            <div className="mt-4">
              <Text color="orange">
                Using an outdated version of the SDK ({version}).
              </Text>{" "}
              <Text>Consider updating to the latest version.</Text>
            </div>
          ) : null}
        </>
      )}
    </Text>
  );
}

function trackingCallbackPanel({
  trackingCallbackParams,
  hasTrackingCallback,
}: SDKHealthCheckResult) {
  return (
    <Text as="div" size="2" weight="regular">
      {trackingCallbackParams?.length === 2 ? (
        <>
          The SDK is using a{" "}
          <code className="text-pink-600">trackingCallback</code>.
        </>
      ) : !hasTrackingCallback ? (
        <>
          The SDK is not using a{" "}
          <code className="text-pink-600">trackingCallback</code>. You will need
          to add one to track experiment exposure to your data warehouse.
        </>
      ) : (
        <>
          The SDK is using a{" "}
          <code className="text-pink-600">trackingCallback</code> with{" "}
          {trackingCallbackParams?.length ? (
            <em className="text-amber-600">{trackingCallbackParams.length}</em>
          ) : (
            <>
              an <em className="text-amber-600">unknown</em> number of
            </>
          )}{" "}
          param{trackingCallbackParams?.length !== 1 ? "s" : ""} instead of 2.
          Please check your implementation.
        </>
      )}
    </Text>
  );
}

function securityPanel({
  hasDecryptionKey,
  payloadDecrypted,
  isRemoteEval,
}: SDKHealthCheckResult) {
  return (
    <Text as="div" size="2" weight="regular">
      {hasDecryptionKey
        ? payloadDecrypted
          ? "The SDK is using a decryption key and the payload is not being decrypted. Please check you have the correct decryption key."
          : "The SDK is using a decryption key and the payload is being decrypted."
        : isRemoteEval
          ? "The SDK is using remote evaluation."
          : "The SDK is not using a decryption key nor remote evaluation. The payload is in plain text."}
    </Text>
  );
}

function stickyBucketingPanel({
  usingStickyBucketing,
  stickyBucketAssignmentDocs,
}: SDKHealthCheckResult) {
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {usingStickyBucketing
          ? "The SDK is using sticky bucketing."
          : "The SDK is not using sticky bucketing. Sticky bucketing is optional and is used to ensure that users are consistently bucketed."}
      </Text>
      {usingStickyBucketing && stickyBucketAssignmentDocs ? (
        <Accordion.Root className="accordion mt-2" type="single" collapsible>
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
                maxHeight={`calc((100vh - ${NAV_H}px - 64px) / 2)`}
              />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ) : null}
    </>
  );
}

function streamingPanel({
  streaming,
  streamingHost,
  clientKey,
  streamingHostRequestHeaders,
}: SDKHealthCheckResult) {
  return (
    <>
      <Text as="div" size="2" weight="regular" mb="2">
        {streaming
          ? "The SDK is using streaming (SSE)."
          : "The SDK is not using streaming (SSE). Streaming is optional and is used to update the SDK with the latest data without refreshing the page."}
      </Text>
      <Text as="div" size="2" weight="regular" mb="2">
        <div className="font-semibold mb-0.5">Streaming host:</div>
        <code className="text-pink-600">{streamingHost ?? "None"}</code>
      </Text>
      <Text as="div" size="2" weight="regular">
        <div className="font-semibold mb-0.5">Client Key:</div>
        <code className="text-pink-600">{clientKey ?? "None"}</code>
      </Text>
      <Text as="div" size="2" weight="regular" mt="2">
        <div className="font-semibold">Streaming host request headers:</div>
        <div>
          <code className="text-pink-600">
            {JSON.stringify(streamingHostRequestHeaders) ?? "None"}
          </code>
        </div>
      </Text>
    </>
  );
}

function payloadPanel({ hasPayload, payload }: SDKHealthCheckResult) {
  return (
    <>
      {!hasPayload ? (
        <>
          <Callout.Root
            color="amber"
            size="1"
            className="mb-4"
          >
            <Callout.Icon>
              <PiWarningFill />
            </Callout.Icon>
            <Callout.Text>
              No payload present in your SDK
            </Callout.Text>
          </Callout.Root>
          <Text as="div" size="2" weight="regular">
            Please check your implementation.
          </Text>
        </>
      ) : (
        <ValueField
          value={payload}
          valueType="json"
          maxHeight={`calc(100vh - ${NAV_H}px - 150px)`}
        />
      )}
    </>
  );
}

function logEventPanel({ usingLogEvent }: SDKHealthCheckResult) {
  return (
    <Text as="div" size="2" weight="regular">
      {usingLogEvent ? (
        <>
          The SDK is using a <code className="text-pink-600">logEvent</code>{" "}
          callback.
        </>
      ) : (
        <>
          The SDK is not using a <code className="text-pink-600">logEvent</code>{" "}
          callback. This optional callback allows you to track events to a data
          warehouse directly from the SDK.
        </>
      )}
    </Text>
  );
}

function onFeatureUsagePanel({ usingOnFeatureUsage }: SDKHealthCheckResult) {
  return (
    <Text as="div" size="2" weight="regular">
      {usingOnFeatureUsage ? (
        <>
          The SDK is using an{" "}
          <code className="text-pink-600">onFeatureUsage</code> callback.
        </>
      ) : (
        <>
          The SDK is not using a{" "}
          <code className="text-pink-600">onFeatureUsage</code> callback. This
          optional callback allows you to track feature flag telemetry to a data
          warehouse.
        </>
      )}
    </Text>
  );
}
