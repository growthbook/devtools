import React, { useEffect, useMemo, useState } from "react";
import { Prism } from "react-syntax-highlighter";
import {
  ghcolors as codeThemeLight,
  a11yDark as codeThemeDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import useGlobalState from "@/app/hooks/useGlobalState";
import {
  Button,
  Callout,
  Flex,
  IconButton,
  Link,
  Text,
} from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import { isDark, MW, NAV_H, Theme } from "@/app";
import {
  PiArrowsClockwise,
  PiArrowSquareOut,
  PiCaretRightFill,
  PiInfoBold,
  PiWarningFill,
  PiWarningOctagonFill,
  PiXBold,
} from "react-icons/pi";
import * as Accordion from "@radix-ui/react-accordion";
import { useResponsiveContext } from "@/app/hooks/useResponsive";
import { SdkItem } from "./index";
import useSdkData from "@/app/hooks/useSdkData";
import { SDKHealthCheckResult } from "devtools";
import {
  expectsUserContextParam,
  eventLoggerReplacesCallbacks,
  trackingCallbackParamsAreValid,
  USER_CONTEXT_SDK_VERSION,
} from "@/utils/sdkCallbacks";
import useTabState, { getActiveTabId } from "@/app/hooks/useTabState";
import useMissingAttributes from "@/app/hooks/useMissingAttributes";
import { MissingAttributesList } from "@/app/components/MissingAttributes";
import { ingestorRegion, summarizeIngestor } from "@/utils/ingestor";
import { paddedVersionString } from "@growthbook/growthbook";

const panelTitles: Record<SdkItem, string> = {
  status: "SDK Status",
  externalSdks: "Back-end SDKs",
  attributes: "Attributes",
  plugins: "Plugins",
  version: "SDK Version",
  trackingCallback: "Tracking Callback",
  security: "Payload Security",
  stickyBucketing: "Sticky Bucketing",
  // streaming: "Streaming",
  payload: "SDK Payload",
  logEvent: "Log Event Callback",
  eventIngestor: "Event Ingestor",
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
  externalSdks: externalSdksPanel,
  attributes: AttributesPanel,
  plugins: pluginsPanel,
  version: versionPanel,
  trackingCallback: trackingCallbackPanel,
  security: securityPanel,
  stickyBucketing: stickyBucketingPanel,
  // streaming: streamingPanel,
  payload: payloadPanel,
  logEvent: logEventPanel,
  eventIngestor: eventIngestorPanel,
  onFeatureUsage: onFeatureUsagePanel,
};

const doclinks: Record<SdkItem, string | undefined> = {
  status:
    "https://docs.growthbook.io/quick-start#step-2-integrate-growthbook-into-your-application",
  externalSdks:
    "https://docs.growthbook.io/tools/chrome-extension#back-end-debugging",
  plugins: undefined,
  attributes: undefined,
  version:
    "https://github.com/growthbook/growthbook/blob/main/packages/shared/src/sdk-versioning/CAPABILITIES.md",
  trackingCallback:
    "https://docs.growthbook.io/lib/js#experimentation-ab-testing",
  security: "https://docs.growthbook.io/lib/js#remote-evaluation",
  stickyBucketing: "https://docs.growthbook.io/app/sticky-bucketing",
  // streaming: "https://docs.growthbook.io/lib/js#streaming-updates",
  payload: "https://docs.growthbook.io/lib/js#loading-features-and-experiments",
  logEvent: undefined,
  eventIngestor:
    "https://docs.growthbook.io/app/managed-warehouse#sending-events",
  onFeatureUsage: "https://docs.growthbook.io/lib/js#feature-usage-callback",
};

export default function SdkItemPanel({
  selectedItem,
  unsetSelectedItem,
  widthPercent,
  latestSdkVersion,
  latestMinorSdkVersion,
}: {
  selectedItem: SdkItem;
  unsetSelectedItem: () => void;
  widthPercent: number;
  latestSdkVersion: string;
  latestMinorSdkVersion: string;
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
              className="my-2 w-full"
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
  hasPayload,
  canConnect,
  apiHost,
  clientKey,
  errorMessage,
}: SDKHealthCheckResult) {
  const [activeTabId, setActiveTabId] = useState<number | undefined>(undefined);
  const [refreshingSdk, setRefreshingSdk] = useState<boolean>(true);

  const refresh = async () => {
    setRefreshingSdk(true);
    window.setTimeout(() => setRefreshingSdk(false), 500);
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
          ) : (
            <Text as="div" size="2" weight="regular" mb="2" color="red">
              No front-end SDK was found.
            </Text>
          )}

          <div className="mb-6">
            {!activeTabId && !refreshingSdk ? (
              <Callout.Root color="red" size="1" className="mb-4">
                <Callout.Icon>
                  <PiWarningOctagonFill />
                </Callout.Icon>
                <Callout.Text>
                  DevTools was unable to attach to the current window.
                </Callout.Text>
              </Callout.Root>
            ) : null}

            <div>
              <Button
                variant="outline"
                size="2"
                onClick={refresh}
                disabled={refreshingSdk}
              >
                <PiArrowsClockwise /> Refresh DevTools
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Text as="div" size="2" weight="regular" mb="1">
            {canConnect
              ? "The SDK is connected to the GrowthBook API."
              : "The SDK is not connected to the GrowthBook API."}
          </Text>
          {!canConnect && hasPayload ? (
            <Callout.Root color="violet" size="1" className="mt-2 mb-4">
              <Callout.Icon>
                <PiInfoBold />
              </Callout.Icon>
              <Callout.Text>
                <div>
                  Although no valid API connection was found, a valid SDK
                  payload was found.
                </div>
                <div className="mt-2 text-xs leading-4">
                  Your SDK may be bootstrapped with a hydrated payload.
                </div>
              </Callout.Text>
            </Callout.Root>
          ) : !canConnect ? (
            <Callout.Root color="red" size="1" className="mb-4">
              <Callout.Icon>
                <PiWarningFill />
              </Callout.Icon>
              <Callout.Text>
                <div>
                  Neither a valid API connection nor an SDK payload were found.
                </div>
                <div className="mt-2 text-xs leading-4">
                  Your SDK cannot reference features or experiments.
                </div>
              </Callout.Text>
            </Callout.Root>
          ) : null}

          <div className="mb-4">
            <div className="box mb-2">
              <Text as="div" size="2" weight="regular" mb="2">
                <div className="font-semibold mb-0.5">Host:</div>
                <code className="text-gold-11">{apiHost || "None"}</code>
              </Text>
              <Text as="div" size="2" weight="regular">
                <div className="font-semibold mb-0.5">Client Key:</div>
                <code className="text-gold-11">{clientKey || "None"}</code>
              </Text>
            </div>
            {errorMessage ? (
              <Text as="div" size="2" weight="light" color="orange" mt="2">
                <PiWarningFill className="inline-block mr-2" />
                {errorMessage}
              </Text>
            ) : null}
          </div>
        </>
      )}

      <Accordion.Root className="accordion my-4" type="single" collapsible>
        <Accordion.Item value="front-end-debugging">
          <Accordion.Trigger className="trigger mb-2">
            <Link
              size="2"
              role="button"
              className="hover:underline"
              weight="bold"
            >
              <PiCaretRightFill className="caret mr-0.5" size={12} />
              Troubleshooting Front-End SDKs
            </Link>
          </Accordion.Trigger>
          <Accordion.Content className="accordionInner overflow-hidden w-full">
            <Text as="div" size="2" weight="regular" mb="3">
              Ensure <code className="text-gold-11">enableDevMode: true</code>{" "}
              is set in your SDK constructor (JavaScript and React only).
            </Text>
            <Text as="div" size="2" weight="regular" mb="3">
              If your site has a Content Security Policy (CSP), ensure that it
              allows your SDK to load.{" "}
              <Link
                size="2"
                href="https://docs.growthbook.io/lib/script-tag#content-security-policy-csp"
                target="_blank"
              >
                Read more
              </Link>
            </Text>
            <Text as="div" size="2" weight="regular" mb="1">
              See our SDK implementation guides:
            </Text>
            <div>
              <Link
                size="2"
                href="https://docs.growthbook.io/lib/script-tag"
                target="_blank"
              >
                HTML Script Tag SDK
              </Link>
            </div>
            <div>
              <Link
                size="2"
                href="https://docs.growthbook.io/lib/js"
                target="_blank"
              >
                JavaScript SDK
              </Link>
            </div>
            <div>
              <Link
                size="2"
                href="https://docs.growthbook.io/lib/react"
                target="_blank"
              >
                React SDK
              </Link>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
}

