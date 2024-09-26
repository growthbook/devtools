import qs from "query-string";
import React, { FC } from "react";
import {
  VISUAL_CHANGESET_ID_PARAMS_KEY,
  VARIATION_INDEX_PARAMS_KEY,
  AI_ENABLED_PARAMS_KEY,
} from "../lib/constants";

const refreshWithParams = ({
  visualChangesetId,
  variationIndex,
  params,
  hasAiEnabled,
}: {
  visualChangesetId: string;
  variationIndex: string;
  params: qs.ParsedQuery;
  hasAiEnabled: boolean;
}) => {
  window.location.replace(
    qs.stringifyUrl({
      url: window.location.href,
      query: {
        ...params,
        [VISUAL_CHANGESET_ID_PARAMS_KEY]: visualChangesetId,
        [VARIATION_INDEX_PARAMS_KEY]: variationIndex,
        [AI_ENABLED_PARAMS_KEY]: hasAiEnabled,
      },
    }),
  );
};

const ReloadPageButton: FC<{
  params: qs.ParsedQuery<string>;
  variationIndex: number;
  visualChangesetId: string;
  hasAiEnabled: boolean;
}> = ({ params, variationIndex, visualChangesetId, hasAiEnabled }) => {
  return (
    <button
      className="gb-text-light gb-text-xs gb-mt-2"
      onClick={() =>
        refreshWithParams({
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
