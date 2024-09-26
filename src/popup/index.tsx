import React, { useState } from "react";
import * as ReactDOM from "react-dom/client";
import useApiKey from "../visual_editor/lib/hooks/useApiKey";
import "./index.css";
import ApiKeyForm from "../options/ApiKeyForm";
import logo from "../devtools/ui/logo.svg";

const Popup = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  return (
    <>
      <div className="gb-w-[360px] gb-p-3 gb-bg-zinc-100">
        <h1 className="gb-text-lg gb-mb-2">
          <img
            src={logo}
            alt="GrowthBook"
            className="gb-w-[140px] gb-inline-block gb-mb-1 gb-mr-2"
          />
          <span className="gb-text-gray-500 gb-font-bold">DevTools</span>
        </h1>

        <div className="gb-mb-3 gb-px-3 gb-py-2 gb-border gb-border-gray-200 gb-rounded-lg gb-bg-white">
          <label className="gb-inline-block gb-label gb-text-sm gb-mb-1">
            GrowthBook Inspector
          </label>
          <div className="gb-mt-1">
            To inspect the current page, open the <strong>Dev Tools</strong> (
            <code className="gb-text-red-800 gb-whitespace-nowrap">
              {getDevToolsShortcut()}
            </code>
            ) and find the <strong>GrowthBook</strong> tab.
          </div>
        </div>

        <div className="gb-mb-3 gb-px-3 gb-py-2 gb-border gb-border-gray-200 gb-rounded-lg gb-bg-white">
          <label className="gb-label gb-text-sm">Visual Editor</label>
          <div className="gb-mt-1">
            To use the visual editor, you must create an experiment in{" "}
            <strong>GrowthBook</strong> and add <strong>Visual Editor</strong>{" "}
            changes.
          </div>
        </div>

        <div className="gb-px-3 gb-py-2 gb-border gb-border-gray-200 gb-rounded-lg gb-bg-white">
          <a
            className="gb-flex gb-justify-between gb-items-center hover:gb-underline"
            role="button"
            onClick={() => {
              setCredentialsOpen(!credentialsOpen);
            }}
          >
            <label className="gb-label gb-text-sm gb-cursor-pointer">
              My Credentials
            </label>
            <span
              className="triangle"
              style={{ transform: `rotate(${credentialsOpen ? 0 : -180}deg)` }}
            />
          </a>
          {credentialsOpen && (
            <div className="gb-mt-2">
              <ApiKeyForm
                apiHost={apiHost}
                apiKey={apiKey}
                saveApiHost={saveApiHost}
                saveApiKey={saveApiKey}
                onSave={() => {
                  setDisableButtons(true);
                  setTimeout(() => {
                    setCredentialsOpen(false);
                    setDisableButtons(false);
                  }, 200);
                }}
                disabled={disableButtons || loading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);

function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "Mac";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  if (userAgent.indexOf("X11") !== -1) return "Unix";
  return "Unknown";
}

function getDevToolsShortcut() {
  const os = getOS();
  switch (os) {
    case "Windows":
      return "Ctrl + Shift + I or F12";
    case "Mac":
      return "Cmd + Option + I";
    case "Linux":
      return "Ctrl + Shift + I or F12";
    case "Unix":
      return "Ctrl + Shift + I or F12";
    default:
      return "Unknown shortcut";
  }
}
