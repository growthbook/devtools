import React, { FC } from "react";

const ApiKeyInput: FC<{
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}> = ({ apiKey, setApiKey }) => {
  return (
    <input
      placeholder="API Key"
      className="border p-2 rounded"
      type="text"
      value={apiKey}
      onChange={(e) => setApiKey(e.target.value)}
    />
  );
};

export default ApiKeyInput;
