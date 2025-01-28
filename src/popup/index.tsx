import { App } from "@/app";
import React from "react";
import * as ReactDOM from "react-dom/client";

const Popup = () => {
  return (
    <div className="w-[600px] h-[450px] relative overflow-y-scroll bg-zinc-100">
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
