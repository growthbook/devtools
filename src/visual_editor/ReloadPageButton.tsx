import qs from "query-string";
import React, { FC } from "react";
import { ApiCreds } from "../../devtools";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  VARIATION_INDEX_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
} from "./lib/constants";

const refreshWithParams = ({
  visualChangesetId,
  variationIndex,
  experimentUrl,
  apiHost,
  params,
}: {
  visualChangesetId: string;
  variationIndex: string;
  experimentUrl: string;
  apiHost: string;
  params: qs.ParsedQuery;
}) => {
  window.location.href = qs.stringifyUrl({
    url: window.location.href,
    query: {
      ...params,
      [VISUAL_CHANGESET_ID_PARAMS_KEY]: visualChangesetId,
      [VARIATION_INDEX_PARAMS_KEY]: variationIndex,
      [EXPERIMENT_URL_PARAMS_KEY]: experimentUrl,
      [API_HOST_PARAMS_KEY]: apiHost,
    },
  });
};

export const getVariationIndexFromParams = (
  param: string | (string | null)[] | null
): number => {
  if (Array.isArray(param)) {
    if (!param[0]) return 1;
    return parseInt(param[0], 10);
  }
  return parseInt(param ?? "1", 10);
};

const ReloadPageButton: FC<{ apiCreds: Partial<ApiCreds> }> = ({
  apiCreds,
}) => {
  const params = qs.parse(window.location.search);
  const experimentUrl = decodeURIComponent(
    params[EXPERIMENT_URL_PARAMS_KEY] as string
  );
  const variationIndex = getVariationIndexFromParams(
    params[VARIATION_INDEX_PARAMS_KEY]
  );
  const visualChangesetId = params[VISUAL_CHANGESET_ID_PARAMS_KEY] as string;
  return (
    <button
      className="gb-text-light gb-text-xs gb-mt-2"
      onClick={() =>
        refreshWithParams({
          apiHost: apiCreds.apiHost || "",
          experimentUrl,
          params,
          variationIndex: variationIndex.toString(),
          visualChangesetId,
        })
      }
    >
      Reload page
    </button>
  );
};

export default ReloadPageButton;
