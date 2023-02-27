import mutate, { DeclarativeMutation } from "dom-mutator";
import qs from "query-string";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
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
import GlobalCSSEditor from "./GlobalCSSEditor";
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";
import DOMMutationList from "./DOMMutationList";
import { useApiEndpoint } from "../utils/hooks";

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
  // TODO use api
  // const { data: experiment } = useApiEndpoint<Experiment>(
  //   `/experiments/${experimentId}`
  // );
  const experiment = { variations: [{ domMutations: [] }] };
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

  const mutateRevert = useRef<(() => void) | null>(null);

  const selectedVariation =
    experiment?.variations?.[selectedVariationIndex] ?? null;

  const createVariation = useCallback(async () => {
    setVariations([...variations, { domMutations: [] }]);
  }, [variations, setVariations]);

  const addDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      setVariations([
        ...(variations?.map((variation, index) => {
          if (index === selectedVariationIndex) {
            return {
              ...variation,
              domMutations: [...variation.domMutations, domMutation],
            };
          }
          return variation;
        }) ?? []),
      ]);
    },
    [selectedVariation, setVariations]
  );

  const removeDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      setVariations([
        ...(variations?.map((variation, index) => {
          if (index === selectedVariationIndex) {
            return {
              ...variation,
              domMutations: variation.domMutations.filter(
                // TODO use an id or something :/
                (mutation) => mutation !== domMutation
              ),
            };
          }
          return variation;
        }) ?? []),
      ]);
    },
    [selectedVariation, setVariations]
  );

  // on load experiment we toggle on visual editor
  useEffect(() => {
    if (!experiment) return;
    setIsEnabled(true);
    setVariations(experiment.variations ?? []);
  }, [experiment]);

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

  // run dom mutations when experiment is updated or selected variation changes
  useEffect(() => {
    if (mutateRevert?.current) mutateRevert.current();

    const callbacks: Array<() => void> = [];

    selectedVariation?.domMutations.forEach((mutation) => {
      console.log("running mutation", mutation);
      const controller = mutate.declarative(mutation);
      callbacks.push(controller.revert);
    });

    mutateRevert.current = () => {
      callbacks.forEach((callback) => callback());
    };
  }, [selectedVariation]);

  if (!isVisualEditorEnabled) return null;

  return (
    <>
      {experiment ? <Toolbar mode={mode} setMode={setMode} /> : null}

      <DOMMutationList
        mutations={selectedVariation?.domMutations ?? []}
        removeDomMutation={removeDomMutation}
      />

      <ExperimentCreator
        experiment={experiment}
        createVariation={createVariation}
        selectedVariationIndex={selectedVariationIndex}
        setSelectedVariationIndex={setSelectedVariationIndex}
      />

      {mode === "selection" && selectedElement ? (
        <ElementDetails
          element={selectedElement}
          clearElement={() => setSelectedElement(null)}
          addMutation={addDomMutation}
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
