import {
  hasTrackingCallbackIssues,
  parseCallbackParams,
  trackingCallbackParamsAreValid,
} from "./sdkCallbacks";

describe("parseCallbackParams", () => {
  it("parses arrow functions", () => {
    expect(parseCallbackParams((experiment, result) => {})).toEqual([
      "experiment",
      "result",
    ]);
  });

  it("parses arrow functions with a userContext param", () => {
    expect(
      parseCallbackParams((experiment, result, userContext) => {}),
    ).toEqual(["experiment", "result", "userContext"]);
  });

  it("parses function expressions", () => {
    expect(
      parseCallbackParams(function (experiment: any, result: any) {}),
    ).toEqual(["experiment", "result"]);
  });

  it("parses async functions", () => {
    expect(
      parseCallbackParams(async function (experiment: any, result: any) {}),
    ).toEqual(["experiment", "result"]);
  });

  it("parses a single unparenthesized arrow param", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cb = (experiment: any) => ({ key: experiment.key });
    expect(parseCallbackParams(cb)).toEqual(["experiment"]);
  });

  it("does not truncate at a destructured param", () => {
    expect(
      parseCallbackParams(
        (experiment, { variationId }, userContext) => undefined,
      ),
    ).toEqual(["experiment", "{ variationId }", "userContext"]);
  });

  it("does not truncate at a default value containing parens", () => {
    expect(
      parseCallbackParams((experiment, result = getDefault(), extra) => {}),
    ).toEqual(["experiment", "result = getDefault()", "extra"]);
  });

  it("parses rest params", () => {
    expect(parseCallbackParams((...args) => {})).toEqual(["...args"]);
  });

  it("parses zero params", () => {
    expect(parseCallbackParams(() => {})).toEqual([]);
  });

  it("returns undefined for native/bound functions", () => {
    const bound = ((a: any, b: any) => {}).bind(null);
    expect(parseCallbackParams(bound)).toBeUndefined();
  });
});

describe("trackingCallbackParamsAreValid", () => {
  it("accepts 2 params", () => {
    expect(trackingCallbackParamsAreValid(["experiment", "result"])).toBe(true);
  });

  it("accepts 3 params", () => {
    expect(
      trackingCallbackParamsAreValid(["experiment", "result", "userContext"]),
    ).toBe(true);
  });

  it("accepts rest params", () => {
    expect(trackingCallbackParamsAreValid(["...args"])).toBe(true);
  });

  it("accepts unknown params rather than warning", () => {
    expect(trackingCallbackParamsAreValid(undefined)).toBe(true);
  });

  it("rejects too few params", () => {
    expect(trackingCallbackParamsAreValid(["experiment"])).toBe(false);
    expect(trackingCallbackParamsAreValid([])).toBe(false);
  });

  it("rejects too many params", () => {
    expect(trackingCallbackParamsAreValid(["a", "b", "c", "d"])).toBe(false);
  });
});

describe("hasTrackingCallbackIssues", () => {
  it("does not flag a missing tracking callback as an issue", () => {
    expect(hasTrackingCallbackIssues({ hasTrackingCallback: false })).toBe(
      false,
    );
  });

  it("does not flag a 3-param tracking callback", () => {
    expect(
      hasTrackingCallbackIssues({
        hasTrackingCallback: true,
        trackingCallbackParams: ["experiment", "result", "userContext"],
      }),
    ).toBe(false);
  });

  it("flags a 1-param tracking callback", () => {
    expect(
      hasTrackingCallbackIssues({
        hasTrackingCallback: true,
        trackingCallbackParams: ["experiment"],
      }),
    ).toBe(true);
  });
});

declare function getDefault(): any;
