import { useCallback, useEffect, useState } from "react";
import {
  Message,
  CopyMode,
  TransformCopyRequestMessage,
} from "../../../../devtools";

export type TransformCopyFn = (copy: string, mode: CopyMode) => void;

type UseAiCopySuggestionHook = (visualChangesetId: string) => {
  loading: boolean;
  error: string | null;
  transformedCopy: string | null;
  transformCopy: TransformCopyFn;
};

/**
 * This hook is used to communicate with the background script to request
 * AI copy suggestions.
 */
const useAiCopySuggestion: UseAiCopySuggestionHook = (visualChangesetId) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transformedCopy, setTransformedCopy] = useState<string | null>(null);

  // listen for responses from background script
  useEffect(() => {
    if (!visualChangesetId) return;

    const messageHandler = (event: MessageEvent<Message>) => {
      const msg = event.data;
      switch (msg.type) {
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

    return () => window.removeEventListener("message", messageHandler);
  }, [visualChangesetId]);

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
    loading,
    error,
    transformedCopy,
    transformCopy,
  };
};

export default useAiCopySuggestion;
