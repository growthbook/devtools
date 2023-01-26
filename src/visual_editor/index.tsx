import React, { FC, useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import Toolbar, { ToolbarMode } from "./Toolbar";
import {
  toggleNormalMode,
  toggleSelectionMode,
  toggleCssMode,
  toggleMutationMode,
  toggleScreenshotMode,
} from "./lib/modes";
// @ts-expect-error ts-loader does not understand this .css import
import VisualEditorCss from "./index.css";
import "./targetPage.css";

const VisualEditor: FC<{}> = () => {
  // TODO Set this to false before shipping to prod!!!!!!!!!!!!!!
  // TODO I repeat, DO NOT SHIP!!!!!!!
  const [isEnabled, setIsEnabled] = useState(true);
  // TODO Set this to "normal" before shipping to prod!!!!!!!!!!!!!!
  // TODO I repeat, DO NOT SHIP!!!!!!!
  const [mode, setMode] = useState<ToolbarMode>("selection");

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
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
    toggleNormalMode(mode === "normal");
    toggleSelectionMode(mode === "selection");
    toggleCssMode(mode === "css");
    toggleMutationMode(mode === "mutation");
    toggleScreenshotMode(mode === "screenshot");
  }, [mode]);

  return <>{isEnabled ? <Toolbar mode={mode} setMode={setMode} /> : null}</>;
};

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
