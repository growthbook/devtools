import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import clsx from "clsx";
import { useApiKey } from "../storage";
import ApiKeyForm from "./ApiKeyForm";
import "../global.css";

const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => (
  <div
    className={clsx("bg-white/50 fixed inset-0 z-10", {
      hidden: !isLoading,
    })}
  ></div>
);

const Popup = () => {
  const { apiKey, saveApiKey, loading } = useApiKey();

  return (
    <>
      <LoadingOverlay isLoading={loading} />

      <div className="w-96 p-4">
        <div className="text-2xl mb-4">GrowthBook DevTools v2</div>

        {!apiKey && <ApiKeyForm saveApiKey={saveApiKey} />}
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
