import React, { useState } from "react";
import * as ReactDOM from "react-dom/client";
import { useApiKey } from "../utils/hooks";
import "./index.css";
import FeaturesList from "./FeaturesList";

const Popup = () => {
  const { apiKey } = useApiKey();

  const sendMessage = () => {
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id || 0, {
            type: "GB_ENABLE_VISUAL_EDITOR",
          });
        }
      );
  };

  return (
    <div className="w-96 p-4">
      <div className="mb-2">
        <div className="text-2xl mb-1">GrowthBook DevTools v2</div>

        {!apiKey ? (
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
        ) : (
          <a
            className="text-blue-500 cursor-pointer underline"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Options
          </a>
        )}

        {apiKey ? <FeaturesList /> : null}

        <button
          className="p-2 text-white bg-blue-500 mt-4"
          onClick={sendMessage}
        >
          Toggle Visual Editor
        </button>
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
