import { App } from "@/app";
import React from "react";
import * as ReactDOM from "react-dom/client";
import { ResponsiveContextProvider } from "@/app/hooks/useResponsive";

const Popup = () => {
  return <App />;
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <ResponsiveContextProvider>
      <Popup />
    </ResponsiveContextProvider>
  </React.StrictMode>,
);
