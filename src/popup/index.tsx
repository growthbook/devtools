import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import clsx from "clsx";
import { useApiKey } from "./hooks";
import ApiKeyForm from "./ApiKeyForm";
import "../global.css";
import FeaturesList from "./FeaturesList";

const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => (
  <div
    className={clsx("bg-white/50 fixed inset-0 z-10", {
      hidden: !isLoading,
    })}
  ></div>
);

const Popup = () => {
  const { apiKey, apiHost, saveApiKey, saveApiHost, clearApiKey, loading } =
    useApiKey();

  return (
    <>
      <LoadingOverlay isLoading={loading} />

      <div className="w-96 p-4">
        <div className="mb-2">
          <div className="text-2xl mb-1">GrowthBook DevTools v2</div>
          {apiKey ? (
            <div
              className="text-xs text-blue-400 underline cursor-pointer"
              onClick={clearApiKey}
            >
              Disconnect
            </div>
          ) : null}
        </div>

        {!apiKey ? (
          <ApiKeyForm
            apiHost={apiHost}
            saveApiKey={saveApiKey}
            saveApiHost={saveApiHost}
          />
        ) : null}

        {apiKey ? <FeaturesList apiKey={apiKey} /> : null}
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
