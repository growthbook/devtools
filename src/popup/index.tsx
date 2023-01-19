import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import ApiKeyInput from "./ApiKeyInput";
import "../global.css";

const Popup = () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!apiKey || !apiKey.startsWith("secret_")) return;

    fetch("http://localhost:3100/api/v1", {
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":")}`,
      },
    })
      .then((res) => res.json())
      .then((json) => console.log("fetch response", json));
  }, [apiKey]);

  return (
    <div className="w-96 p-4">
      <div className="text-2xl mb-4">GrowthBook DevTools v2</div>
      <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
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
