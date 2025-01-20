import "./index.css";
import { Theme, Flex, Text, Button, Dialog } from "@radix-ui/themes";

import React, {useEffect, useRef, useState} from "react";
import logo from "@/devtools/ui/logo.svg";
import ApiKeyForm from "@/app/components/ApiKeyForm";
import useApiKey from "@/app/hooks/useApiKey";
import {BGMessage} from "devtools";
import {FaGear} from "react-icons/fa6";

export const App = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  const [sdkFound, setSdkFound] = useState<boolean | undefined>(undefined);
  const [sdkVersion, setSdkVersion] = useState<string>("");

  const sdkFoundRef = useRef<boolean | undefined>(sdkFound);
  sdkFoundRef.current = sdkFound;
  useEffect(() => {
    window.setTimeout(() => {
      if (sdkFoundRef.current === undefined) setSdkFound(false);
    }, 2000);
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      (message: BGMessage, sender, sendResponse) => {
        const { type, data } = message;
        switch (type) {
          case "BG_SET_SDK_USAGE_DATA":
            const senderOrigin = sender.origin;
            let tabId = sender.tab?.id;
            const sdkFound = !!data?.sdkFound;
            const sdkVersion = data?.sdkVersion;
            setSdkFound(sdkFound);
            if (sdkVersion !== undefined) {
              setSdkVersion(sdkVersion);
            }
            break;
        }
      },
    );
  }, []);

  return (
    <Theme accentColor="violet" hasBackground={false}>
      <div id="main" className="p-3">
        <Flex justify="between">
          <h1 className="text-lg mb-2">
            <img
              src={logo}
              alt="GrowthBook"
              className="w-[140px] inline-block mb-1 mr-2"
            />
            <span className="text-gray-500 font-bold">DevTools</span>
          </h1>

          <Dialog.Root
            open={credentialsOpen}
            onOpenChange={(o) => setCredentialsOpen(o)}
          >
            <Dialog.Trigger>
              <Button>
                <div className="px-4"><FaGear /></div>
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>
                My Credentials
              </Dialog.Title>
              <ApiKeyForm
                apiHost={apiHost}
                apiKey={apiKey}
                saveApiHost={saveApiHost}
                saveApiKey={saveApiKey}
                onSave={() => {
                  setDisableButtons(true);
                  setTimeout(() => {
                    setCredentialsOpen(false);
                    setDisableButtons(false);
                  }, 200);
                }}
                disabled={disableButtons || loading}
              />
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <label className="label text-sm">GrowthBook SDK</label>
          {sdkFound ? (
            <div>
              <h4>🟢 SDK connected</h4>
              <strong>{sdkVersion}</strong>
            </div>
          ) : sdkFound === false ? (
            <h4>⚪ no SDK present</h4>
          ) : (
            <div>
              <em>Loading...</em>
            </div>
          )}
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <label className="inline-block label text-sm mb-1">
            GrowthBook Inspector
          </label>
          <div className="mt-1">
            To inspect the current page, open the <strong>Dev Tools</strong> (
            {/*<code className="text-red-800 whitespace-nowrap">*/}
            {/*  {getDevToolsShortcut()}*/}
            {/*</code>*/}
            ) and find the <strong>GrowthBook</strong> tab.
          </div>
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200 rounded-lg bg-white">
          <label className="label text-sm">Visual Editor</label>
          <div className="mt-1">
            To use the visual editor, you must create an experiment in{" "}
            <strong>GrowthBook</strong> and add <strong>Visual Editor</strong>{" "}
            changes.
          </div>
        </div>
      </div>
    </Theme>
  )
};
