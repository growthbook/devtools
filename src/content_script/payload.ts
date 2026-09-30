import type { FeatureApiResponse } from "@growthbook/growthbook";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergePayloadPatch(
  currentPayload: FeatureApiResponse,
  patch: FeatureApiResponse,
): FeatureApiResponse {
  const payload = { ...currentPayload };

  Object.keys(patch).forEach((key) => {
    const k = key as keyof FeatureApiResponse;
    const currentValue = payload[k];
    const patchValue = patch[k];

    if (patchValue === undefined) return;

    if (Array.isArray(patchValue)) {
      // Auto experiments are arrays. Object-spreading arrays corrupts [] into {}.
      payload[k] = patchValue as never;
      return;
    }

    if (isObjectRecord(currentValue) && isObjectRecord(patchValue)) {
      payload[k] = { ...currentValue, ...patchValue } as never;
      return;
    }

    payload[k] = patchValue as never;
  });

  return payload;
}
