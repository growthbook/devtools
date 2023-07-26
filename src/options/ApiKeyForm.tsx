import React, { FC, useState } from "react";

const ApiKeyForm: FC<{
  apiKey: string | null;
  saveApiKey: (apiKey: string) => void;
  onSave: () => void;
}> = ({ saveApiKey, apiKey, onSave }) => {
  const [_apiKey, _setApiKey] = useState(apiKey || "");
  return (
    <form
      className="gb-flex gb-flex-col"
      onSubmit={(_e) => {
        saveApiKey(_apiKey);
        onSave();
      }}
    >
      <div className="gb-text-md gb-mb-2">
        Please enter your API credentials to connect to your GrowthBook account
      </div>
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
