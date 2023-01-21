import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import clsx from "clsx";
import { useApiKey } from "../utils/hooks";
import "../global.css";
import FeaturesList from "./FeaturesList";

const Popup = () => {
  const { apiKey } = useApiKey();

  return (
    <div className="w-96 p-4">
      <div className="mb-2">
        <div className="text-2xl mb-1">GrowthBook DevTools v2</div>

        {!apiKey && (
          <div className="text-lg">
            Please supply your API credentials{" "}
            <a
              className="text-blue-500 cursor-pointer underline"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              here
            </a>{" "}
            to connect the extension with your GrowthBook account.
          </div>
        )}
        {apiKey ? <FeaturesList /> : null}
      </div>
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
