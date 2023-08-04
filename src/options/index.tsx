import React from "react";
import * as ReactDOM from "react-dom/client";
import useApiKey from "../visual_editor/lib/hooks/useApiKey";
import ApiKeyForm from "./ApiKeyForm";
import "./index.css";

const Options = () => {
  const { apiKey, saveApiKey, loading } = useApiKey();

  const onSave = () => {
    window.close();
  };

  return (
    <>
      <div className="gb-w-96 gb-p-4">
        {loading ? (
          <div className="gb-text-gray-500">Loading...</div>
        ) : (
          <ApiKeyForm apiKey={apiKey} saveApiKey={saveApiKey} onSave={onSave} />
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
