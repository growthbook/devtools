import {
  getMatchedContextAttributes,
  isContextualBandit,
  ruleVariations,
  usedFallbackWeights,
} from "./contextualBandits";

describe("ruleVariations", () => {
  it("reads contextualVariations, which bandit rules use instead", () => {
    expect(ruleVariations({ contextualVariations: ["a", "b", "c"] })).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("falls back to variations for a normal experiment rule", () => {
    expect(ruleVariations({ variations: ["on", "off"] })).toEqual([
      "on",
      "off",
    ]);
  });

  it("prefers contextualVariations when a rule somehow has both", () => {
    expect(
      ruleVariations({ variations: ["x"], contextualVariations: ["a", "b"] }),
    ).toEqual(["a", "b"]);
  });

  it("returns undefined for a rule with neither", () => {
    expect(ruleVariations({ force: true })).toBeUndefined();
  });
});

describe("isContextualBandit", () => {
  it("keys off contextualBanditRef", () => {
    expect(isContextualBandit({ contextualBanditRef: "cb_x" })).toBe(true);
    expect(isContextualBandit({})).toBe(false);
    expect(isContextualBandit(undefined)).toBe(false);
  });
});

describe("usedFallbackWeights", () => {
  it("treats leafId -1 as the fallback", () => {
    expect(usedFallbackWeights({ leafId: -1, variationWeights: [1] })).toBe(
      true,
    );
    expect(usedFallbackWeights({ leafId: 0, variationWeights: [1] })).toBe(
      false,
    );
    expect(usedFallbackWeights(undefined)).toBe(false);
  });
});

describe("getMatchedContextAttributes", () => {
  const definition = {
    banditVersion: 4,
    contexts: [
      {
        leafId: 0,
        condition: { country: "US", device: "mobile" },
        weights: [0.12, 0.63, 0.25],
      },
      { leafId: 1, condition: { country: "US" }, weights: [0.3, 0.4, 0.3] },
    ],
  };
  const attributes = { id: "u1", country: "US", device: "mobile", plan: "pro" };

  it("returns only the attributes the matched context tested", () => {
    expect(
      getMatchedContextAttributes(
        definition,
        { leafId: 0, variationWeights: [] },
        attributes,
      ),
    ).toEqual({ country: "US", device: "mobile" });
  });

  it("narrows to the matched context, not every context", () => {
    expect(
      getMatchedContextAttributes(
        definition,
        { leafId: 1, variationWeights: [] },
        attributes,
      ),
    ).toEqual({ country: "US" });
  });

  it("returns nothing when the weights came from the fallback", () => {
    expect(
      getMatchedContextAttributes(
        definition,
        { leafId: -1, variationWeights: [] },
        attributes,
      ),
    ).toBeUndefined();
  });

  it("descends through $and / $or in a context condition", () => {
    const nested = {
      contexts: [
        {
          leafId: 0,
          condition: { $or: [{ country: "US" }, { plan: "pro" }] },
          weights: [0.5, 0.5],
        },
      ],
    };
    expect(
      getMatchedContextAttributes(
        nested,
        { leafId: 0, variationWeights: [] },
        attributes,
      ),
    ).toEqual({ country: "US", plan: "pro" });
  });

  it("skips attributes the user does not have set", () => {
    expect(
      getMatchedContextAttributes(
        definition,
        { leafId: 0, variationWeights: [] },
        { country: "US" },
      ),
    ).toEqual({ country: "US" });
  });
});

// Result.key is the variation key ("0", "1", …), not the experiment key, so a
// lookup keyed on it silently finds nothing and the bandit panel goes inert
describe("finding a bandit result among evaluated features", () => {
  const evaluatedFeatures = {
    f1: {
      result: {
        experiment: { key: "my-bandit" },
        experimentResult: {
          key: "1",
          variationId: 1,
          leafId: 3,
          variationWeights: [0.02, 0.96, 0.02],
          banditVersion: 9,
        },
      },
    },
  };

  it("matches on the experiment key, not the result key", () => {
    const found = Object.values(evaluatedFeatures).find(
      (f) => f?.result?.experiment?.key === "my-bandit",
    )?.result?.experimentResult;
    expect(found?.leafId).toBe(3);
    expect(found?.variationWeights).toEqual([0.02, 0.96, 0.02]);
  });

  it("does not match the result key against the experiment key", () => {
    expect(evaluatedFeatures.f1.result.experimentResult.key).not.toBe(
      "my-bandit",
    );
  });
});

// The sandbox stuffs rule metadata for its debug log. The SDK indexes
// experiment.meta by variation index and throws on a short array, which took
// down the whole evaluation and left every experiment showing as inactive.
describe("stuffed rule meta", () => {
  const stuff = (rule: any, i = 0, fid = "f1") => ({
    ...rule,
    meta: ruleVariations(rule)?.length
      ? ruleVariations(rule)!.map((_, vi) => ({
          ...(rule.meta?.[vi] ?? {}),
          ruleI: i,
          featureId: fid,
        }))
      : [{ ruleI: i, featureId: fid }],
  });

  it("stays as long as the variations when the rule has no meta", () => {
    expect(stuff({ variations: ["off", "on"] }).meta).toHaveLength(2);
  });

  it("stays as long as the variations for a bandit rule", () => {
    expect(
      stuff({ contextualVariations: ["a", "b", "c", "d"] }).meta,
    ).toHaveLength(4);
  });

  it("keeps existing meta entries", () => {
    const meta = stuff({
      variations: ["a", "b"],
      meta: [
        { key: "0", name: "A" },
        { key: "1", name: "B" },
      ],
    }).meta;
    expect(meta[1]).toMatchObject({ key: "1", name: "B", ruleI: 0 });
  });

  it("still tags a rule with no variations, which the debug log reads", () => {
    expect(stuff({ force: true }).meta).toEqual([
      { ruleI: 0, featureId: "f1" },
    ]);
  });
});
