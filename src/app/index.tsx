import "@/app/css/index.css";
import {
  Theme,
  Flex,
  Button,
  IconButton,
  Dialog,
  Tabs,
} from "@radix-ui/themes";

import React, { useEffect, useState } from "react";
import logo from "@/devtools/ui/logo.svg";
import useTabState from "@/app/hooks/useTabState";
import { Message, BGMessage } from "devtools";
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
import SettingsForm from "@/app/components/Settings";
import { PiX, PiGearSix } from "react-icons/pi";
import useGlobalState from "./hooks/useGlobalState";

export const App = () => {
  const [showSdkDebug, setShowSdkDebug] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const [currentTab, setCurrentTab] = useTabState("currentTab", "attributes");

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
          <Flex>
            <Button
              mr="2"
              variant={showSdkDebug ? "solid" : "outline"}
              // TODO: extend coloring/styling to other error and warning states
              color={sdkFound ? undefined : "orange"}
              // TODO: where else do we want a way to return to the main tabs
              onClick={() => setShowSdkDebug(!showSdkDebug)}
            >
              SDK
            </Button>
            <Dialog.Root
              open={settingsOpen}
              onOpenChange={(o) => setSettingsOpen(o)}
            >
              <Dialog.Trigger>
                <Button>
                  <div className="px-4">
                    <PiGearSix size={20} />
                  </div>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content className="ModalBody">
                <Dialog.Title>Settings</Dialog.Title>
                <SettingsForm close={() => setSettingsOpen(false)} />
                <Dialog.Close
                  style={{ position: "absolute", top: 5, right: 5 }}
                >
                  <IconButton
                    color="gray"
                    highContrast
                    size="1"
                    variant="outline"
                    radius="full"
                  >
                    <PiX size={20} />
                  </IconButton>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Root>
          </Flex>
        </Flex>

        {showSdkDebug ? (
          <SdkTab />
        ) : (
          <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
            <Tabs.List>
              <Tabs.Trigger value="attributes">User Attributes</Tabs.Trigger>
              <Tabs.Trigger value="features">Features</Tabs.Trigger>
              <Tabs.Trigger value="experiments">Experiments</Tabs.Trigger>
              <Tabs.Trigger value="logs">Event Logs</Tabs.Trigger>
            </Tabs.List>
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
        )}
      </div>
    </Theme>
  );
};
