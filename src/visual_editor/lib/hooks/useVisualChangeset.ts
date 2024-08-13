import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CSPError,
  VisualEditorVariation,
  Message,
  APIVisualChangeset,
  APIExperiment,
  LoadVisualChangesetRequestMessage,
  UpdateVisualChangesetRequestMessage,
} from "../../../../devtools";
import normalizeVariations from "../normalizeVariations";

type UseVisualChangesetHook = (visualChangesetId: string) => {
  loading: boolean;
  variations: VisualEditorVariation[];
  setVariations: Dispatch<SetStateAction<VisualEditorVariation[]>>;
  updateVariationAtIndex: (
    index: number,
    updates: Partial<VisualEditorVariation>
  ) => void;
  error: string | null;
  cspError: CSPError | null;
  experiment: APIExperiment | null;
  setExperiment: Dispatch<SetStateAction<APIExperiment | null>>;
  experimentUrl: string | null;
  setExperimentUrl: Dispatch<SetStateAction<string | null>>;
  visualChangeset: APIVisualChangeset | null;
  createNewExperiment: (options: CreateNewExperimentOptions) => void;
  experimentEditable: boolean;
};

export type CreateNewExperimentOptions = {};

/**
 * This hook is responsible for loading and updating a visual changeset. It utilizes the
 * `window.postMessage` API to communicate with the background script.
 */
const useVisualChangeset: UseVisualChangesetHook = (visualChangesetId) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cspError, setCSPError] = useState<CSPError | null>(null);
  const [visualChangeset, setVisualChangeset] =
    useState<APIVisualChangeset | null>(null);
  const [experiment, setExperiment] = useState<APIExperiment | null>(null);
  const [experimentUrl, setExperimentUrl] = useState<string | null>(null);
  const [variations, setVariations] = useState<VisualEditorVariation[]>([]);
  const [experimentEditable, setExperimentEditable] = useState(false);

  document.addEventListener("securitypolicyviolation", (e) => {
    if (e.violatedDirective !== "script-src") return;
    setError("csp-error");
    setCSPError({
      violatedDirective: e.violatedDirective,
    });
  });

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
    [visualChangesetId, variations]
  );

  const updateVariationAtIndex = useCallback(
    async (index: number, updates: Partial<VisualEditorVariation>) => {
      const newVariation = {
        ...variations[index],
        ...updates,
      };
      const newVariations = [
        ...(variations?.map((v, i) => (i === index ? newVariation : v)) ?? []),
      ];
      updateVisualChangeset(newVariations);
      setVariations(newVariations);
    },
    [variations, setVariations, updateVisualChangeset]
  );

  const createNewExperiment = (options: CreateNewExperimentOptions) => {
    const newVariations = [
      {
        name: "Control",
        description: "",
        css: "",
        js: "",
        domMutations: [],
        variationId: "0",
      },
      {
        name: "Variant 1",
        description: "",
        css: "",
        js: "",
        domMutations: [],
        variationId: "0",
      },
    ];
    setExperiment({
      name: "New experiment",
      id: "__new-experiment__",
      hashAttribute: "id",
      variations: newVariations.map((v) => ({
        variationId: v.variationId,
        key: v.variationId,
        name: v.name,
        description: v.description,
        screenshots: [],
      })),
    });
    setExperimentUrl(null);
    setVariations(newVariations);
    setExperimentEditable(true);
  };

  // generate normalized variations
  useEffect(() => {
    if (!visualChangeset || !experiment) return;

    const visualEditorVariations = normalizeVariations({
      experiment,
      visualChangeset,
    });

    setVariations(visualEditorVariations);
  }, [visualChangeset, experiment, setVariations]);

  // listen for responses from background script
  useEffect(() => {
    if (!visualChangesetId) return;

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
          setLoading(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", messageHandler);

    // load visual changeset on init
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

  return {
    loading,
    variations,
    setVariations,
    updateVariationAtIndex,
    error,
    cspError,
    experiment,
    setExperiment,
    experimentUrl,
    setExperimentUrl,
    visualChangeset,
    createNewExperiment,
    experimentEditable,
  };
};

export default useVisualChangeset;
