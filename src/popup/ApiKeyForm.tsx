import React, { FC, useEffect, useState } from "react";

const ApiKeyInput: FC<{
  saveApiKey: (apiKey: string) => void;
}> = ({ saveApiKey }) => {
  const [_apiKey, _setApiKey] = useState("");
  return (
    <form
      className="flex flex-col"
      onSubmit={(_e) => {
        saveApiKey(_apiKey);
      }}
    >
      <div className="text-md mb-2">
        Please enter an API Key to connect your GrowthBook account
      </div>
      <input
        placeholder="API Key"
        className="border p-2 rounded mb-2"
        type="text"
        value={_apiKey}
        onChange={(e) => _setApiKey(e.target.value)}
      />
      <input type="submit" className="p-2 bg-blue-300" value="Submit" />
    </form>
  );
};

export default ApiKeyInput;
