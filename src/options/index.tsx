import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { useApiKey } from "../utils/hooks";
import ApiKeyForm from "./ApiKeyForm";
import "../global.css";

const Options = () => {
  const { apiKey, apiHost, saveApiKey, saveApiHost, loading } = useApiKey();

  return (
    <>
      <div className="w-96 p-4">
        <div className="mb-2">
          <div className="text-2xl mb-1">GrowthBook DevTools v2</div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <ApiKeyForm
            apiKey={apiKey}
            apiHost={apiHost}
            saveApiKey={saveApiKey}
            saveApiHost={saveApiHost}
          />
        )}
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
