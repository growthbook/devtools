import {
  hasTrackingCallbackIssues,
  parseCallbackParams,
  trackingCallbackParamsAreValid,
} from "./sdkCallbacks";

function getDefault() {
  return undefined;
}

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
    expect(parseCallbackParams(function (experiment, result) {})).toEqual([
      "experiment",
      "result",
    ]);
  });

  it("parses async functions", () => {
    expect(parseCallbackParams(async function (experiment, result) {})).toEqual(
      ["experiment", "result"],
    );
  });

  it("parses a single unparenthesized arrow param", () => {
    // Built at runtime - a type annotation forces parens, which would silently
    // take the paren-walking path instead of the bare-arrow branch
    const cb = Function("return experiment => ({ key: experiment.key })")();
    expect(cb.toString()).toMatch(/^experiment\s*=>/);
    expect(parseCallbackParams(cb)).toEqual(["experiment"]);
  });

  it("does not read a bare arrow's body as its params", () => {
    const cb = Function(
      'return e => window.gtag("event", "x", { id: e.key })',
    )();
    expect(parseCallbackParams(cb)).toEqual(["e"]);
  });

  it("does not split on a comma inside a string default", () => {
    expect(
      parseCallbackParams((experiment, result, sep = ",") => [
        experiment,
        result,
        sep,
      ]),
    ).toEqual(["experiment", "result", 'sep = ","']);
  });

  it("does not desync on a bracket inside a string default", () => {
    expect(parseCallbackParams((a, b = "){[") => [a, b])).toEqual([
      "a",
      'b = "){["',
    ]);
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

  it("returns undefined for native functions", () => {
    expect(parseCallbackParams(Math.max)).toBeUndefined();
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
  });

  it("accepts a zero-arity forwarding wrapper rather than warning", () => {
    // `function () { cb.apply(this, arguments) }` parses to [] and works fine
    expect(trackingCallbackParamsAreValid([])).toBe(true);
  });

  it("rejects too many params", () => {
    expect(trackingCallbackParamsAreValid(["a", "b", "c", "d"])).toBe(false);
  });

  it("rejects 2 params once the SDK passes a userContext", () => {
    expect(
      trackingCallbackParamsAreValid(["experiment", "result"], "1.7.0"),
    ).toBe(false);
    expect(
      trackingCallbackParamsAreValid(["experiment", "result"], "1.8.2"),
    ).toBe(false);
  });

  it("accepts 2 params on SDKs that never pass a userContext", () => {
    expect(
      trackingCallbackParamsAreValid(["experiment", "result"], "1.6.5"),
    ).toBe(true);
    expect(
      trackingCallbackParamsAreValid(["experiment", "result"], "0.36.0"),
    ).toBe(true);
  });

  it("rejects 3 params on SDKs that never pass a userContext", () => {
    const params = ["experiment", "result", "userContext"];
    expect(trackingCallbackParamsAreValid(params, "1.6.5")).toBe(false);
    expect(trackingCallbackParamsAreValid(params, "1.7.0")).toBe(true);
  });

  it("stays lenient when the version is unknown", () => {
    expect(trackingCallbackParamsAreValid(["experiment", "result"])).toBe(true);
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
