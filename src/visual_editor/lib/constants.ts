export const VISUAL_CHANGESET_ID_PARAMS_KEY = "vc-id";

// The standalone Visual Editor extension that replaces the legacy in-page
// editor bundled here. Array so unpacked dev builds (whose IDs differ per
// machine) can be probed alongside the store ID during local testing.
export const NEW_VISUAL_EDITOR_EXTENSION_IDS = [
  "nbomejknbpkcpjdagefhichaajpoempk",
  // LOCAL DEV ONLY — unpacked build at ~/GrowthBook/visual-editor/dist.
  // Remove before merging.
  "cidlokcklkmepniadobebeaneagmfloh",
];
export const NEW_VISUAL_EDITOR_STORE_URL =
  "https://chromewebstore.google.com/detail/growthbook-visual-editor/nbomejknbpkcpjdagefhichaajpoempk";
export const VARIATION_INDEX_PARAMS_KEY = "v-idx";
export const EXPERIMENT_URL_PARAMS_KEY = "exp-url"; // deprecated
export const API_HOST_PARAMS_KEY = "api-host"; // deprecated
export const AI_ENABLED_PARAMS_KEY = "ai-enabled";
