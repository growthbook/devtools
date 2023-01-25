import React, { FC, useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import Toolbar from "./Toolbar";
import "../global.css";

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

const container = document.getElementById("visual-editor-container");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <VisualEditor />
  </React.StrictMode>
);
