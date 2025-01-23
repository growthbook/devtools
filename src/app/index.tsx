import "./index.css";
import { Theme, Flex, Button, Dialog, Tabs } from "@radix-ui/themes";

import React, { useEffect, useState } from "react";
import logo from "@/devtools/ui/logo.svg";
import useTabState from "@/app/hooks/useTabState";
import UseGlobalState from "@/app/hooks/useGlobalState";
import ApiKeyForm from "@/app/components/ApiKeyForm";
import useApiKey from "@/app/hooks/useApiKey";
import { Message, BGMessage } from "devtools";
import { FaGear } from "react-icons/fa6";
import {
  Attributes,
  Experiment,
  FeatureDefinition,
} from "@growthbook/growthbook";
import SdkTab from "./components/SdkTab";
import AttributesTab from "./components/AttributesTab";
import ExperimentsTab from "./components/ExperimentsTab";
import FeaturesTab from "./components/FeaturesTab";
import LogsTab from "./components/LogsTab";
import useGlobalState from "@/app/hooks/useGlobalState";
import SettingsForm, {API_HOST, API_KEY} from "@/app/components/SettingsForm";

export const App = () => {
  const { apiHost, apiKey, saveApiHost, saveApiKey, loading } = useApiKey();

  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined
  );
  const [_sdkVersion, setSdkVersion] = useTabState<string>("sdkVersion", "");
  const [_sdkAttributes, setSdkAttributes] = useTabState<Attributes>(
    "sdkAttributes",
    {}
  );
  const [_sdkFeatures, setSdkFeatures] = useTabState<
    Record<string, FeatureDefinition>
  >("sdkFeatures", {});
  const [_sdkExperiments, setSdkExperiments] = useState<
    Record<string, Experiment<any>>
  >({});
  const [currentTab, setCurrentTab] = useTabState("currentTab", "sdk");

  const [foo, setFoo] = useTabState<string>("foo", "tabState");
  const [bar, setBar] = UseGlobalState<string>("bar", "globalState", true);

  useEffect(() => {
    window.setTimeout(() => {
      if (sdkFound === undefined) setSdkFound(false);
    }, 2000);
  }, []);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
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
            const messageSdkFound = !!data?.sdkFound;
            const messageSdkVersion = data?.sdkVersion;
            setSdkFound(messageSdkFound);
            if (messageSdkVersion !== undefined) {
              setSdkVersion(messageSdkVersion);
            }
            if (!messageSdkFound) {
              clearSdkState();
            }
            break;
          case "GB_REFRESH":
            const {
              attributes,
              features,
              experiments,
              overrides,
              url,
              clientKey,
              apiHost,
            } = message;
            setSdkAttributes(attributes);
            setSdkFeatures(features);
            setSdkExperiments(experiments);
            break;
        }
      }
    );
  }, []);

  const clearSdkState = () => {
    setSdkAttributes({});
    setSdkFeatures({});
    setSdkExperiments({});
  };

  return (
    <Theme accentColor="violet" hasBackground={false}>
      <Button
        onClick={() => {
          setFoo(foo + " F");
        }}
      >
        {foo}
      </Button>
      <Button
        onClick={() => {
          setBar(bar + " B");
        }}
      >
        {bar}
      </Button>
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
                <div className="px-4">
                  <FaGear />
                </div>
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>My Credentials</Dialog.Title>
              {credentialsOpen && (
                <SettingsForm close={() => setCredentialsOpen(false)} />
              )}
              {/*<ApiKeyForm*/}
              {/*  apiHost={apiHost}*/}
              {/*  apiKey={apiKey}*/}
              {/*  saveApiHost={saveApiHost}*/}
              {/*  saveApiKey={saveApiKey}*/}
              {/*  onSave={() => {*/}
              {/*    setDisableButtons(true);*/}
              {/*    setTimeout(() => {*/}
              {/*      setCredentialsOpen(false);*/}
              {/*      setDisableButtons(false);*/}
              {/*    }, 200);*/}
              {/*  }}*/}
              {/*  disabled={disableButtons || loading}*/}
              {/*/>*/}
            </Dialog.Content>
          </Dialog.Root>
        </Flex>

        <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
          <Tabs.List>
            <Tabs.Trigger value="sdk">SDK Connection</Tabs.Trigger>
            <Tabs.Trigger value="attributes">User Attributes</Tabs.Trigger>
            <Tabs.Trigger value="features">Features</Tabs.Trigger>
            <Tabs.Trigger value="experiments">Experiments</Tabs.Trigger>
            <Tabs.Trigger value="logs">Event Logs</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="sdk">
            <SdkTab />
          </Tabs.Content>
          <Tabs.Content value="attributes">
            <AttributesTab />
          </Tabs.Content>
          <Tabs.Content value="features">
            <FeaturesTab />
          </Tabs.Content>
          <Tabs.Content value="experiments">
            <ExperimentsTab />
          </Tabs.Content>
          <Tabs.Content value="logs">
            <LogsTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Theme>
  );
};
