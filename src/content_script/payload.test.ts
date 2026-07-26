import type { FeatureApiResponse } from "@growthbook/growthbook";

import { mergePayloadPatch } from "./payload";

describe("mergePayloadPatch", () => {
  it("replaces arrays instead of object-spreading them into objects", () => {
    const payload = mergePayloadPatch(
      {
        features: {},
        experiments: [],
      },
      {
        experiments: [],
      },
    );

    expect(Array.isArray(payload.experiments)).toBe(true);
    expect(payload.experiments).toEqual([]);
  });

  it("keeps shallow object merge behavior for features", () => {
    const payload = mergePayloadPatch(
      {
        features: {
          existing: {
            defaultValue: true,
          },
        },
      },
      {
        features: {
          incoming: {
            defaultValue: false,
          },
        },
      },
    );

    expect(payload.features).toEqual({
      existing: {
        defaultValue: true,
      },
      incoming: {
        defaultValue: false,
      },
    });
  });

  it("replaces scalar payload fields", () => {
    const payload = mergePayloadPatch(
      {
        dateUpdated: "old",
      },
      {
        dateUpdated: "new",
      } as FeatureApiResponse,
    );

    expect(payload.dateUpdated).toBe("new");
  });
});
