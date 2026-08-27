import type { Experiment, FeatureRule } from "@growthbook/growthbook";

// Declared by the SDK but not exported from its entry point
type CBContext = {
  leafId: number;
  variationWeights: number[];
  banditVersion?: number;
};
type ContextualBanditDefinition = {
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

// leafId -1 means no context matched and the SDK used the aggregate weights
export const FALLBACK_LEAF_ID = -1;

// Bandit rules keep their variations here so pre-1.7 SDKs skip the rule
export function ruleVariations<T>(
  rule: FeatureRule<T>,
): Experiment<T>["variations"] | undefined {
  return (rule.contextualVariations ?? rule.variations) as
    | Experiment<T>["variations"]
    | undefined;
}

// contextualBanditRef only appears once the bandit has trained contexts
export function isContextualBandit(
  experiment:
    | { contextualVariations?: unknown[]; contextualBanditRef?: string }
    | undefined,
): boolean {
  return (
    !!experiment?.contextualVariations || !!experiment?.contextualBanditRef
  );
}

export function usedFallbackWeights(cb: CBContext | undefined): boolean {
  return cb?.leafId === FALLBACK_LEAF_ID;
}

// The attributes the matched context tested - the "contextual" part
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

// Attribute names in a condition, descending through $and/$or wrappers
function conditionAttributeKeys(condition: Record<string, unknown>): string[] {
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
