import React, { FC, useState } from "react";

const ApiKeyForm: FC<{
  apiKey: string | null;
  apiHost: string | null;
  saveApiKey: (apiKey: string) => void;
  saveApiHost: (apiHost: string) => void;
  onSave: () => void;
}> = ({ saveApiKey, apiHost, saveApiHost, apiKey, onSave }) => {
  const [_apiKey, _setApiKey] = useState(apiKey || "");
  const [_apiHost, _setApiHost] = useState(apiHost || "");
  return (
    <form
      className="gb-flex gb-flex-col"
      onSubmit={(_e) => {
        saveApiKey(_apiKey);
        saveApiHost(_apiHost.replace(/[\/]+$/, ""));
        onSave();
      }}
    >
      <div className="gb-text-md gb-mb-2">
        Please enter your API credentials to connect to your GrowthBook account
      </div>
      <label className="gb-flex gb-flex-col">
        <span className="gb-text-xs gb-px-1">API Host</span>
        <input
          placeholder="https://api.growthbook.io"
          className="gb-border gb-p-2 gb-rounded gb-mb-2 gb-text-black"
          type="text"
          value={_apiHost}
          onChange={(e) => _setApiHost(e.target.value)}
        />
      </label>
      <label className="gb-flex gb-flex-col">
        <span className="gb-text-xs gb-px-1">API Secret</span>
        <input
          placeholder="secret_xyz..."
          className="gb-border gb-p-2 gb-rounded gb-mb-4 gb-text-black"
          type="password"
          value={_apiKey}
          onChange={(e) => _setApiKey(e.target.value)}
        />
      </label>
      <input type="submit" className="gb-p-2 gb-bg-blue-300" value="Submit" />
    </form>
  );
};

export default ApiKeyForm;
