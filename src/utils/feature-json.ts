export interface FeatureDefinitionRule<T> {
  force?: T;
  weights?: number[];
  variations?: T[];
  hashAttribute?: string;
  namespace?: [string, number, number];
  key?: string;
  coverage?: number;
  // eslint-disable-next-line
  condition?: any;
}

export interface FeatureDefinition<T> {
  defaultValue: T;
  rules?: FeatureDefinitionRule<T>[];
}

type FeaturesJson = Record<string, FeatureDefinition<unknown>>;

/**
 * Util for getting parsed JSON from a URI-encoded cookie string
 * @param encodedValue
 * @returns
 */
export const featuresJsonFromEncodedCookieValue = (
  encodedValue: string
): FeaturesJson | null => {
  try {
    let decoded = decodeURIComponent(encodedValue);

    // Replace all plus signs with space chars
    decoded = decoded.replace(/\+/g, " ");

    return JSON.parse(decoded);
  } catch (e) {
    console.error("featuresJsonFromEncodedCookieValue", e);
    return null;
  }
};
