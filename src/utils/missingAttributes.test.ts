import type { FeatureDefinition, FeatureResult } from "@growthbook/growthbook";
import {
  conditionAttributes,
  findMissingAttributes,
  hasAttribute,
  hasHashValue,
  unsetRuleAttributes,
} from "./missingAttributes";

describe("hasAttribute", () => {
  it("counts null as set, since it is a valid attribute value", () => {
    expect(hasAttribute({ plan: null }, "plan")).toBe(true);
    expect(hasAttribute({}, "plan")).toBe(false);
  });

  it("follows dot paths", () => {
    expect(hasAttribute({ user: { plan: "pro" } }, "user.plan")).toBe(true);
    expect(hasAttribute({ user: {} }, "user.plan")).toBe(false);
  });
});

describe("hasHashValue", () => {
  it("treats falsy values as missing, like the SDK", () => {
    expect(hasHashValue({ id: null })).toBe(false);
    expect(hasHashValue({ id: "" })).toBe(false);
    expect(hasHashValue({ id: "u1" })).toBe(true);
  });

  it("uses the fallback attribute", () => {
    expect(hasHashValue({ deviceId: "d1" }, "id", "deviceId")).toBe(true);
  });
});

describe("conditionAttributes", () => {
  it("reads attributes through $and, $or, and $not", () => {
    expect(
      conditionAttributes({
        $and: [{ country: "US" }, { $or: [{ plan: "pro" }, { beta: true }] }],
        $not: { role: "admin" },
      }).sort(),
    ).toEqual(["beta", "country", "plan", "role"]);
  });

  it("skips $exists checks, where absence is intended", () => {
    expect(conditionAttributes({ plan: { $exists: false } })).toEqual([]);
  });

  it("follows $savedGroup references", () => {
    const savedGroups = {
      grp_list: { type: "list", attributeKey: "email", values: ["a@b.c"] },
      grp_cond: { type: "condition", condition: { company: "acme" } },
    };
    expect(
      conditionAttributes(
        {
          $and: [
            { $savedGroup: { id: "grp_list" } },
            { $savedGroup: { id: "grp_cond" } },
          ],
        },
        savedGroups,
      ).sort(),
    ).toEqual(["company", "email"]);
  });

  it("prefers the reference's attributeKey over the list's own", () => {
    const savedGroups = {
      grp: { type: "list", attributeKey: "email", values: [] },
    };
    expect(
      conditionAttributes(
        { $savedGroup: { id: "grp", attributeKey: "workEmail" } },
        savedGroups,
      ),
    ).toEqual(["workEmail"]);
  });

  it("stops at a saved group that references itself", () => {
    const savedGroups = {
      loop: { type: "condition", condition: { $savedGroup: { id: "loop" } } },
    };
    expect(
      conditionAttributes({ $savedGroup: { id: "loop" } }, savedGroups),
    ).toEqual([]);
  });
});

describe("findMissingAttributes", () => {
  const features: Record<string, FeatureDefinition> = {
    checkout: {
      defaultValue: false,
      rules: [
        { id: "r1", condition: { plan: "pro" }, force: true },
        {
          id: "r2",
          key: "checkout-test",
          variations: [false, true],
          hashAttribute: "id",
        },
        { id: "r3", condition: { country: "US" }, force: true },
      ],
    },
  };
  const evaluated = (result?: Partial<FeatureResult>) =>
    new Map([["checkout", result as FeatureResult | undefined]]);

  it("reports unset condition and hash attributes on evaluated rules", () => {
    expect(
      findMissingAttributes({
        features,
        attributes: {},
        evaluatedFeatures: evaluated({ source: "defaultValue" }),
      }),
    ).toEqual([
      { attribute: "plan", features: ["checkout"], hashFor: [] },
      { attribute: "id", features: [], hashFor: ["checkout-test"] },
      { attribute: "country", features: ["checkout"], hashFor: [] },
    ]);
  });

  it("ignores rules after the one that matched", () => {
    const missing = findMissingAttributes({
      features,
      attributes: { id: "u1", plan: null },
      evaluatedFeatures: evaluated({ source: "experiment", ruleId: "r2" }),
    });
    expect(missing).toEqual([]);
  });

  it("ignores features that weren't evaluated or were overridden", () => {
    expect(
      findMissingAttributes({
        features,
        attributes: {},
        evaluatedFeatures: new Map(),
      }),
    ).toEqual([]);
    expect(
      findMissingAttributes({
        features,
        attributes: {},
        evaluatedFeatures: evaluated({ source: "override" }),
      }),
    ).toEqual([]);
  });
});

describe("unsetRuleAttributes", () => {
  it("only checks the hash attribute when the rule buckets users", () => {
    expect(unsetRuleAttributes({ force: true }, {})).toEqual({
      condition: [],
      hash: undefined,
    });
    expect(unsetRuleAttributes({ force: true, coverage: 0.5 }, {})).toEqual({
      condition: [],
      hash: "id",
    });
  });
});
