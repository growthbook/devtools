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
  FALLBACK_LEAF_ID,
  getMatchedContextAttributes,
  usedFallbackWeights,
} from "@/utils/contextualBandits";

// Matches how experiment weights are shown elsewhere, eg Rule.tsx
function formatWeight(weight: number) {
  return Math.round(weight * 1000) / 10 + "%";
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 text-xs py-0.5">
      <div className="text-gray-11" style={{ width: 110 }}>
        {label}
      </div>
      <div className="font-semibold break-all">{value}</div>
    </div>
  );
}

export default function ContextualBanditDetail({
  experiment,
  variationNames,
  forcedVariation,
}: {
  experiment: Experiment<any> & {
    contextualBanditRef?: string;
    contextualVariations?: unknown[];
  };
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
        leafId: banditResult.leafId ?? FALLBACK_LEAF_ID,
        variationWeights: banditResult.variationWeights ?? [],
        banditVersion: banditResult.banditVersion,
      }
    : undefined;

  const weights = cb?.variationWeights ?? experiment.weights;
  const isFallback = usedFallbackWeights(cb);
  const context = getMatchedContextAttributes(definition, cb, attributes || {});
  const contextKeys = Object.keys(context || {});
  const isForced = forcedVariation !== undefined;
  const selectedVariation = banditResult?.variationId;

  const leafLabel = !cb
    ? "No trained contexts in payload"
    : isFallback
      ? "No matching context"
      : cb.leafId;

  return (
    <>
      <div className="label font-semibold mt-3">Contextual Bandit</div>

      <div className="box mb-3">
        {banditRef ? <MetaRow label="Bandit" value={banditRef} /> : null}
        <MetaRow label="Current leaf" value={leafLabel} />
        {cb?.banditVersion !== undefined ? (
          <MetaRow label="Bandit version" value={cb.banditVersion} />
        ) : null}
      </div>

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
                Variation Weights
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
                      className={
                        i === selectedVariation
                          ? "truncate font-semibold"
                          : "truncate"
                      }
                      style={{ width: 130 }}
                    >
                      {i} &middot; {variationNames[i] ?? `Variation ${i}`}
                    </div>
                    <div className="flex-1 rounded-full bg-gray-a4 h-1.5 overflow-hidden">
                      <div
                        className={
                          i === selectedVariation
                            ? "h-full rounded-full bg-violet-9"
                            : "h-full rounded-full bg-violet-6"
                        }
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                    <div
                      className={
                        i === selectedVariation
                          ? "text-right font-semibold"
                          : "text-right"
                      }
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
