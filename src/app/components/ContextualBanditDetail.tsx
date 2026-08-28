import React from "react";
import { Badge, Text } from "@radix-ui/themes";
import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import {
  PiCaretRightFill,
  PiCheckCircleFill,
  PiInfoBold,
  PiWarningFill,
} from "react-icons/pi";
import { Experiment, Result } from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import useSdkData from "@/app/hooks/useSdkData";
import {
  ContextualBanditDefinitions,
  FALLBACK_LEAF_ID,
  getMatchedContextAttributes,
  usedFallbackWeights,
} from "@/utils/contextualBandits";
import {
  expectsUserContextParam,
  trackingCallbackParamsAreValid,
} from "@/utils/sdkCallbacks";

// Matches Rule.tsx
function formatWeight(weight: number) {
  return Math.round(weight * 1000) / 10 + "%";
}

function Check({
  ok,
  info,
  children,
  hint,
}: {
  ok?: boolean;
  info?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs mb-1">
      {info ? (
        <PiInfoBold className="text-gray-9 flex-shrink-0 mt-0.5" />
      ) : ok ? (
        <PiCheckCircleFill className="text-green-9 flex-shrink-0 mt-0.5" />
      ) : (
        <PiWarningFill className="text-amber-9 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div>{children}</div>
        {hint ? <div className="text-gray-11 mt-0.5">{hint}</div> : null}
      </div>
    </div>
  );
}

export default function ContextualBanditDetail({
  experiment,
  variationNames,
  forcedVariation,
  result,
}: {
  experiment: Experiment<any> & {
    contextualBanditRef?: string;
    contextualVariations?: unknown[];
  };
  variationNames: string[];
  forcedVariation?: number;
  result?: Result<any>;
}) {
  const sdkData = useSdkData();
  const [attributes] = useTabState<Record<string, any>>("attributes", {});
  const banditRef = experiment.contextualBanditRef;
  const definitions = sdkData?.payload?.contextualBandits as
    | ContextualBanditDefinitions
    | undefined;
  const definition = banditRef ? definitions?.[banditRef] : undefined;

  const cb = result?.variationWeights
    ? {
        leafId: result.leafId ?? FALLBACK_LEAF_ID,
        variationWeights: result.variationWeights,
        banditVersion: result.banditVersion,
      }
    : undefined;

  const weights = cb?.variationWeights ?? experiment.weights;
  const isFallback = usedFallbackWeights(cb);
  const hasContextWeights = !!cb?.variationWeights?.length && !isFallback;
  const context = getMatchedContextAttributes(definition, cb, attributes || {});
  const contextKeys = Object.keys(context || {});
  const isForced = forcedVariation !== undefined;
  const selectedVariation = result?.variationId;

  // Rewards are attributed per context, so userContext has to reach the callback
  const callbackPassesUserContext =
    !!sdkData?.hasTrackingCallback &&
    expectsUserContextParam(sdkData?.version) &&
    trackingCallbackParamsAreValid(
      sdkData?.trackingCallbackParams,
      sdkData?.version,
    );

  // Only meaningful once bandit weights were actually applied
  const leafLabel = !cb
    ? undefined
    : isFallback
      ? "No matching context"
      : `leaf: ${cb.leafId}`;
  const subline = [
    banditRef ? `contextualBanditRef: ${banditRef}` : null,
    leafLabel,
    cb?.banditVersion !== undefined ? `v${cb.banditVersion}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="label font-semibold mt-3">Contextual Bandit</div>

      {subline ? (
        <div className="text-xs text-gray-11 mb-2">{subline}</div>
      ) : null}

      {isForced ? (
        <Text as="div" size="2" color="amber" mb="3">
          A forced variation is active, so these weights are overridden and not
          what the bandit would serve.
        </Text>
      ) : null}
      {banditRef && !definition ? (
        <Text as="div" size="2" color="amber" mb="3">
          The bandit <code>{banditRef}</code> is not in the SDK payload.
        </Text>
      ) : null}

      <Accordion.Root
        className="accordion"
        type="multiple"
        defaultValue={["weights"]}
      >
        {weights?.length ? (
          <Accordion.Item value="weights">
            <Accordion.Trigger className="trigger mb-0.5">
              <Text size="2" weight="medium">
                <PiCaretRightFill className="caret mr-0.5" size={12} />
                {hasContextWeights
                  ? "Weights for this context"
                  : "Variation Weights"}
              </Text>

              <Text size="1" color="gray" ml="2">
                {weights.length} variation{weights.length === 1 ? "" : "s"}
              </Text>
            </Accordion.Trigger>
            <Accordion.Content className="accordionInner overflow-hidden w-full">
              <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
                {weights.map((weight, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-0.5 text-xs"
                  >
                    <div
                      className={clsx("truncate", {
                        "font-semibold": i === selectedVariation,
                      })}
                      style={{ width: 130 }}
                    >
                      {i} &middot; {variationNames[i] ?? `Variation ${i}`}
                    </div>
                    <div className="flex-1 rounded-full bg-gray-a4 h-1.5 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full",
                          i === selectedVariation
                            ? "bg-violet-9"
                            : "bg-violet-6",
                        )}
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <div
                      className={clsx("text-right", {
                        "font-semibold": i === selectedVariation,
                      })}
                      style={{ width: 52 }}
                    >
                      {formatWeight(weight)}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ) : null}

        {contextKeys.length ? (
          <Accordion.Item value="context">
            <Accordion.Trigger className="trigger mb-0.5">
              <Text size="2" weight="medium">
                <PiCaretRightFill className="caret mr-0.5" size={12} />
                Context used for this user
              </Text>
              <Text size="1" color="gray" ml="2">
                {contextKeys.length} attribute
                {contextKeys.length === 1 ? "" : "s"}
              </Text>
            </Accordion.Trigger>
            <Accordion.Content className="accordionInner overflow-hidden w-full">
              <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
                {contextKeys.map((key) => (
                  <div key={key} className="flex items-baseline gap-2 py-0.5">
                    <div
                      className="text-xs text-gray-11 truncate"
                      style={{ width: 110 }}
                    >
                      {key}
                    </div>
                    <div className="text-xs font-semibold break-all">
                      {JSON.stringify(context?.[key])}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ) : null}
      </Accordion.Root>

      <div className="label font-semibold mt-3">Setup</div>
      {!expectsUserContextParam(sdkData?.version) ? (
        <Check info>
          SDK {sdkData?.version ?? "version unknown"} does not pass userContext
          to trackingCallback
        </Check>
      ) : (
        <Check
          ok={callbackPassesUserContext}
          hint={
            callbackPassesUserContext
              ? undefined
              : "Bandit rewards can't be attributed without the third userContext param."
          }
        >
          {callbackPassesUserContext
            ? "trackingCallback passes userContext"
            : "trackingCallback is missing the userContext param"}
        </Check>
      )}
      {definition && !cb ? (
        <Check info>Bandit weights were not applied for this user</Check>
      ) : definition ? (
        <Check ok>Bandit definition found in payload</Check>
      ) : banditRef ? (
        <Check ok={false}>Bandit definition missing from payload</Check>
      ) : (
        <Check info>No trained contexts yet, so weights are still even</Check>
      )}
    </>
  );
}

export function ContextualBanditBadge() {
  return (
    <Badge size="1" color="violet" className="text-2xs">
      Contextual Bandit
    </Badge>
  );
}
