import { App } from "@/app";
import React from "react";
import * as ReactDOM from "react-dom/client";

const Popup = () => {
  return <App />;
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
