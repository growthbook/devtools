import qs from "query-string";
import React, { FC } from "react";
import { ApiCreds } from "../../devtools";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  VARIATION_INDEX_PARAMS_KEY,
  EXPERIMENT_URL_PARAMS_KEY,
  API_HOST_PARAMS_KEY,
  AI_ENABLED_PARAMS_KEY,
} from "./lib/constants";

const refreshWithParams = ({
  visualChangesetId,
  variationIndex,
  experimentUrl,
  apiHost,
  params,
  hasAiEnabled,
}: {
  visualChangesetId: string;
  variationIndex: string;
  experimentUrl: string;
  apiHost: string;
  params: qs.ParsedQuery;
  hasAiEnabled: boolean;
}) => {
  window.location.href = qs.stringifyUrl({
    url: window.location.href,
    query: {
      ...params,
      [VISUAL_CHANGESET_ID_PARAMS_KEY]: visualChangesetId,
      [VARIATION_INDEX_PARAMS_KEY]: variationIndex,
      [EXPERIMENT_URL_PARAMS_KEY]: experimentUrl,
      [API_HOST_PARAMS_KEY]: apiHost,
      [AI_ENABLED_PARAMS_KEY]: hasAiEnabled,
    },
  });
};

const ReloadPageButton: FC<{
  apiCreds: Partial<ApiCreds>;
  params: qs.ParsedQuery<string>;
  experimentUrl: string;
  variationIndex: number;
  visualChangesetId: string;
  hasAiEnabled: boolean;
}> = ({
  apiCreds,
  params,
  experimentUrl,
  variationIndex,
  visualChangesetId,
  hasAiEnabled,
}) => {
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
          hasAiEnabled,
        })
      }
    >
      Reload page
    </button>
  );
};

export default ReloadPageButton;
