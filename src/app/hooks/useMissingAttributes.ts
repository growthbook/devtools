import { useMemo } from "react";
import type { FeatureDefinition, FeatureResult } from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";
import useSdkData from "@/app/hooks/useSdkData";
import { LogUnionWithSource } from "@/app/utils/logs";
import {
  findMissingAttributes,
  MissingAttribute,
} from "@/utils/missingAttributes";

// Attributes that features the page actually evaluated read, but the SDK hasn't set
export default function useMissingAttributes(): MissingAttribute[] {
  const [features] = useTabState<Record<string, FeatureDefinition>>(
    "features",
    {},
  );
  const [attributes] = useTabState<Record<string, unknown>>("attributes", {});
  const [logEvents] = useTabState<LogUnionWithSource[] | undefined>(
    "logEvents",
    undefined,
  );
  const { payload } = useSdkData();

  return useMemo(() => {
    // Later logs overwrite earlier ones, so each feature keeps its current result
    const evaluatedFeatures = new Map<string, FeatureResult | undefined>();
    for (const log of logEvents || []) {
      if (log.logType === "feature") {
        evaluatedFeatures.set(log.featureKey, log.result);
      }
    }
    return findMissingAttributes({
      features,
      attributes: attributes || {},
      savedGroups: payload?.savedGroups,
      evaluatedFeatures,
    });
  }, [features, attributes, logEvents, payload]);
}
