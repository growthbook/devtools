import {
  conditionAttributeKeys,
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

describe("conditionAttributeKeys", () => {
  it("reads plain attribute names", () => {
    expect(conditionAttributeKeys({ country: "US", device: "mobile" })).toEqual(
      ["country", "device"],
    );
  });

  it("descends through $and / $or wrappers", () => {
    expect(
      conditionAttributeKeys({
        $or: [{ country: "US" }, { $and: [{ plan: "pro" }, { seats: 5 }] }],
      }),
    ).toEqual(["country", "plan", "seats"]);
  });

  it("does not report operators as attributes", () => {
    expect(conditionAttributeKeys({ age: { $gt: 18 } })).toEqual(["age"]);
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
