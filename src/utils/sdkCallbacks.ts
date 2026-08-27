import { paddedVersionString } from "@growthbook/growthbook";
import type { SDKHealthCheckResult } from "devtools";

// Pull the parameter names off a function's source. Returns undefined when we can't tell, eg native or bound functions
export function parseCallbackParams(
  callback: (...args: any[]) => any,
): string[] | undefined {
  const src = callback.toString();
  if (src.includes("[native code]")) return undefined;

  // Single-param arrow function without parens, eg `experiment => ...`
  const bareArrowParam = src.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*=>/);
  if (bareArrowParam) return [bareArrowParam[1]];

  const open = src.indexOf("(");
  if (open === -1) return undefined;

  // Walk to the matching close paren so defaults and destructured params don't cut the list short
  const params: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < src.length; i++) {
    const char = src[i];
    if (quote) {
      current += char;
      if (char === "\\") current += src[++i] ?? "";
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(" || char === "[" || char === "{") {
      depth++;
      if (depth === 1) continue;
    } else if (char === ")" || char === "]" || char === "}") {
      depth--;
      if (depth === 0) {
        if (current.trim()) params.push(current.trim());
        return params;
      }
    } else if (char === "," && depth === 1) {
      if (current.trim()) params.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  return undefined;
}

// From this version the SDK also passes a userContext to trackingCallback
export const USER_CONTEXT_SDK_VERSION = "1.7.0";

export function expectsUserContextParam(version?: string): boolean {
  if (!version) return false;
  return (
    paddedVersionString(version) >=
    paddedVersionString(USER_CONTEXT_SDK_VERSION)
  );
}

// A trackingCallback takes `(experiment, result)`, or `(experiment, result, userContext)` on 1.7.0+
export function trackingCallbackParamsAreValid(
  params: string[] | undefined,
  version?: string,
): boolean {
  if (!params) return true;
  // Zero params means a forwarding wrapper that reads `arguments` instead
  if (params.length === 0) return true;
  if (params.some((param) => param.startsWith("..."))) return true;
  if (!version) return params.length === 2 || params.length === 3;
  return params.length === (expectsUserContextParam(version) ? 3 : 2);
}

export function hasTrackingCallbackIssues({
  hasTrackingCallback,
  trackingCallbackParams,
  version,
}: Pick<
  SDKHealthCheckResult,
  "hasTrackingCallback" | "trackingCallbackParams" | "version"
>): boolean {
  if (!hasTrackingCallback) return false;
  return !trackingCallbackParamsAreValid(trackingCallbackParams, version);
}
