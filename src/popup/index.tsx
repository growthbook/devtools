import React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import logo from "./logo.svg";

const Popup = () => {
  return (
    <div className="w-96 p-4 mb-2">
      <div className="flex items-center">
        <img src={logo} className="w-32" alt="GrowthBook" />
        <span className="ml-2 text-lg">DevTools v2</span>
      </div>

      <hr className="my-2" />

      <a
        className="text-blue-500 cursor-pointer underline text-lg"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        Settings
      </a>
    </div>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