function externalSdksPanel({ externalSdks }: SDKHealthCheckResult) {
  const numExternalSdks = Object.keys(externalSdks || {}).length;

  return (
    <>
      {!numExternalSdks ? (
        <Text as="div" size="2" weight="regular">
          No back-end SDKs detected.
        </Text>
      ) : (
        <>
          <Text as="div" size="2" weight="regular">
            {numExternalSdks} back-end SDK
            {numExternalSdks !== 1 ? "s" : ""} detected.
          </Text>
          <div className="my-3">
            {Object.values(externalSdks || {}).map((sdkInfo, i) => (
              <div className="box" key={i}>
                <Text as="div" size="2" weight="regular" mb="2">
                  <div className="font-semibold mb-0.5">Host:</div>
                  <code className="text-gold-11">
                    {sdkInfo.apiHost || "None"}
                  </code>
                </Text>
                <Text as="div" size="2" weight="regular" mb="2">
                  <div className="font-semibold mb-0.5">Client Key:</div>
                  <code className="text-gold-11">
                    {sdkInfo.clientKey || "None"}
                  </code>
                </Text>
                <Text as="div" size="2" weight="regular">
                  <div className="font-semibold mb-0.5">SDK Version:</div>
                  <code className="text-gold-11">
                    {sdkInfo.version || "unknown"}
                  </code>
                </Text>
              </div>
            ))}
          </div>
        </>
      )}

      <Accordion.Root className="accordion my-4" type="single" collapsible>
        <Accordion.Item value="debug-log">
          <Accordion.Trigger className="trigger mb-2">
            <Link
              size="2"
              role="button"
              className="hover:underline"
              weight="bold"
            >
              <PiCaretRightFill className="caret mr-0.5" size={12} />
              Debugging Back-End SDKs
            </Link>
          </Accordion.Trigger>
          <Accordion.Content className="accordionInner overflow-hidden w-full">
            <Text as="div" size="2" weight="regular" mb="3">
              Any DevTools overrides you have set are automatically sent to any
              back ends on the same origin via a <code>_gbdebug</code> cookie.
            </Text>
            <Text as="div" size="2" weight="regular" mb="3">
              To apply these overrides in a back-end SDK and to display back-end
              SDK event logs, see the documentation below.
            </Text>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
}

function AttributesPanel() {
  const missing = useMissingAttributes();
  const [, setCurrentTab] = useTabState("currentTab", "features");
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {missing.length ? (
          <>
            Features on this page target attributes the SDK hasn&rsquo;t set:
            <MissingAttributesList missing={missing} />
          </>
        ) : (
          <>Every attribute that features on this page target is set.</>
        )}
      </Text>
      <Text as="div" size="1" className="mt-3 text-gray-11">
        Checks the features the page has evaluated, using the current
        user&rsquo;s attributes. A <code>null</code> value counts as set.{" "}
        <Link
          href="#"
          role="button"
          size="1"
          onClick={(e) => {
            e.preventDefault();
            setCurrentTab("attributes");
          }}
        >
          Open the Attributes tab
        </Link>
      </Text>
    </>
  );
}

