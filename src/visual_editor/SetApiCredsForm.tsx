import React, { FC, useCallback, useState } from "react";
import GBLogo from "../../public/logo192.png";

export interface ApiCreds {
  key: string;
  host: string;
}

const areValidApiCreds = (creds: Partial<ApiCreds>): creds is ApiCreds =>
  !!creds.host && !!creds.key;

const SetApiCredsAlert: FC<{
  appHost?: string;
  apiHost?: string;
  saveApiCreds: (creds: ApiCreds) => void;
}> = ({ appHost, apiHost: _apiHost, saveApiCreds }) => {
  const [apiHost, setApiHost] = useState(_apiHost);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const onSubmit = useCallback(
    (creds: Partial<ApiCreds>) => {
      if (!areValidApiCreds(creds)) {
        return setError("Please fill out both fields");
      }
      saveApiCreds(creds);
    },
    [saveApiCreds]
  );

  return (
    <div className="z-max fixed top-1 right-1 rounded bg-slate-700 text-white w-96">
      <div className="flex px-4 h-12 items-center justify-center logo-bg rounded">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white">GrowthBook Visual Editor</div>
      </div>
      <div className="p-4">
        <div className="text-xl font-semibold">API Key Required</div>
        <p className="mb-2 text-sm">
          You'll need to set your API Key in order for the Visual Editor to be
          enabled.
        </p>

        <ul className="pl-4">
          <li className="list-decimal mb-2">
            {appHost ? (
              <a
                className="underline"
                href={`${appHost}/settings/keys`}
                target="_blank"
                rel="noreferrer"
              >
                Generate an API Key in Growthbook
              </a>
            ) : (
              "Generate an API key in Growthbook"
            )}
          </li>
          <li className="list-decimal mb-2">
            Enter your key in the form below and save.
          </li>
        </ul>
        <div className="text-black">
          <label className="text-white text-sm">API Host</label>
          <input
            className="p-2 w-full rounded mb-2"
            type="text"
            value={apiHost}
            onChange={(e) => setApiHost(e.target.value)}
          />
          <label className="text-white text-sm">API Key</label>
          <input
            className="p-2 w-full rounded"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.currentTarget.value)}
          />
        </div>

        {error && <div className="text-red-400 pt-2">{error}</div>}

        <button
          className="mt-4 p-2 bg-indigo-600 w-full rounded"
          onClick={() => onSubmit({ key: apiKey, host: apiHost })}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SetApiCredsAlert;
