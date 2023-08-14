import { useCallback, useEffect, useState } from "react";
import { VisualEditorVariation } from "../..";
import {
  ErrorCode,
  CopyMode,
  Message,
  APIVisualChangeset,
  APIExperiment,
  TransformCopyRequestMessage,
  UpdateVisualChangesetRequestMessage,
  LoadVisualChangesetRequestMessage,
} from "../../../../devtools";

export type CSPError = {
  violatedDirective: string;
};

export type TransformCopyFn = (copy: string, mode: CopyMode) => void;

type UseApiHook = (args: {
  visualChangesetId: string;
  hasAiEnabled: boolean;
}) => {
  loading: boolean;
  visualChangeset: APIVisualChangeset | null;
  experiment: APIExperiment | null;
  experimentUrl: string | null;
  transformedCopy: string | null;
  error: ErrorCode | null;
  cspError: CSPError | null;
  updateVisualChangeset: (variations: VisualEditorVariation[]) => void;
  transformCopy: (copy: string, mode: CopyMode) => void;
};

const useApi: UseApiHook = ({ visualChangesetId }) => {
  const [error, setError] = useState<ErrorCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [cspError, setCSPError] = useState<CSPError | null>(null);
  const [visualChangeset, setVisualChangeset] =
    useState<APIVisualChangeset | null>(null);
  const [experiment, setExperiment] = useState<APIExperiment | null>(null);
  const [experimentUrl, setExperimentUrl] = useState<string | null>(null);
  const [transformedCopy, setTransformedCopy] = useState<string | null>(null);

  document.addEventListener("securitypolicyviolation", (e) => {
    setError("csp-error");
    setCSPError({
      violatedDirective: e.violatedDirective,
    });
  });

  useEffect(() => {
    if (!visualChangesetId) return;

    // handle responses from background script
    const messageHandler = (event: MessageEvent<Message>) => {
      const msg = event.data;
      switch (msg.type) {
        case "GB_RESPONSE_LOAD_VISUAL_CHANGESET":
          if (msg.data.error) setError(msg.data.error);
          else {
            setVisualChangeset(msg.data.visualChangeset);
            setExperiment(msg.data.experiment);
            setExperimentUrl(msg.data.experimentUrl);
          }
          setLoading(false);
          break;
        case "GB_RESPONSE_UPDATE_VISUAL_CHANGESET":
          if (msg.data.error) setError(msg.data.error);
          // TODO uncomment when GB supports this
          // else setVisualChangeset(msg.data.visualChangeset);
          setLoading(false);
          break;
        case "GB_RESPONSE_TRANSFORM_COPY":
          if (msg.data.error) setError(msg.data.error);
          if (msg.data.dailyLimitReached)
            setError("transform-copy-daily-limit-reached");
          if (msg.data.transformed) setTransformedCopy(msg.data.transformed);
          setLoading(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", messageHandler);

    // load visual changeset on initial load
    setLoading(true);

    const loadVisualChangesetMessage: LoadVisualChangesetRequestMessage = {
      type: "GB_REQUEST_LOAD_VISUAL_CHANGESET",
      data: {
        visualChangesetId,
      },
    };

    window.postMessage(loadVisualChangesetMessage, window.location.origin);

    return () => window.removeEventListener("message", messageHandler);
  }, [visualChangesetId, setVisualChangeset, setExperiment]);

  const updateVisualChangeset = useCallback(
    async (variations: VisualEditorVariation[]) => {
      setLoading(true);
      setError(null);

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
            visualChangesetId,
            updatePayload,
          },
        };

      window.postMessage(updateVisualChangesetMessage, window.location.origin);
    },
    [visualChangesetId]
  );

  const transformCopy = useCallback(
    async (copy: string, mode: CopyMode) => {
      setLoading(true);
      setError(null);

      const transformCopyMessage: TransformCopyRequestMessage = {
        type: "GB_REQUEST_TRANSFORM_COPY",
        data: {
          visualChangesetId,
          copy,
          mode,
        },
      };

      window.postMessage(transformCopyMessage, window.location.origin);
    },
    [visualChangesetId]
  );

  return {
    updateVisualChangeset,
    transformCopy,
    loading,
    visualChangeset,
    experiment,
    experimentUrl,
    transformedCopy,
    error,
    cspError,
  };
};

export default useApi;
