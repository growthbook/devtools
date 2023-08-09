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

type UseApiHook = (args: {
  apiHost: string;
  visualChangesetId: string;
  hasAiEnabled: boolean;
}) => {
  loading: boolean;
  visualChangeset?: APIVisualChangeset;
  experiment?: APIExperiment;
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
  const [visualChangeset, setVisualChangeset] = useState<APIVisualChangeset>();
  const [experiment, setExperiment] = useState<APIExperiment>();
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
    const messageHandler = (event: MessageEvent<Message>) => {
      const msg = event.data;
      switch (msg.type) {
        case "GB_RESPONSE_LOAD_VISUAL_CHANGESET":
          if (msg.data.error) {
            setError(msg.data.error);
          }
          if (msg.data.visualChangeset) {
            setVisualChangeset(msg.data.visualChangeset);
            setExperiment(msg.data.experiment);
          }
          break;
        case "GB_RESPONSE_UPDATE_VISUAL_CHANGESET":
          if (msg.data.error) {
            setError(msg.data.error);
          }
          break;
        case "GB_RESPONSE_TRANSFORM_COPY":
          if (msg.data.error) {
            setError(msg.data.error);
          }
          if (msg.data.dailyLimitReached) {
            setError("Daily limit reached");
          }
          if (msg.data.transformed) {
            setTransformedCopy(msg.data.transformed);
          }
          break;
        default:
          break;
      }
      setLoading(false);
    };

    window.addEventListener("message", messageHandler);

    // load visual changeset on initial load
    const loadVisualChangesetMessage: LoadVisualChangesetRequestMessage = {
      type: "GB_REQUEST_LOAD_VISUAL_CHANGESET",
      data: {
        apiHost,
        visualChangesetId,
      },
    };

    setLoading(true);
    window.postMessage(loadVisualChangesetMessage, window.location.origin);

    return () => window.removeEventListener("message", messageHandler);
  }, [setVisualChangeset, setExperiment]);

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

      const updateVisualChangesetMessage: UpdateVisualChangesetRequestMessage =
        {
          type: "GB_REQUEST_UPDATE_VISUAL_CHANGESET",
          data: {
            apiHost,
            visualChangesetId,
            updatePayload,
          },
        };

      setLoading(true);
      window.postMessage(updateVisualChangesetMessage, window.location.origin);
    },
    [apiHost, visualChangesetId]
  );

  const transformCopy = useCallback(
    async (copy: string, mode: CopyMode) => {
      const transformCopyMessage: TransformCopyRequestMessage = {
        type: "GB_REQUEST_TRANSFORM_COPY",
        data: {
          apiHost,
          copy,
          mode,
        },
      };

      setLoading(true);
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
