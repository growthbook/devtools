import { useCallback } from "react";
import { VisualEditorVariation } from "../..";

export interface APICreds {
  apiKey?: string;
  apiHost?: string;
}

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export interface APIExperiment {
  variations: {
    variationId: string;
    key: string;
    name: string;
    description: string;
    screenshots: string[];
  }[];
}
export type APIExperimentVariation = APIExperiment["variations"][number];

export interface APIVisualChangeset {
  id: string;
  urlPatterns: {
    include?: boolean;
    /** @enum {string} */
    type: "simple" | "exact" | "regex";
    pattern: string;
  }[];
  editorUrl: string;
  experiment: string;
  visualChanges: {
    description?: string;
    css?: string;
    variation: string;
    domMutations: {
      selector: string;
      /** @enum {string} */
      action: "append" | "set" | "remove";
      attribute: string;
      value?: string;
    }[];
  }[];
}
export type APIVisualChange = APIVisualChangeset["visualChanges"][number];
export type APIDomMutation = APIVisualChange["domMutations"][number];

type UseApiHook = (creds: APICreds) => {
  fetchVisualChangeset?: (visualChangesetId: string) => Promise<{
    visualChangeset?: APIVisualChangeset;
    experiment?: APIExperiment;
  }>;
  updateVisualChangeset?: (
    visualChangesetId: string,
    payload: any
  ) => Promise<{ nModified?: number }>;
};

const useApi: UseApiHook = ({ apiKey, apiHost }: APICreds) => {
  const fetchVisualChangeset = useCallback(
    async (visualChangesetId: string) => {
      if (!apiHost || !apiKey) return {};

      const response = await fetch(
        `${apiHost}/api/v1/visual-changesets/${visualChangesetId}?includeExperiment=1`,
        {
          headers: genHeaders(apiKey),
        }
      );

      const res = await response.json();

      const { visualChangeset, experiment } = res;

      return {
        visualChangeset,
        experiment,
      };
    },
    [apiHost, apiKey]
  );

  const updateVisualChangeset = useCallback(
    async (visualChangesetId: string, variations: VisualEditorVariation[]) => {
      if (!apiHost || !apiKey) return {};

      const updatePayload: Partial<APIVisualChangeset> = {
        visualChanges: variations.map((v) => ({
          variation: v.variationId,
          domMutations: v.domMutations,
          css: v.css,
          description: v.description,
        })),
      };

      const response = await fetch(
        `${apiHost}/api/v1/visual-changesets/${visualChangesetId}`,
        {
          headers: genHeaders(apiKey),
          method: "PUT",
          body: JSON.stringify(updatePayload),
        }
      );

      const res = await response.json();

      return { nModified: res.nModified };
    },
    [apiHost, apiKey]
  );

  return {
    fetchVisualChangeset,
    updateVisualChangeset,
  };
};

export default useApi;