function pluginsPanel({ plugins }: SDKHealthCheckResult) {
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {plugins?.length ? (
          <>
            {plugins.map((plugin, i) => (
              <div key={`${plugin.name}_${i}`}>
                <code className="text-gold-11">{plugin.name}</code>
                {plugin.appliedAfterSetup ? (
                  <span className="text-gray-11"> (applied after setup)</span>
                ) : null}
                {plugin.custom ? (
                  <CallbackSource source={plugin.source} />
                ) : null}
              </div>
            ))}
          </>
        ) : (
          <>No plugins were passed to the SDK constructor.</>
        )}
      </Text>
      <Text as="div" size="1" className="mt-3 text-gray-11">
        Lists plugins passed to the SDK constructor. Plugins applied later, eg{" "}
        <code>plugin(gb)</code>, aren&rsquo;t detectable, except the tracking
        plugins, which are recognised from the callbacks they install.
      </Text>
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
            Unable to find your SDK version. This may indicate a version prior
            to 0.30.0.
          </Text>
          <div className="mt-4">
            <Callout.Root color="red" size="1" className="mt-2 mb-4">
              <Callout.Icon>
                <PiWarningOctagonFill />
              </Callout.Icon>
              <Callout.Text>
                Possibly using an unsupported legacy version of the SDK
                (&lt;0.30.0)
              </Callout.Text>
            </Callout.Root>
            <Text>
              Versions prior to 0.30.0 are unsupported in DevTools.
              Additionally, versions prior to 0.23.0 are considered unstable.
              Consider updating to the latest version.
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
              <Callout.Root color="red" size="1" className="mt-2 mb-4">
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

function CallbackSource({ source }: { source?: string }) {
  const [theme, , themeReady] = useGlobalState<Theme>("theme", "system", true);
  const dark = useMemo(() => isDark(theme), [theme, themeReady]);
  if (!source) return null;
  return (
    <Accordion.Root className="accordion my-4" type="single" collapsible>
      <Accordion.Item value="source">
        <Accordion.Trigger className="trigger mb-2">
          <Link
            size="2"
            role="button"
            className="hover:underline"
            weight="bold"
          >
            <PiCaretRightFill className="caret mr-0.5" size={12} />
            Source
          </Link>
        </Accordion.Trigger>
        <Accordion.Content className="accordionInner overflow-hidden w-full">
          <div className="bg-field border border-gray-a3 rounded-md">
            <Prism
              language="javascript"
              style={!dark ? codeThemeLight : codeThemeDark}
              customStyle={{
                padding: "5px",
                margin: 0,
                border: "0px none",
                background: "unset",
                backgroundColor: "unset",
                maxHeight: 300,
                fontFamily: `Consolas, "Bitstream Vera Sans Mono", "Courier New", Courier, monospace`,
                fontSize: "0.9em",
                lineHeight: "12px",
              }}
              codeTagProps={{
                className: "text-2xs-important !whitespace-pre-wrap break-all",
              }}
            >
              {source}
            </Prism>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

function trackingCallbackPanel({
  trackingCallbackParams,
  trackingCallbackSource,
  hasTrackingCallback,
  usingLogEvent,
  version,
}: SDKHealthCheckResult) {
  const missingUserContext =
    expectsUserContextParam(version) && trackingCallbackParams?.length === 2;
  const unusedUserContext =
    version &&
    !expectsUserContextParam(version) &&
    trackingCallbackParams?.length === 3;
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {!hasTrackingCallback &&
        eventLoggerReplacesCallbacks({ usingLogEvent }) ? (
          <>
            Not needed. Managed Warehouse uses{" "}
            <code className="text-gold-11">logEvent</code>: the SDK sends each
            experiment exposure to it as an Experiment Viewed event.
          </>
        ) : !hasTrackingCallback ? (
          <>
            The SDK is not using a{" "}
            <code className="text-gold-11">trackingCallback</code>. You will
            need to add one to track experiment exposure to your data warehouse.
          </>
        ) : missingUserContext ? (
          <>
            The SDK is using a{" "}
            <code className="text-gold-11">trackingCallback</code> with{" "}
            <em className="text-amber-600">2</em> params. Add a third{" "}
            <code>userContext</code> param to use newer features.
          </>
        ) : unusedUserContext ? (
          <>
            The SDK is using a{" "}
            <code className="text-gold-11">trackingCallback</code> with{" "}
            <em className="text-amber-600">3</em> params, but SDK {version}{" "}
            never passes <code>userContext</code>. Upgrade to{" "}
            {USER_CONTEXT_SDK_VERSION} or later to use it.
          </>
        ) : !trackingCallbackParamsAreValid(trackingCallbackParams, version) ? (
          <>
            The SDK is using a{" "}
            <code className="text-gold-11">trackingCallback</code> with{" "}
            <em className="text-amber-600">{trackingCallbackParams?.length}</em>{" "}
            param{trackingCallbackParams?.length === 1 ? "" : "s"} instead of{" "}
            <code>(experiment, result)</code> or{" "}
            <code>(experiment, result, userContext)</code>. Please check your
            implementation.
          </>
        ) : trackingCallbackParams?.length ? (
          <>
            The SDK is using a{" "}
            <code className="text-gold-11">trackingCallback</code> with{" "}
            {trackingCallbackParams.length} param
            {trackingCallbackParams.length === 1 ? "" : "s"}:{" "}
            <code>({trackingCallbackParams.join(", ")})</code>.
          </>
        ) : (
          <>
            The SDK is using a{" "}
            <code className="text-gold-11">trackingCallback</code>.
          </>
        )}
      </Text>
      <CallbackSource source={trackingCallbackSource} />
    </>
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

// function streamingPanel({
//   streaming,
//   streamingHost,
//   clientKey,
//   streamingHostRequestHeaders,
// }: SDKHealthCheckResult) {
//   return (
//     <>
//       <Text as="div" size="2" weight="regular" mb="2">
//         {streaming
//           ? "The SDK is using streaming (SSE)."
//           : "The SDK is not using streaming (SSE). Streaming is optional and is used to update the SDK with the latest data without refreshing the page."}
//       </Text>
//       <Text as="div" size="2" weight="regular" mb="2">
//         <div className="font-semibold mb-0.5">Streaming host:</div>
//         <code className="text-gold-11">{streamingHost || "None"}</code>
//       </Text>
//       <Text as="div" size="2" weight="regular">
//         <div className="font-semibold mb-0.5">Client Key:</div>
//         <code className="text-gold-11">{clientKey || "None"}</code>
//       </Text>
//       <Text as="div" size="2" weight="regular" mt="2">
//         <div className="font-semibold">Streaming host request headers:</div>
//         <div className="mt-0.5">
//           <code className="text-gold-11">
//             {JSON.stringify(streamingHostRequestHeaders) || "None"}
//           </code>
//         </div>
//       </Text>
//     </>
//   );
// }

function payloadPanel({ hasPayload, payload }: SDKHealthCheckResult) {
  return (
    <>
      {!hasPayload ? (
        <>
          <Callout.Root color="amber" size="1" className="mb-4">
            <Callout.Icon>
              <PiWarningFill />
            </Callout.Icon>
            <Callout.Text>No payload present in your SDK</Callout.Text>
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

function logEventPanel({
  usingLogEvent,
  logEventSource,
}: SDKHealthCheckResult) {
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {usingLogEvent ? (
          <>
            The SDK is using a <code className="text-gold-11">logEvent</code>{" "}
            callback.
          </>
        ) : (
          <>
            The SDK is not using a{" "}
            <code className="text-gold-11">logEvent</code> callback. This
            optional callback allows you to track events to a data warehouse
            directly from the SDK.
          </>
        )}
      </Text>
      <CallbackSource source={logEventSource} />
    </>
  );
}

function IngestorDetectionNote() {
  return (
    <Text as="div" size="1" className="mt-3 text-gray-11">
      DevTools can only count requests sent after it starts watching the page.
      On busy pages, requests sent while the page is still loading can be
      missed, so the count may be low. Later events will still show up here.
    </Text>
  );
}

function eventIngestorPanel({ ingestor, clientKey }: SDKHealthCheckResult) {
  const { keyMismatch } = summarizeIngestor(ingestor, clientKey);
  if (!ingestor?.requestCount) {
    return (
      <>
        <Text as="div" size="2" weight="regular">
          {ingestor?.usingGrowthBookTracking ? (
            <>
              The SDK uses{" "}
              <code className="text-gold-11">growthbookTrackingPlugin</code>,
              but no requests to an event ingestor have been seen on this page
              yet. Events are sent after the first experiment exposure or
              feature evaluation. If those have happened, the requests may be
              blocked, for example by an ad blocker or CSP.
            </>
          ) : (
            <>
              The SDK isn&rsquo;t sending events to a GrowthBook event ingestor.
              Managed Warehouse and event forwarding need{" "}
              <code className="text-gold-11">growthbookTrackingPlugin</code>, or{" "}
              <code className="text-gold-11">
                data-tracking=&quot;growthbook&quot;
              </code>{" "}
              on the script tag.
            </>
          )}
        </Text>
        {ingestor?.usingGrowthBookTracking ? <IngestorDetectionNote /> : null}
      </>
    );
  }
  return (
    <>
      <Text as="div" size="2" weight="regular">
        <div className="mb-1">Sending events to:</div>
        {ingestor.hosts.map((host) => {
          const region = ingestorRegion(host);
          return (
            <div key={host}>
              <code className="text-gold-11">{host}</code>{" "}
              <span className="text-gray-11">
                ({region ? `${region} ingestor` : "custom host"})
              </span>
            </div>
          );
        })}
        <div className="mt-2">
          {ingestor.requestCount} request
          {ingestor.requestCount === 1 ? "" : "s"} seen
          {ingestor.lastStatus
            ? `, last response ${ingestor.lastStatus}`
            : null}
          .
        </div>
        {ingestor.errorCount ? (
          <div className="mt-1 text-amber-600">
            {ingestor.errorCount} request{ingestor.errorCount === 1 ? "" : "s"}{" "}
            failed.
          </div>
        ) : null}
        {keyMismatch ? (
          <div className="mt-1 text-amber-600">
            Requests use client key{" "}
            <code>{ingestor.clientKeys.join(", ")}</code>, but the SDK&rsquo;s
            is <code>{clientKey}</code>. This is expected only if the page runs
            more than one SDK connection.
          </div>
        ) : null}
      </Text>
      <IngestorDetectionNote />
    </>
  );
}

function onFeatureUsagePanel({
  usingOnFeatureUsage,
  onFeatureUsageSource,
  usingLogEvent,
}: SDKHealthCheckResult) {
  return (
    <>
      <Text as="div" size="2" weight="regular">
        {usingOnFeatureUsage ? (
          <>
            The SDK is using an{" "}
            <code className="text-gold-11">onFeatureUsage</code> callback.
          </>
        ) : eventLoggerReplacesCallbacks({ usingLogEvent }) ? (
          <>
            Not needed. Managed Warehouse uses{" "}
            <code className="text-gold-11">logEvent</code>: the SDK sends
            feature evaluations to it as Feature Evaluated events.
          </>
        ) : (
          <>
            The SDK is not using a{" "}
            <code className="text-gold-11">onFeatureUsage</code> callback. This
            optional callback allows you to track feature flag telemetry to a
            data warehouse.
          </>
        )}
      </Text>
      <CallbackSource source={onFeatureUsageSource} />
    </>
  );
}
