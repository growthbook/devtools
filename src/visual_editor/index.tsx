import React, { FC, useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
// @ts-expect-error ts-loader does not understand .css imports
import VisualEditorCss from "./index.css";
import Toolbar from "./Toolbar";

const VisualEditor: FC<{}> = () => {
  const [isEnabled, setIsEnabled] = useState(false);

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

  return <>{isEnabled ? <Toolbar /> : null}</>;
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
