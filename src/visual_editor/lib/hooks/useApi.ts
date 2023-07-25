import { useCallback, useEffect, useState } from "react";
import { VisualEditorVariation } from "../..";
import { ApiCreds } from "../../../../devtools";

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export interface APIExperiment {
  id: string;
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
    js?: string;
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

export type CSPError = {
  violatedDirective: string;
} | null;

type UseApiHook = (creds: Partial<ApiCreds>) => {
  fetchVisualChangeset?: (visualChangesetId: string) => Promise<{
    visualChangeset?: APIVisualChangeset;
    experiment?: APIExperiment;
  }>;
  updateVisualChangeset?: (
    visualChangesetId: string,
    payload: any
  ) => Promise<{ nModified?: number }>;
  error: string;
  cspError: CSPError;
};

const useApi: UseApiHook = ({ apiKey, apiHost }: Partial<ApiCreds>) => {
  const [error, setError] = useState("");
  const [cspError, setCSPError] = useState<CSPError>(null);

  document.addEventListener("securitypolicyviolation", (e) => {
    setError("");

    if (apiHost && e.blockedURI.includes(apiHost)) {
      setCSPError({
        violatedDirective: e.violatedDirective,
      });
    }
  });

  const fetchVisualChangeset = useCallback(
    async (visualChangesetId: string) => {
      if (!apiHost || !apiKey) return {};

      try {
        const response = await fetch(
          `${apiHost}/api/v1/visual-changesets/${visualChangesetId}?includeExperiment=1`,
          {
            headers: genHeaders(apiKey),
          }
        );

        if (response.status !== 200) throw new Error(response.statusText);

        const res = await response.json();

        const { visualChangeset, experiment } = res;

        setError("");

        return {
          visualChangeset,
          experiment,
        };
      } catch (e) {
        setError(
          "There was an error reaching the API. Please check your API key and host."
        );
        return {};
      }
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
          js: v.js,
          description: v.description,
        })),
      };

      try {
        const response = await fetch(
          `${apiHost}/api/v1/visual-changesets/${visualChangesetId}`,
          {
            headers: genHeaders(apiKey),
            method: "PUT",
            body: JSON.stringify(updatePayload),
          }
        );

        if (response.status !== 200) throw new Error(response.statusText);

        const res = await response.json();

        setError("");

        return { nModified: res.nModified };
      } catch (e) {
        setError(
          "There was an error reaching the API. Please check your API key and host."
        );
        return {};
      }
    },
    [apiHost, apiKey]
  );

  return {
    fetchVisualChangeset,
    updateVisualChangeset,
    error,
    cspError,
  };
};

export default useApi;
