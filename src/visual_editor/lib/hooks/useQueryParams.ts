import qs from "query-string";
import { useState } from "react";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  VARIATION_INDEX_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
  AI_ENABLED_PARAMS_KEY,
} from "../../lib/constants";

type UseQueryParamsHook = () => {
  params: qs.ParsedQuery;
  visualChangesetId: string;
  variationIndex: number;
  experimentUrl: string;
  apiHost: string;
  hasAiEnabled: boolean;
  cleanUpParams: () => void;
};

// normalize param values into number type
// default to 1 (first variation)
const getVariationIndexFromParams = (
  param: string | (string | null)[] | null
): number => {
  if (Array.isArray(param)) {
    if (!param[0]) return 1;
    return parseInt(param[0], 10);
  }
  return parseInt(param ?? "1", 10);
};

const cleanUpParams = (params: qs.ParsedQuery) => () => {
  window.history.replaceState(
    null,
    "",
    qs.stringifyUrl({
      url: window.location.href,
      query: {
        ...params,
        [VISUAL_CHANGESET_ID_PARAMS_KEY]: undefined,
        [VARIATION_INDEX_PARAMS_KEY]: undefined,
        [EXPERIMENT_URL_PARAMS_KEY]: undefined,
        [API_HOST_PARAMS_KEY]: undefined,
        [AI_ENABLED_PARAMS_KEY]: undefined,
      },
    })
  );
};

const useQueryParams: UseQueryParamsHook = () => {
  const params = qs.parse(window.location.search);
  const [visualChangesetId] = useState(
    (params[VISUAL_CHANGESET_ID_PARAMS_KEY] || "") as string
  );
  const [variationIndex] = useState(
    getVariationIndexFromParams(params[VARIATION_INDEX_PARAMS_KEY])
  );
  const [experimentUrl] = useState(
    decodeURIComponent((params[EXPERIMENT_URL_PARAMS_KEY] || "") as string)
  );
  const [apiHost] = useState(
    decodeURIComponent((params[API_HOST_PARAMS_KEY] || "") as string)
  );
  const [hasAiEnabled] = useState(
    decodeURIComponent((params[AI_ENABLED_PARAMS_KEY] || "") as string) ===
      "true"
  );
  return {
    params,
    visualChangesetId,
    variationIndex,
    experimentUrl,
    apiHost,
    hasAiEnabled,
    cleanUpParams: cleanUpParams(params),
  };
};

export default useQueryParams;
