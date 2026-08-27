import React from "react";
import { Badge, Text } from "@radix-ui/themes";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill } from "react-icons/pi";
import { Experiment } from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import useSdkData from "@/app/hooks/useSdkData";
import useGBSandboxEval from "@/app/hooks/useGBSandboxEval";
import {
  ContextualBanditDefinitions,
  getMatchedContextAttributes,
  usedFallbackWeights,
} from "@/utils/contextualBandits";
import ValueField from "@/app/components/ValueField";

// Matches how experiment weights are shown elsewhere, eg Rule.tsx
function formatWeight(weight: number) {
  return Math.round(weight * 1000) / 10 + "%";
}

export default function ContextualBanditDetail({
  experiment,
  variationNames,
  forcedVariation,
}: {
  experiment: Experiment<any> & { contextualBanditRef?: string };
  variationNames: string[];
  forcedVariation?: number;
}) {
  const sdkData = useSdkData();
  const [attributes] = useTabState<Record<string, any>>("attributes", {});
  const { evaluatedFeatures } = useGBSandboxEval();

  const banditRef = experiment.contextualBanditRef;
  const definitions = sdkData?.payload?.contextualBandits as
    | ContextualBanditDefinitions
    | undefined;
  const definition = banditRef ? definitions?.[banditRef] : undefined;

  // The SDK only applies bandit weights while evaluating the feature rule, so
  // they land on the feature's experimentResult - never on gb.run() or the raw rule
  const banditResult = Object.values(evaluatedFeatures)
    .map((f) => f?.result?.experimentResult)
    .find(
      (r) => r?.key === experiment.key && r?.variationWeights !== undefined,
    );
  const cb = banditResult
    ? {
        leafId: banditResult.leafId ?? -1,
        variationWeights: banditResult.variationWeights ?? [],
        banditVersion: banditResult.banditVersion,
      }
    : undefined;
  // The rule's own weights, used when the payload has no trained contexts
  const aggregateWeights = experiment.weights;
  const weights = cb?.variationWeights ?? aggregateWeights;
  const hasContextWeights = !!cb?.variationWeights;
  const isFallback = usedFallbackWeights(cb);
  const context = getMatchedContextAttributes(definition, cb, attributes || {});
  const contextKeys = Object.keys(context || {});
  const isForced = forcedVariation !== undefined;

  return (
    <>
      <div className="mt-4 mb-1 text-md font-semibold">Contextual Bandit</div>

      {banditRef && !definition ? (
        <Text as="div" size="2" color="amber" mb="3">
          The bandit <code>{banditRef}</code> is not in the SDK payload, so
          fallback weights were used.
        </Text>
      ) : !banditRef ? (
        <Text as="div" size="2" color="gray" mb="3">
          No trained contexts are in the SDK payload yet, so every user gets the
          fallback weights below.
        </Text>
      ) : null}

      {isFallback ? (
        <Text as="div" size="2" color="amber" mb="3">
          No context matched this user, so fallback weights were used.
        </Text>
      ) : null}
      {isForced ? (
        <Text as="div" size="2" color="amber" mb="3">
          A forced variation is active, so these weights are overridden and not
          what the bandit would serve.
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
                  : "Fallback weights"}
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
                    <div className="truncate" style={{ width: 130 }}>
                      {i} &middot; {variationNames[i] ?? `Variation ${i}`}
                    </div>
                    <div className="flex-1 rounded-full bg-gray-a4 h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-9"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <div className="text-right" style={{ width: 52 }}>
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
                  <div key={key} className="flex items-start gap-2 py-0.5">
                    <div
                      className="text-xs text-gray-11 truncate"
                      style={{ width: 130 }}
                    >
                      {key}
                    </div>
                    <ValueField
                      value={context?.[key]}
                      valueType="string"
                      maxHeight={40}
                      customPrismStyle={{ padding: 0 }}
                      customPrismOuterStyle={{ marginTop: 0 }}
                    />
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ) : null}
      </Accordion.Root>
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
