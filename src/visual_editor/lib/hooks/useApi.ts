import { useCallback, useEffect, useState } from "react";
import { VisualEditorVariation } from "../..";
import {
  CopyMode,
  Message,
  APIVisualChangeset,
  APIExperiment,
  TransformCopyRequestMessage,
  UpdateVisualChangesetRequestMessage,
  LoadVisualChangesetRequestMessage,
} from "../../../../devtools";

const genHeaders = (apiKey: string) => ({
  Authorization: `Basic ${btoa(apiKey + ":")}`,
  ["Content-Type"]: "application/json",
});

export type CSPError = {
  violatedDirective: string;
} | null;

export type TransformCopyFn = (copy: string, mode: CopyMode) => void;

type UseApiHook = (args: {
  apiHost: string;
  visualChangesetId: string;
  hasAiEnabled: boolean;
}) => {
  loading: boolean;
  visualChangeset: APIVisualChangeset | null;
  experiment: APIExperiment | null;
  transformedCopy: string | null;
  error: string;
  cspError: CSPError;
  updateVisualChangeset: (variations: VisualEditorVariation[]) => void;
  transformCopy: (copy: string, mode: CopyMode) => void;
};

const useApi: UseApiHook = ({ apiHost, visualChangesetId }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cspError, setCSPError] = useState<CSPError>(null);
  const [visualChangeset, setVisualChangeset] =
    useState<APIVisualChangeset | null>(null);
  const [experiment, setExperiment] = useState<APIExperiment | null>(null);
  const [transformedCopy, setTransformedCopy] = useState<string | null>(null);

  document.addEventListener("securitypolicyviolation", (e) => {
    setError("");

    if (apiHost && e.blockedURI.includes(apiHost)) {
      setCSPError({
        violatedDirective: e.violatedDirective,
      });
    }
  });

  useEffect(() => {
    if (!apiHost || !visualChangesetId) return;

    const messageHandler = (event: MessageEvent<Message>) => {
      const msg = event.data;

      switch (msg.type) {
        case "GB_RESPONSE_LOAD_VISUAL_CHANGESET":
          // TODO security check
          if (msg.data.error) setError(msg.data.error);
          else {
            setVisualChangeset(msg.data.visualChangeset);
            setExperiment(msg.data.experiment);
          }
          break;
        case "GB_RESPONSE_UPDATE_VISUAL_CHANGESET":
          // TODO security check
          if (msg.data.error) setError(msg.data.error);
          else setVisualChangeset(msg.data.visualChangeset);
          break;
        case "GB_RESPONSE_TRANSFORM_COPY":
          // TODO security check
          if (msg.data.error) setError(msg.data.error);
          if (msg.data.dailyLimitReached) setError("Daily limit reached");
          if (msg.data.transformed) setTransformedCopy(msg.data.transformed);
          break;
        default:
          break;
      }

      setLoading(false);
    };

    window.addEventListener("message", messageHandler);

    // load visual changeset on initial load
    // TODO pull into its own method
    setLoading(true);

    const loadVisualChangesetMessage: LoadVisualChangesetRequestMessage = {
      type: "GB_REQUEST_LOAD_VISUAL_CHANGESET",
      data: {
        apiHost,
        visualChangesetId,
      },
    };

    window.postMessage(loadVisualChangesetMessage, window.location.origin);

    return () => window.removeEventListener("message", messageHandler);
  }, [apiHost, visualChangesetId, setVisualChangeset, setExperiment]);

  const updateVisualChangeset = useCallback(
    async (variations: VisualEditorVariation[]) => {
      const updatePayload: Partial<APIVisualChangeset> = {
        visualChanges: variations.map((v) => ({
          variation: v.variationId,
          domMutations: v.domMutations,
          css: v.css,
          js: v.js,
          description: v.description,
        })),
      };

      setLoading(true);

      const updateVisualChangesetMessage: UpdateVisualChangesetRequestMessage =
        {
          type: "GB_REQUEST_UPDATE_VISUAL_CHANGESET",
          data: {
            apiHost,
            visualChangesetId,
            updatePayload,
          },
        };

      window.postMessage(updateVisualChangesetMessage, window.location.origin);
    },
    [apiHost, visualChangesetId]
  );

  const transformCopy = useCallback(
    async (copy: string, mode: CopyMode) => {
      setLoading(true);

      const transformCopyMessage: TransformCopyRequestMessage = {
        type: "GB_REQUEST_TRANSFORM_COPY",
        data: {
          apiHost,
          copy,
          mode,
        },
      };

      window.postMessage(transformCopyMessage, window.location.origin);
    },
    [apiHost]
  );

  return {
    updateVisualChangeset,
    transformCopy,
    loading,
    visualChangeset,
    experiment,
    transformedCopy,
    error,
    cspError,
  };
};

export default useApi;
