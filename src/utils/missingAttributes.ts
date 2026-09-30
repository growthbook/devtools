import type {
  FeatureDefinition,
  FeatureResult,
  FeatureRule,
} from "@growthbook/growthbook";
import { ruleVariations } from "./contextualBandits";

type Attributes = Record<string, unknown>;
type SavedGroups = Record<string, unknown>;

export type MissingAttribute = {
  attribute: string;
  // Evaluated features with an evaluated rule whose condition reads it
  features: string[];
  // Experiments and rollouts that can't bucket users without it
  hashFor: string[];
};

// Present counts as set, null included; dot paths match the SDK's condition lookup
export function hasAttribute(attributes: Attributes, path: string): boolean {
  let current: unknown = attributes;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return true;
}

// Mirrors the SDK, which can't hash a falsy value, so here null and "" are missing too
export function hasHashValue(
  attributes: Attributes,
  hashAttribute = "id",
  fallbackAttribute?: string,
): boolean {
  return (
    !!attributes[hashAttribute] ||
    (!!fallbackAttribute && !!attributes[fallbackAttribute])
  );
}

// Attribute names a condition reads, following $savedGroup references.
// $exists checks are skipped, since there the attribute being absent is the point.
export function conditionAttributes(
  condition: unknown,
  savedGroups: SavedGroups = {},
): string[] {
  const keys = new Set<string>();
  const walk = (node: unknown, visited: Set<string>) => {
    if (Array.isArray(node)) {
      node.forEach((child) => walk(child, visited));
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "$savedGroup") {
        walkSavedGroup(value, visited);
      } else if (key.startsWith("$")) {
        walk(value, visited);
      } else if (!(value && typeof value === "object" && "$exists" in value)) {
        keys.add(key);
      }
    }
  };
  const walkSavedGroup = (reference: unknown, visited: Set<string>) => {
    if (!reference || typeof reference !== "object") return;
    const { id, attributeKey } = reference as {
      id?: unknown;
      attributeKey?: unknown;
    };
    if (typeof id !== "string" || visited.has(id)) return;
    const entry = savedGroups[id] as
      | { type?: string; attributeKey?: unknown; condition?: unknown }
      | undefined;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
    if (entry.type === "list") {
      const key = attributeKey ?? entry.attributeKey;
      if (typeof key === "string") keys.add(key);
    } else if (entry.type === "condition") {
      walk(entry.condition, new Set(visited).add(id));
    }
  };
  walk(condition, new Set());
  return [...keys];
}

// A rollout only hashes once coverage or a range limits it
function ruleNeedsHash(rule: Record<string, unknown>): boolean {
  return (
    !!ruleVariations(rule) ||
    rule.coverage !== undefined ||
    rule.range !== undefined
  );
}

// The attributes one rule reads that the page hasn't set
export function unsetRuleAttributes(
  rule: FeatureRule,
  attributes: Attributes,
  savedGroups?: SavedGroups,
): { condition: string[]; hash?: string } {
  const condition = conditionAttributes(rule.condition, savedGroups).filter(
    (attribute) => !hasAttribute(attributes, attribute),
  );
  const hashAttribute = rule.hashAttribute ?? "id";
  const hash =
    ruleNeedsHash(rule as Record<string, unknown>) &&
    !hasHashValue(attributes, hashAttribute, rule.fallbackAttribute)
      ? hashAttribute
      : undefined;
  return { condition, hash };
}

// Attributes that evaluated features read but the page hasn't set.
// Only rules up to the one that matched were evaluated for this user.
export function findMissingAttributes({
  features,
  attributes,
  savedGroups,
  evaluatedFeatures,
}: {
  features: Record<string, FeatureDefinition>;
  attributes: Attributes;
  savedGroups?: SavedGroups;
  evaluatedFeatures: Map<string, FeatureResult | undefined>;
}): MissingAttribute[] {
  const missing = new Map<string, MissingAttribute>();
  const entry = (attribute: string) => {
    let found = missing.get(attribute);
    if (!found) {
      found = { attribute, features: [], hashFor: [] };
      missing.set(attribute, found);
    }
    return found;
  };

  for (const [fid, result] of evaluatedFeatures) {
    // An override skips the rules entirely
    if (result?.source === "override") continue;
    const rules = features[fid]?.rules ?? [];
    const matched = result?.ruleId
      ? rules.findIndex((rule) => rule.id === result.ruleId)
      : -1;
    const evaluated = matched >= 0 ? rules.slice(0, matched + 1) : rules;

    for (const rule of evaluated) {
      const unset = unsetRuleAttributes(rule, attributes, savedGroups);
      for (const attribute of unset.condition) {
        const found = entry(attribute);
        if (!found.features.includes(fid)) found.features.push(fid);
      }
      if (unset.hash) {
        const found = entry(unset.hash);
        const key = rule.key ?? fid;
        if (!found.hashFor.includes(key)) found.hashFor.push(key);
      }
    }
  }
  return [...missing.values()];
}
