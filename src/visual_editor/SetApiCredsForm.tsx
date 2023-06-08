import React, { FC, useCallback, useEffect, useState } from "react";
import GBLogo from "../../public/logo192.png";
import { ApiCreds } from "../../devtools";

const areValidApiCreds = (creds: Partial<ApiCreds>): creds is ApiCreds =>
  !!creds.apiKey;

const SetApiCredsForm: FC<{
  appHost?: string;
  apiHost?: string;
  apiKey?: string;
  saveApiCreds: (creds: ApiCreds) => void;
  error?: string;
}> = ({
  appHost,
  apiHost: _apiHost = "",
  apiKey: _apiKey = "",
  saveApiCreds,
  error: _error,
}) => {
  const [apiHost, setApiHost] = useState(_apiHost);
  const [apiKey, setApiKey] = useState(_apiKey);
  const [error, setError] = useState(_error || "");

  useEffect(() => {
    setError(_error ?? "");
  }, [_error]);

  const onSubmit = useCallback(
    (creds: Partial<ApiCreds>) => {
      if (!areValidApiCreds(creds)) {
        return setError("Please fill out the API Key field");
      }
      saveApiCreds(creds);
    },
    [saveApiCreds]
  );

  return (
    <div className="gb-z-max gb-fixed gb-top-1 gb-right-1 gb-rounded gb-bg-slate-700 gb-text-white gb-w-96">
      <div className="gb-flex gb-px-4 gb-h-12 gb-items-center gb-justify-center gb-logo-bg gb-rounded">
        <div className="gb-h-8">
          <img
            src={GBLogo}
            alt="GB Logo"
            className="gb-w-auto gb-h-full gb-mr-1"
          />
        </div>
        <div className="gb-font-semibold gb-text-white">
          GrowthBook Visual Editor
        </div>
      </div>
      <div className="gb-p-4">
        <div className="gb-text-xl gb-font-semibold">API Key Required</div>
        <p className="gb-mb-2 gb-text-sm">
          You'll need to set your API Key in order for the Visual Editor to be
          enabled.
        </p>

        <ul className="gb-pl-4">
          <li className="gb-list-decimal gb-mb-2">
            {appHost ? (
              <a
                className="gb-underline"
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
          <li className="gb-list-decimal gb-mb-2">
            Enter your key in the form below and save.
          </li>
        </ul>
        <div className="gb-text-black">
          <label className="gb-text-white gb-text-sm">API Host</label>
          <input
            placeholder="https://api.growthbook.io"
            className="gb-p-2 gb-w-full gb-rounded gb-mb-2"
            type="text"
            value={apiHost}
            onChange={(e) => setApiHost(e.target.value)}
          />
          <label className="gb-text-white gb-text-sm">API Key</label>
          <input
            className="gb-p-2 gb-w-full gb-rounded"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.currentTarget.value)}
          />
        </div>

        {error && <div className="gb-text-red-400 gb-pt-2">{error}</div>}

        <button
          className="gb-mt-4 gb-p-2 gb-bg-indigo-600 gb-w-full gb-rounded"
          onClick={() => onSubmit({ apiKey, apiHost })}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SetApiCredsForm;
