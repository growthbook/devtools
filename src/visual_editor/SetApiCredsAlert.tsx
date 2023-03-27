import React, { FC, useEffect, useState } from "react";
import useMessage from "./lib/hooks/useMessage";
import GBLogo from "../../public/logo192.png";
import CreateApiKeyScreenshot from "../../public/create-api-key.png";

const SetApiCredsAlert: FC<{ hostUrl?: string }> = ({ hostUrl }) => {
  const [optionsUrl, setOptionsUrl] = useState("");

  useMessage({
    messageHandler: (message) => {
      if (message.type !== "GB_RESPONSE_OPTIONS_URL") return;
      setOptionsUrl(message.url);
    },
    outgoingMessage: { type: "GB_REQUEST_OPTIONS_URL" },
  });

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
        <img
          src={CreateApiKeyScreenshot}
          alt="Create API Key"
          className="w-full"
        />
        <p className="mb-2">
          You'll need to set your API Key in order for the Visual Editor to be
          enabled.
        </p>

        <ul className="pl-4">
          <li className="list-decimal mb-2">
            {hostUrl ? (
              <a
                className="underline"
                href={`${hostUrl}/settings/keys`}
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
            Save the key in the{" "}
            {optionsUrl ? (
              <a
                className="underline"
                href="#"
                onClick={() => window.open(optionsUrl)}
              >
                Chrome Extension Options Page
              </a>
            ) : (
              "Visual Editor Options"
            )}
          </li>
        </ul>

        <p className="mb-2">
          After setting your key, refresh the page to start editing!
        </p>
      </div>
    </div>
  );
};

export default SetApiCredsAlert;
