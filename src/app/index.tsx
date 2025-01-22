import "./index.css";
import { Theme, Flex, Button, Dialog } from "@radix-ui/themes";

import React, {useEffect, useRef, useState} from "react";
import logo from "@/devtools/ui/logo.svg";
import UseTabState from "@/app/hooks/useTabState";
import ApiKeyForm from "@/app/components/ApiKeyForm";
import useApiKey from "@/app/hooks/useApiKey";
import {Message, BGMessage} from "devtools";
import {FaGear} from "react-icons/fa6";
import {Attributes, Experiment, FeatureDefinition} from "@growthbook/growthbook";
import useTabState from "@/app/hooks/useTabState";


export const App = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();



  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  const [sdkFound, setSdkFound] = useState<boolean | undefined>(undefined);
  const [sdkVersion, setSdkVersion] = useState<string>("");

  const [sdkAttributes, setSdkAttributes] = useState<Attributes>({});
  const [sdkFeatures, setSdkFeatures] = useState<Record<string, FeatureDefinition>>({});
  const [sdkExperiments, setSdkExperiments] = useState<Record<string, Experiment<any>>>({});

  const [foo, setFoo] = useTabState("foo", "initial foo");


  const sdkFoundRef = useRef<boolean | undefined>(sdkFound);
  sdkFoundRef.current = sdkFound;
  useEffect(() => {
    window.setTimeout(() => {
      if (sdkFoundRef.current === undefined) setSdkFound(false);
    }, 2000);
  }, []);

  useEffect(() => {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      let activeTab = tabs[0];
      if (activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, "GB_REQUEST_REFRESH");
      }
    });
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      (message: Message | BGMessage, sender, sendResponse) => {
        const { type } = message;
        switch (type) {
          case "BG_SET_SDK_USAGE_DATA":
            const { data } = message;
            const sdkFound = !!data?.sdkFound;
            const sdkVersion = data?.sdkVersion;
            setSdkFound(sdkFound);
            if (sdkVersion !== undefined) {
              setSdkVersion(sdkVersion);
            }
            if (!sdkFound) {
              clearSdkState();
            }
            break;
          case "GB_REFRESH":
            const { attributes, features, experiments, overrides, url, clientKey, apiHost } = message;
            setSdkAttributes(attributes);
            setSdkFeatures(features);
            setSdkExperiments(experiments);
            break;
        }
      },
    );
  }, []);

  const clearSdkState = () => {
    setSdkAttributes({});
    setSdkFeatures({});
    setSdkExperiments({});
  }

  return (
    <Theme accentColor="violet" hasBackground={false}>
      <button onClick={()=> {setFoo(foo + " F")}}>{foo}</button>
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
                <div className="px-4"><FaGear/></div>
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
          <div className="label">GrowthBook SDK</div>
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
          <div className="label">Attributes</div>
          <textarea value={JSON.stringify(sdkAttributes, null, 2)}/>
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <div className="label">Features</div>
          <textarea value={JSON.stringify(sdkFeatures, null, 2)}/>
        </div>

        <div className="mb-3 px-3 py-2 border border-gray-200x rounded-lg bg-white">
          <div className="label">Experiments</div>
          <textarea value={JSON.stringify(sdkExperiments, null, 2)}/>
        </div>
      </div>
    </Theme>
  )
};
