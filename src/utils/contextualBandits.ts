import type { Experiment, FeatureRule } from "@growthbook/growthbook";

// The SDK declares these but doesn't export them from its entry point
export type CBContext = {
  leafId: number;
  variationWeights: number[];
  banditVersion?: number;
};
export type ContextualBanditDefinition = {
  banditVersion?: number;
  contexts: {
    leafId: number;
    condition: Record<string, unknown>;
    weights: number[];
  }[];
};
export type ContextualBanditDefinitions = Record<
  string,
  ContextualBanditDefinition
>;

// A contextual bandit rule keeps its variations under `contextualVariations` so
// that pre-1.7 SDKs skip the rule instead of evaluating it with no weights
export function ruleVariations<T>(
  rule: FeatureRule<T>,
): Experiment<T>["variations"] | undefined {
  // FeatureRule types these as T[], but an experiment needs at least two
  return (rule.contextualVariations ?? rule.variations) as
    | Experiment<T>["variations"]
    | undefined;
}

export function isContextualBandit(
  experiment: { contextualBanditRef?: string } | undefined,
): boolean {
  return !!experiment?.contextualBanditRef;
}

// The SDK only sets `contextualBandit` when the user was actually bucketed in,
// so its absence on a bandit experiment means the weights aren't live
export function getContextualBandit(
  experiment: Experiment<any> | undefined,
): CBContext | undefined {
  return experiment?.contextualBandit;
}

// leafId -1 means no context matched and the SDK fell back to aggregate weights
export const FALLBACK_LEAF_ID = -1;

export function usedFallbackWeights(cb: CBContext | undefined): boolean {
  return cb?.leafId === FALLBACK_LEAF_ID;
}

// The attributes a bandit's matched context actually tested - this is the
// "contextual" part, and the only piece of the definition worth showing
export function getMatchedContextAttributes(
  definition: ContextualBanditDefinition | undefined,
  cb: CBContext | undefined,
  attributes: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!definition || !cb || usedFallbackWeights(cb)) return undefined;
  const context = definition.contexts.find((c) => c.leafId === cb.leafId);
  if (!context) return undefined;
  const used: Record<string, unknown> = {};
  for (const key of conditionAttributeKeys(context.condition)) {
    if (key in attributes) used[key] = attributes[key];
  }
  return used;
}

// Pull attribute names out of a mongo-style condition, skipping $and/$or/$not
// wrappers so nested conditions still report the attributes they test
export function conditionAttributeKeys(
  condition: Record<string, unknown>,
): string[] {
  const keys = new Set<string>();
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("$")) {
        walk(value);
      } else {
        keys.add(key);
      }
    }
  };
  walk(condition);
  return [...keys];
}
