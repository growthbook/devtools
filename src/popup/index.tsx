import React, { useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom/client";
import logo from "@/devtools/ui/logo.svg";
import "./index.css";
import { BGMessage } from "devtools";
import useApiKey from "@/app/hooks/useApiKey";
import ApiKeyForm from "@/app/components/ApiKeyForm";

const Popup = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  const [sdkFound, setSdkFound] = useState<boolean | undefined>(undefined);
  const [sdkVersion, setSdkVersion] = useState<string>("");

  const sdkFoundRef = useRef<boolean | undefined>(sdkFound);
  sdkFoundRef.current = sdkFound;
  useEffect(() => {
    window.setTimeout(() => {
      if (sdkFoundRef.current === undefined) setSdkFound(false);
    }, 2000);
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      (message: BGMessage, sender, sendResponse) => {
        const { type, data } = message;
        switch (type) {
          case "BG_SET_SDK_USAGE_DATA":
            const senderOrigin = sender.origin;
            let tabId = sender.tab?.id;
            const sdkFound = !!data?.sdkFound;
            const sdkVersion = data?.sdkVersion;
            setSdkFound(sdkFound);
            if (sdkVersion !== undefined) {
              setSdkVersion(sdkVersion);
            }
            break;
        }
      },
    );
  }, []);

  return (
    <>
      <div id="main" className="w-[500px] p-3 bg-zinc-100">
        <h1 className="text-lg mb-2">
          <img
            src={logo}
            alt="GrowthBook"
            className="w-[140px] inline-block mb-1 mr-2"
          />
          <span className="text-gray-500 font-bold">DevTools</span>
        </h1>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <label className="label text-sm">GrowthBook SDK</label>
          {sdkFound ? (
            <div>
              <h4>🟢 SDK connected</h4>
              <strong>{sdkVersion}</strong>
            </div>
          ) : sdkFound === false ? (
            <h4>⚪ no SDK present</h4>
          ) : (
            <div>
              <em>Loading...</em>
            </div>
          )}
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <label className="inline-block label text-sm mb-1">
            GrowthBook Inspector
          </label>
          <div className="mt-1">
            To inspect the current page, open the <strong>Dev Tools</strong> (
            <code className="text-red-800 whitespace-nowrap">
              {getDevToolsShortcut()}
            </code>
            ) and find the <strong>GrowthBook</strong> tab.
          </div>
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <label className="label text-sm">Visual Editor</label>
          <div className="mt-1">
            To use the visual editor, you must create an experiment in{" "}
            <strong>GrowthBook</strong> and add <strong>Visual Editor</strong>{" "}
            changes.
          </div>
        </div>

        <div className="px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <a
            className="flex justify-between items-center hover:underline"
            role="button"
            onClick={() => {
              setCredentialsOpen(!credentialsOpen);
            }}
          >
            <label className="label text-sm cursor-pointer">
              My Credentials
            </label>
            <span
              className="triangle"
              style={{ transform: `rotate(${credentialsOpen ? 0 : -180}deg)` }}
            />
          </a>
          {credentialsOpen && (
            <div className="mt-2">
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
