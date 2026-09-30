import {
  ingestorRegion,
  parseIngestorRequest,
  summarizeIngestor,
} from "./ingestor";

describe("parseIngestorRequest", () => {
  it("reads the host and client key off a tracking request", () => {
    expect(
      parseIngestorRequest(
        "https://us-east-1.gb-ingest.com/track?client_key=sdk-abc",
      ),
    ).toEqual({
      host: "https://us-east-1.gb-ingest.com",
      clientKey: "sdk-abc",
    });
  });

  it("accepts a custom ingestor host", () => {
    expect(
      parseIngestorRequest("https://events.example.com/gb/track?client_key=k"),
    ).toEqual({ host: "https://events.example.com/gb", clientKey: "k" });
  });

  it("ignores other requests", () => {
    expect(
      parseIngestorRequest("https://example.com/track?id=1"),
    ).toBeUndefined();
    expect(
      parseIngestorRequest("https://cdn.growthbook.io/api/features/sdk-abc"),
    ).toBeUndefined();
    expect(parseIngestorRequest("not a url")).toBeUndefined();
  });
});

describe("ingestorRegion", () => {
  it("maps both US hostnames and the EU hostname", () => {
    expect(ingestorRegion("https://us-east-1.gb-ingest.com")).toBe("US");
    expect(ingestorRegion("https://us1.gb-ingest.com")).toBe("US");
    expect(ingestorRegion("https://eu-west-1.gb-ingest.com")).toBe("EU");
  });

  it("returns undefined for a custom host", () => {
    expect(ingestorRegion("https://events.example.com")).toBeUndefined();
  });
});

describe("summarizeIngestor", () => {
  const base = {
    usingGrowthBookTracking: true,
    requestCount: 0,
    errorCount: 0,
    hosts: [],
    clientKeys: [],
  };

  it("distinguishes a plugin that hasn't sent anything from no plugin", () => {
    expect(summarizeIngestor(base).status).toBe("Set up");
    expect(
      summarizeIngestor({ ...base, usingGrowthBookTracking: false }).status,
    ).toBe("No");
    expect(summarizeIngestor(undefined).status).toBe("No");
  });

  it("reports the region events are going to", () => {
    const summary = summarizeIngestor(
      {
        ...base,
        requestCount: 2,
        hosts: ["https://eu-west-1.gb-ingest.com"],
        clientKeys: ["sdk-1"],
      },
      "sdk-1",
    );
    expect(summary).toEqual({
      status: "EU",
      color: "green",
      keyMismatch: false,
    });
  });

  it("flags failed requests and a client key the SDK doesn't use", () => {
    const sent = {
      ...base,
      requestCount: 2,
      hosts: ["https://us1.gb-ingest.com"],
      clientKeys: ["sdk-other"],
    };
    expect(summarizeIngestor({ ...sent, errorCount: 1 }, "sdk-1").status).toBe(
      "Errors",
    );
    expect(summarizeIngestor(sent, "sdk-1")).toEqual({
      status: "Key mismatch",
      color: "orange",
      keyMismatch: true,
    });
  });
});
