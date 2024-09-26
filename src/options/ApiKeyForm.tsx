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
      className="gb-flex gb-flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        saveApiHost(_apiHost);
        saveApiKey(_apiKey);
        onSave();
      }}
    >
      <div className="gb-text-md gb-mb-2">
        Please enter your API credentials to connect to your GrowthBook account
      </div>
      <div className="gb-flex gb-flex-col gb-mb-4">
        <label className="gb-text-xs gb-px-1">API Host</label>
        <input
          placeholder="https://api.growthbook.io"
          className="gb-border gb-p-2 gb-rounded gb-text-black"
          type="text"
          value={_apiHost}
          onChange={(e) => _setApiHost(e.target.value)}
        />
      </div>
      <div className="gb-flex gb-flex-col gb-w-full gb-mb-4">
        <label className="gb-text-xs gb-px-1">API Secret</label>
        <div className="gb-flex gb-items-center gb-w-[100%]">
          <input
            placeholder="secret_xyz..."
            className="gb-border gb-p-2 gb-rounded gb-text-black gb-w-full"
            type={!showPassword ? "password" : "text"}
            value={_apiKey}
            onChange={(e) => _setApiKey(e.target.value)}
          />
          <a
            className="gb-flex gb-bg-gray-300 hover:gb-bg-gray-200 gb-rounded gb-items-center gb-justify-center gb-w-[50px] gb-h-7 gb-ml-2 gb-cursor-pointer"
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
          "gb-inline-block gb-text-white gb-p-2 gb-rounded gb-text-center gb-transition-colors",
          {
            "gb-bg-blue-600 hover:gb-bg-blue-500 gb-cursor-pointer": !disabled,
            "gb-bg-gray-200 gb-cursor-wait": disabled,
          },
        )}
        value="Submit"
        disabled={disabled ?? false}
      />
    </form>
  );
};

export default ApiKeyForm;
