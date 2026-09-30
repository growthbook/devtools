import type { IngestorHealth } from "devtools";

// Logged by growthbookTrackingPlugin's eventLogger; string literals survive minification
export const GROWTHBOOK_TRACKING_MARKER = "Logging event to GrowthBook";

export type IngestorRequest = { host: string; clientKey?: string };

// growthbookTrackingPlugin POSTs to `${ingestorHost}/track?client_key=...`
export function parseIngestorRequest(url: string): IngestorRequest | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!parsed.pathname.endsWith("/track")) return undefined;
  const clientKey = parsed.searchParams.get("client_key");
  if (!clientKey) return undefined;
  // Keep any path a custom ingestorHost has, eg https://example.com/gb
  const host = parsed.origin + parsed.pathname.slice(0, -"/track".length);
  return { host, clientKey };
}

// The app hands out us1.gb-ingest.com while the SDK defaults to us-east-1.gb-ingest.com
const INGESTOR_REGIONS: Record<string, string> = {
  "us-east-1.gb-ingest.com": "US",
  "us1.gb-ingest.com": "US",
  "eu-west-1.gb-ingest.com": "EU",
};

// Undefined for a custom ingestor host
export function ingestorRegion(host: string): string | undefined {
  try {
    return INGESTOR_REGIONS[new URL(host).hostname];
  } catch {
    return undefined;
  }
}

export function summarizeIngestor(
  ingestor: IngestorHealth | undefined,
  sdkClientKey?: string,
): {
  status: string;
  color: "green" | "orange" | "gray";
  keyMismatch: boolean;
} {
  if (!ingestor?.requestCount) {
    return {
      status: ingestor?.usingGrowthBookTracking ? "Set up" : "No",
      color: "gray",
      keyMismatch: false,
    };
  }
  const keyMismatch =
    !!sdkClientKey && ingestor.clientKeys.some((key) => key !== sdkClientKey);
  if (ingestor.errorCount) {
    return { status: "Errors", color: "orange", keyMismatch };
  }
  if (keyMismatch) {
    return { status: "Key mismatch", color: "orange", keyMismatch };
  }
  const regions = [
    ...new Set(ingestor.hosts.map((host) => ingestorRegion(host) ?? "Custom")),
  ];
  return { status: regions.join(", "), color: "green", keyMismatch };
}
