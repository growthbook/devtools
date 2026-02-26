import { classifyCSPViolation } from "./csp";

const eventFactory = (
  overrides: Partial<SecurityPolicyViolationEvent> = {},
): SecurityPolicyViolationEvent =>
  ({
    violatedDirective: "script-src",
    effectiveDirective: "script-src",
    blockedURI: "https://www.googletagmanager.com/gtm.js",
    sourceFile: "https://example.com/demo",
    ...overrides,
  }) as SecurityPolicyViolationEvent;

describe("classifyCSPViolation", () => {
  it("returns non-fatal for third-party blocked scripts", () => {
    const result = classifyCSPViolation(eventFactory());
    expect(result.isRelevant).toBe(true);
    expect(result.isFatal).toBe(false);
    expect(result.details.isFatal).toBe(false);
  });

  it("returns fatal for blocked extension resources", () => {
    const result = classifyCSPViolation(
      eventFactory({
        blockedURI: "chrome-extension://abc123/js/visual_editor.js",
      }),
    );
    expect(result.isRelevant).toBe(true);
    expect(result.isFatal).toBe(true);
    expect(result.details.isFatal).toBe(true);
  });
});

