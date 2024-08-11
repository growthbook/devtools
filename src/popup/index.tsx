import React, {useState} from "react";
import * as ReactDOM from "react-dom/client";
import useApiKey from "../visual_editor/lib/hooks/useApiKey";
import "./index.css";
import ApiKeyForm from "../options/ApiKeyForm";
import logo from "../devtools/ui/logo.svg";
import {requestOpenVisualEditor} from "../devtools/controller";
import clsx from "clsx";

const Popup = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  return (
    <>
      <div className="w-[360px] p-3 bg-zinc-100">
        <h1 className="text-lg mb-2">
          <img src={logo} alt="GrowthBook" className="w-[140px] inline-block mb-1 mr-2"/>
          <span className="text-gray-500 font-bold">DevTools</span>
        </h1>

        <div className="mb-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <label className="inline-block label text-sm mb-1">GrowthBook Inspector</label>
          <div className="mt-1">
            To inspect the current page, open the <strong>Dev Tools</strong>{" "}
            (<code className="text-red-800 whitespace-nowrap">{getDevToolsShortcut()}</code>){" "}
            and find the <strong>GrowthBook</strong> tab.
          </div>
        </div>

        <div className="flex justify-between items-center mb-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <label className="label text-sm">Visual Editor</label>
          <a
            className={clsx("inline-block text-white p-2 rounded text-center transition-colors w-[64px]", {
              "bg-blue-600 hover:bg-blue-500 cursor-pointer": !disableButtons,
              "bg-gray-200 cursor-wait": disableButtons,
            })}
            role="button"
            onClick={() => {
              if (disableButtons) return;
              requestOpenVisualEditor({ apiHost, apiKey, source: "popup" });
              setDisableButtons(true);
              setTimeout(window.close, 200);
            }}
          >Open</a>
        </div>

        <div className="px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <a
            className="flex justify-between items-center hover:underline"
            role="button"
            onClick={() => {
              setCredentialsOpen(!credentialsOpen);
            }}
          >

              <label className="label text-sm cursor-pointer">My Credentials</label>
              <span className="triangle" style={{ transform: `rotate(${credentialsOpen ? 0 : -180}deg)`}}/>
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
                    setTimeout(()=> {
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
    <Popup/>
  </React.StrictMode>
);


function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Win') !== -1) return 'Windows';
  if (userAgent.indexOf('Mac') !== -1) return 'Mac';
  if (userAgent.indexOf('Linux') !== -1) return 'Linux';
  if (userAgent.indexOf('X11') !== -1) return 'Unix';
  return 'Unknown';
}

function getDevToolsShortcut() {
  const os = getOS();
  switch (os) {
    case 'Windows':
      return 'Ctrl + Shift + I or F12';
    case 'Mac':
      return 'Cmd + Option + I';
    case 'Linux':
      return 'Ctrl + Shift + I or F12';
    case 'Unix':
      return 'Ctrl + Shift + I or F12';
    default:
      return 'Unknown shortcut';
  }
}
