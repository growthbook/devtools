import html2canvas from "html2canvas";
import React, { FC, useCallback, useEffect, useState } from "react";
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
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";
import ElementDetails from "./ElementDetails";
import ExperimentCreator from "./ExperimentCreator";
import GlobalCSSEditor from "./GlobalCSSEditor";

export type DomMutations = Array<{ type: string }>;

interface ExperimentVariation {
  canvas?: HTMLCanvasElement;
  domMutations: DomMutations;
}

export interface Experiment {
  variations?: ExperimentVariation[];
}

const captureCanvas = () => html2canvas(document.body, { scale: 0.125 });

const VisualEditor: FC<{}> = () => {
  const [isEnabled, setIsEnabled] = useState(
    window.location.href.includes("localhost:3001")
  );
  const [mode, setMode] = useState<ToolbarMode>("normal");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [domMutations, setDomMutations] = useState<any[]>([]);

  const createExperiment = useCallback(async () => {
    const canvas = await captureCanvas();
    setExperiment({
      variations: [
        { canvas, domMutations: [] },
        { canvas, domMutations: [] },
      ],
    });
  }, [setExperiment]);

  const createVariation = useCallback(async () => {
    console.log("createVariation");
    // TODO reset to control dom mutations here
    const canvas = await captureCanvas();
    setExperiment({
      ...experiment,
      variations: [
        ...(experiment?.variations ?? []),
        { canvas, domMutations: [] },
      ],
    });
  }, [experiment, setExperiment]);

  console.log("DEBUG experiment", experiment);

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

  useEffect(() => {
    toggleNormalMode(!isEnabled ? isEnabled : mode === "normal");
    toggleSelectionMode({
      isEnabled: !isEnabled ? isEnabled : mode === "selection",
      selectedElement,
      setSelectedElement,
    });
    toggleCssMode(!isEnabled ? isEnabled : mode === "css");
    toggleMutationMode(!isEnabled ? isEnabled : mode === "mutation");
    toggleScreenshotMode(!isEnabled ? isEnabled : mode === "screenshot");
  }, [isEnabled, mode]);

  useEffect(() => {
    if (!isEnabled) return;
    if (mode !== "selection") return;

    updateSelectedElement({
      selectedElement,
      setSelectedElement,
    });
  }, [selectedElement, setSelectedElement, isEnabled, mode]);

  if (!isEnabled) return null;

  return (
    <>
      {experiment ? <Toolbar mode={mode} setMode={setMode} /> : null}

      <ExperimentCreator
        experiment={experiment}
        createExperiment={createExperiment}
        createVariation={createVariation}
      />

      {mode === "selection" && selectedElement ? (
        <ElementDetails
          element={selectedElement}
          clearElement={() => setSelectedElement(null)}
        />
      ) : null}

      {mode === "css" ? (
        <GlobalCSSEditor
          appendDomMutation={(mutation) =>
            setDomMutations([...domMutations, mutation])
          }
        />
      ) : null}
    </>
  );
};

// mounting the visual editor
const container = document.createElement("div");
container.id = "visual-editor-container";
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
