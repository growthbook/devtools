import { CSPError } from "devtools";

const VE_RELEVANT_DIRECTIVES = new Set([
  "script-src",
  "script-src-elem",
  "style-src",
  "style-src-elem",
  "connect-src",
]);

const EXTENSION_URI_PREFIXES = ["chrome-extension://", "moz-extension://"];

const isExtensionUri = (value?: string | null) => {
  if (!value) return false;
  return EXTENSION_URI_PREFIXES.some((prefix) => value.startsWith(prefix));
};

const toSafeValue = (value?: string | null) => value || "";

export const classifyCSPViolation = (
  e: Pick<
    SecurityPolicyViolationEvent,
    "violatedDirective" | "effectiveDirective" | "blockedURI" | "sourceFile"
  >,
): {
  isRelevant: boolean;
  isFatal: boolean;
  key: string;
  details: CSPError;
} => {
  const effectiveDirective = toSafeValue(e.effectiveDirective);
  const violatedDirective = toSafeValue(e.violatedDirective);
  const blockedURI = toSafeValue(e.blockedURI);
  const sourceFile = toSafeValue(e.sourceFile);

  const normalizedDirective =
    effectiveDirective || violatedDirective || "unknown";
  const isRelevant = VE_RELEVANT_DIRECTIVES.has(normalizedDirective);
  const blockedExtensionResource =
    isExtensionUri(blockedURI) || isExtensionUri(sourceFile);

  // Fatal when extension-owned resources are explicitly blocked.
  const isFatal = isRelevant && blockedExtensionResource;
  const details: CSPError = {
    violatedDirective,
    effectiveDirective: normalizedDirective,
    blockedURI,
    sourceFile,
    isFatal,
    timestamp: Date.now(),
  };

  return {
    isRelevant,
    isFatal,
    key: `${normalizedDirective}|${blockedURI}|${sourceFile}`,
    details,
  };
};

