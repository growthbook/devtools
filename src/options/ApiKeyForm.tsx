import React, { FC, useEffect, useState } from "react";

const ApiKeyInput: FC<{
  apiKey: string | null;
  apiHost: string | null;
  saveApiKey: (apiKey: string) => void;
  saveApiHost: (apiHost: string) => void;
}> = ({ saveApiKey, apiHost, saveApiHost, apiKey }) => {
  const [_apiKey, _setApiKey] = useState(apiKey || "");
  const [_apiHost, _setApiHost] = useState(apiHost || "");
  return (
    <form
      className="flex flex-col"
      onSubmit={(_e) => {
        saveApiKey(_apiKey);
        saveApiHost(_apiHost);
      }}
    >
      <div className="text-md mb-2">
        Please enter your API credentials to connect to your GrowthBook account
      </div>
      <label className="flex flex-col">
        <span className="text-xs px-1">API Host</span>
        <input
          placeholder="https://api.growthbook.io"
          className="border p-2 rounded mb-2"
          type="text"
          value={_apiHost}
          onChange={(e) => _setApiHost(e.target.value)}
        />
      </label>
      <label className="flex flex-col">
        <span className="text-xs px-1">API Secret</span>
        <input
          placeholder="secret_xyz..."
          className="border p-2 rounded mb-2"
          type="text"
          value={_apiKey}
          onChange={(e) => _setApiKey(e.target.value)}
        />
      </label>
      <input type="submit" className="p-2 bg-blue-300" value="Submit" />
    </form>
  );
};

export default ApiKeyInput;
