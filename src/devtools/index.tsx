import { App } from "@/app";
import React from "react";
import * as ReactDOM from "react-dom/client";

const Popup = () => {
  return (
    <div className="relative overflow-y-scroll bg-zinc-100 min-h-[100vh]">
      <App />
    </div>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
