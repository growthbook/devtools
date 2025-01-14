import React, { FC, useState } from "react";
import clsx from "clsx";

const ApiKeyForm: FC<{
  apiHost: string | null;
  apiKey: string | null;
  saveApiHost: (apiHost: string) => void;
  saveApiKey: (apiKey: string) => void;
  onSave: () => void;
  disabled?: boolean;
}> = ({ saveApiHost, saveApiKey, apiHost, apiKey, onSave, disabled }) => {
  const [_apiHost, _setApiHost] = useState(apiHost || "");
  const [_apiKey, _setApiKey] = useState(apiKey || "");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        saveApiHost(_apiHost);
        saveApiKey(_apiKey);
        onSave();
      }}
    >
      <div className="text-md mb-2">
        Please enter your API credentials to connect to your GrowthBook account
      </div>
      <div className="flex flex-col mb-4">
        <label className="text-xs px-1">API Host</label>
        <input
          placeholder="https://api.growthbook.io"
          className="border p-2 rounded text-black"
          type="text"
          value={_apiHost}
          onChange={(e) => _setApiHost(e.target.value)}
        />
      </div>
      <div className="flex flex-col w-full mb-4">
        <label className="text-xs px-1">API Secret</label>
        <div className="flex items-center w-[100%]">
          <input
            placeholder="secret_xyz..."
            className="border p-2 rounded text-black w-full"
            type={!showPassword ? "password" : "text"}
            value={_apiKey}
            onChange={(e) => _setApiKey(e.target.value)}
          />
          <a
            className="flex bg-gray-300 hover:bg-gray-200 rounded items-center justify-center w-[50px] h-7 ml-2 cursor-pointer"
            role="button"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? "hide" : "show"}
          </a>
        </div>
      </div>
      <input
        type="submit"
        className={clsx(
          "inline-block text-white p-2 rounded text-center transition-colors",
          {
            "bg-blue-600 hover:bg-blue-500 cursor-pointer": !disabled,
            "bg-gray-200 cursor-wait": disabled,
          },
        )}
        value="Submit"
        disabled={disabled ?? false}
      />
    </form>
  );
};

export default ApiKeyForm;
