import React, { FC, useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { Message } from "../../devtools";
import Toolbar, { ToolbarMode } from "./Toolbar";
import {
  toggleNormalMode,
  toggleSelectionMode,
  toggleCssMode,
  toggleMutationMode,
  toggleScreenshotMode,
} from "./lib/modes";
import "./targetPage.css";
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";

const VisualEditor: FC<{}> = () => {
  const [isEnabled, setIsEnabled] = useState(
    // TODO Obv get rid of this before shipping
    window.location.href.includes("localhost:3001")
  );
  const [mode, setMode] = useState<ToolbarMode>("selection");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );

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
    if (!isEnabled) return;
    toggleNormalMode(mode === "normal");
    toggleSelectionMode(mode === "selection");
    toggleCssMode(mode === "css");
    toggleMutationMode(mode === "mutation");
    toggleScreenshotMode(mode === "screenshot");
  }, [isEnabled, mode]);

  if (!isEnabled) return null;

  return (
    <>
      <Toolbar mode={mode} setMode={setMode} />{" "}
      {mode === "selection" && selectedElement ? <div></div> : null}
    </>
  );
};

// mounting the visual editor
const container = document.createElement("div");
const shadowRoot = container?.attachShadow({ mode: "open" });

if (shadowRoot) {
  console.log("attachShadow");
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
