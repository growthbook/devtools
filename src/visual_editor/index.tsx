import mutate, { DeclarativeMutation } from "dom-mutator";
import qs from "query-string";
import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useReducer,
  useState,
} from "react";
import * as ReactDOM from "react-dom/client";
import { Message } from "../../devtools";
import Toolbar, { ToolbarMode } from "./Toolbar";
import {
  toggleNormalMode,
  toggleSelectionMode,
  updateSelectedElement,
  toggleCssMode,
  toggleMutationMode,
  toggleScreenshotMode,
} from "./lib/modes";
import "./targetPage.css";
import ElementDetails from "./ElementDetails";
import ExperimentCreator from "./ExperimentCreator";
import HighlightedElementSelectorDisplay from "./HighlightedElementSelectorDisplay";
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";
import DOMMutationList from "./DOMMutationList";

export interface ExperimentVariation {
  canvas?: HTMLCanvasElement;
  domMutations: DeclarativeMutation[];
}

// TODO Replace with interface in API payload
export interface Experiment {
  variations?: ExperimentVariation[];
}

const VisualEditor: FC<{}> = () => {
  const params = qs.parse(window.location.search);
  const experimentId = params["visual-exp-id"] as string;
  const [apiCreds, setApiCreds] = useState<{
    apiKey?: string;
    apiHost?: string;
  }>({});
  const [isVisualEditorEnabled, setIsEnabled] = useState(false);
  const [variations, setVariations] = useState<ExperimentVariation[]>([]);
  const [mode, setMode] = useState<ToolbarMode>("selection");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [selectedVariationIndex, setSelectedVariationIndex] =
    useState<number>(1);
  const [highlightedElementSelector, setHighlightedElementSelector] = useState<
    string | null
  >(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const mutateRevert = useRef<(() => void) | null>(null);

  const selectedVariation = variations?.[selectedVariationIndex] ?? null;

  const createVariation = useCallback(async () => {
    setVariations([...variations, { domMutations: [] }]);
  }, [variations, setVariations]);

  const addDomMutations = useCallback(
    (domMutations: DeclarativeMutation[]) => {
      setVariations([
        ...(variations?.map((variation, index) => {
          if (index === selectedVariationIndex) {
            return {
              ...variation,
              domMutations: [...variation.domMutations, ...domMutations],
            };
          }
          return variation;
        }) ?? []),
      ]);
    },
    [variations, selectedVariation, setVariations, selectedVariationIndex]
  );

  const addDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      addDomMutations([domMutation]);
    },
    [addDomMutations]
  );

  const removeDomMutation = useCallback(
    (domMutationIndex: number) => {
      setVariations([
        ...(variations?.map((variation, index) => {
          if (index === selectedVariationIndex) {
            return {
              ...variation,
              domMutations: variation.domMutations.filter(
                // TODO use an id or something :/
                (mutation, i) => {
                  return i !== domMutationIndex;
                }
              ),
            };
          }
          return variation;
        }) ?? []),
      ]);
    },
    [variations, selectedVariation, setVariations, selectedVariationIndex]
  );

  // get ahold of api credentials. requires talking to the "other side"
  useEffect(() => {
    window.postMessage(
      {
        type: "GB_REQUEST_API_CREDS",
      },
      "*"
    );

    window.addEventListener("message", function (event: MessageEvent<Message>) {
      const data = event.data;
      if (
        data.type === "GB_RESPONSE_API_CREDS" &&
        data.apiKey &&
        data.apiHost
      ) {
        setApiCreds({
          apiKey: data.apiKey,
          apiHost: data.apiHost,
        });
      }
    });
  }, []);

  // fetch experiment from api once we have credentials
  useEffect(() => {
    const { apiHost, apiKey } = apiCreds;

    if (!experimentId) return;
    if (!apiHost || !apiKey) return;

    const fetchExperiment = async () => {
      const response = await fetch(
        `${apiHost}/api/v1/experiments/${experimentId}`,
        {
          headers: {
            Authorization: `Basic ${btoa(apiKey + ":")}`,
          },
        }
      );

      const res = await response.json();
      const { experiment } = res;

      if (!experiment) return;

      setVariations(
        experiment.variations.map((v: any) => ({
          ...v,
          domMutations: [],
        }))
      );

      // TODO enable on prod
      // window.history.replaceState(
      //   null,
      //   "",
      //   qs.stringifyUrl({
      //     url: window.location.href,
      //     query: {
      //       ...params,
      //       "visual-exp-id": undefined,
      //     },
      //   })
      // );

      setIsEnabled(true);
    };

    fetchExperiment();
  }, [experimentId, apiCreds]);

  // listen for messages from popup menu
  useEffect(() => {
    const messageHandler = (event: MessageEvent<Message>) => {
      const data = event.data;
      if (data.type === "GB_ENABLE_VISUAL_EDITOR") {
        setIsEnabled(true);
      } else if (data.type === "GB_DISABLE_VISUAL_EDITOR") {
        setIsEnabled(false);
      }
    };
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  // handle mode selection
  useEffect(() => {
    toggleNormalMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "normal"
    );
    toggleSelectionMode({
      isEnabled: !isVisualEditorEnabled
        ? isVisualEditorEnabled
        : mode === "selection",
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
    });
    toggleCssMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "css"
    );
    toggleMutationMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "mutation"
    );
    toggleScreenshotMode(
      !isVisualEditorEnabled ? isVisualEditorEnabled : mode === "screenshot"
    );
  }, [isVisualEditorEnabled, mode]);

  // selection mode - update on select
  useEffect(() => {
    if (!isVisualEditorEnabled) return;
    if (mode !== "selection") return;

    updateSelectedElement({
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
    });
  }, [
    selectedElement,
    setSelectedElement,
    setHighlightedElementSelector,
    isVisualEditorEnabled,
    mode,
  ]);

  useEffect(() => {
    if (mutateRevert?.current) mutateRevert.current();

    const callbacks: Array<() => void> = [];

    selectedVariation?.domMutations.forEach((mutation) => {
      const controller = mutate.declarative(mutation);
      callbacks.push(controller.revert);
    });

    mutateRevert.current = () => {
      callbacks.forEach((callback) => callback());
    };

    // This sucks. But necessary, since dom-mutator may make DOM changes after
    // re-render. We re-render post-DOMmutator so we retrieve updated values.
    setTimeout(() => {
      // console.log("DEBUG - forceUpdate");
      forceUpdate();
    }, 100);
  }, [variations, selectedVariation]);

  if (!isVisualEditorEnabled) return null;

  return (
    <>
      <DOMMutationList
        mutations={selectedVariation?.domMutations ?? []}
        removeDomMutation={removeDomMutation}
      />

      <ExperimentCreator
        mode={mode}
        setMode={setMode}
        variations={variations}
        createVariation={createVariation}
        selectedVariationIndex={selectedVariationIndex}
        setSelectedVariationIndex={setSelectedVariationIndex}
      />

      {mode === "selection" && selectedElement ? (
        <ElementDetails
          element={selectedElement}
          setElement={setSelectedElement}
          clearElement={() => setSelectedElement(null)}
          addMutation={addDomMutation}
          addMutations={addDomMutations}
        />
      ) : null}

      {mode === "selection" ? (
        <HighlightedElementSelectorDisplay
          selector={highlightedElementSelector}
        />
      ) : null}
    </>
  );
};

// mounting the visual editor
export const CONTAINER_ID = "__gb_visual_editor";

const container = document.createElement("div");
container.id = CONTAINER_ID;

export const shadowRoot = container?.attachShadow({ mode: "open" });

if (shadowRoot) {
  shadowRoot.innerHTML = `
    <style>${VisualEditorCss}</style>
    <div id="visual-editor-root"></div>
  `;
}

document.body.appendChild(container);

const root = ReactDOM.createRoot(
  shadowRoot.querySelector("#visual-editor-root")!
);

root.render(
  <React.StrictMode>
    <VisualEditor />
  </React.StrictMode>
);
