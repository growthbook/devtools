import { isContextualBandit, ruleVariations } from "./contextualBandits";

// The teresa-test-cb rule exactly as a live GrowthBook payload serves it:
// contextualVariations is present, but there is no contextualBanditRef and no
// top-level contextualBandits block until the bandit has trained contexts.
const realRule = {
  id: "fr_19g6mms6mcr6p",
  hashAttribute: "id",
  seed: "d5212dbe-3cee-430b-9a43-75d5c7b13474",
  hashVersion: 2,
  disableStickyBucketing: true,
  contextualVariations: [true, true, true, true, true],
  weights: [0.2, 0.2, 0.2, 0.2, 0.2],
  key: "teresa-test-cb",
  meta: [{ key: "0" }, { key: "1" }, { key: "2" }, { key: "3" }, { key: "4" }],
  phase: "0",
};

describe("a contextual bandit from a live payload", () => {
  it("is detected without a contextualBanditRef", () => {
    expect(isContextualBandit(realRule)).toBe(true);
  });

  it("reaches the experiment list via contextualVariations", () => {
    expect(ruleVariations(realRule)).toHaveLength(5);
  });

  it("is still detected once the ref appears", () => {
    expect(
      isContextualBandit({ ...realRule, contextualBanditRef: "cb_x" }),
    ).toBe(true);
  });

  it("does not flag an ordinary experiment rule", () => {
    const ordinaryRule: {
      variations: boolean[];
      contextualVariations?: unknown[];
    } = { variations: [true, false] };
    expect(isContextualBandit(ordinaryRule)).toBe(false);
  });
});
