// Helpers for inspecting the callbacks a page's SDK was initialized with.
// Shared by the injected embed script (which reads them off the SDK context),
// the background worker (icon status), and the SDK tab UI.

// A trackingCallback may be written as either `(experiment, result)` or
// `(experiment, result, userContext)` - the SDK types allow both.
const VALID_TRACKING_CALLBACK_PARAM_COUNTS = [2, 3];

// Pull the parameter names off a function's source. Returns undefined when we
// can't tell (native/bound functions, minified oddities) so callers can avoid
// warning about something they didn't actually detect.
export function parseCallbackParams(
  callback: (...args: any[]) => any,
): string[] | undefined {
  let src: string;
  try {
    src = callback.toString();
  } catch (e) {
    return undefined;
  }
  if (src.includes("[native code]")) return undefined;

  // Single-param arrow function without parens, eg `experiment => ...`
  const bareArrowParam = src.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*=>/);
  if (bareArrowParam) return [bareArrowParam[1]];

  const open = src.indexOf("(");
  if (open === -1) return undefined;

  // Walk to the matching close paren, tracking nesting so that default values
  // and destructured params don't cut the list short.
  const params: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const char = src[i];
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
  // Never found the closing paren
  return undefined;
}

export function trackingCallbackParamsAreValid(
  params: string[] | undefined,
): boolean {
  // Couldn't determine the params - don't claim there's a problem
  if (!params) return true;
  // Rest params (`...args`) can stand in for any number of arguments
  if (params.some((param) => param.startsWith("..."))) return true;
  return VALID_TRACKING_CALLBACK_PARAM_COUNTS.includes(params.length);
}

export function hasTrackingCallbackIssues({
  hasTrackingCallback,
  trackingCallbackParams,
}: {
  hasTrackingCallback?: boolean;
  trackingCallbackParams?: string[];
}): boolean {
  if (!hasTrackingCallback) return false;
  return !trackingCallbackParamsAreValid(trackingCallbackParams);
}
