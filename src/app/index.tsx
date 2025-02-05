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
import logo from "./logo.svg";
import useTabState from "@/app/hooks/useTabState";
import SdkTab from "./components/SdkTab";
import AttributesTab from "./components/AttributesTab";
import ExperimentsTab from "./components/ExperimentsTab";
import FeaturesTab from "./components/FeaturesTab";
import LogsTab from "./components/LogsTab";
import SettingsForm from "@/app/components/Settings";
import {PiX, PiGearSix, PiUserBold, PiFlagBold, PiFlaskBold, PiListChecksBold} from "react-icons/pi";

export const App = () => {
  const [showSdkDebug, setShowSdkDebug] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined,
  );
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
  return (
    <Theme
      accentColor="violet"
      hasBackground={false}
      style={{ minHeight: "unset" }}
    >
      <div id="main">
        <div
          className="shadow-sm fixed top-0 px-3 pt-2 w-full bg-zinc-50 z-front"
        >
          <Flex justify="between">
            <h1 className="text-lg">
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

          {!showSdkDebug && (
            <Tabs.Root
              value={currentTab}
              onValueChange={setCurrentTab}
              className="-mx-4"
            >
              <Tabs.List>
                <div className="flex items-end mx-auto w-[930px]">
                  <div className="mx-2" />
                  <Tabs.Trigger value="attributes">
                    <PiUserBold className="mr-1" />
                    Attributes
                  </Tabs.Trigger>
                  <Tabs.Trigger value="features">
                    <PiFlagBold className="mr-1" />
                    Features
                  </Tabs.Trigger>
                  <Tabs.Trigger value="experiments">
                    <PiFlaskBold className="mr-1" />
                    Experiments
                  </Tabs.Trigger>
                  <Tabs.Trigger value="logs">
                    <PiListChecksBold className="mr-1" />
                    Event Logs
                  </Tabs.Trigger>
                  <div className="mx-2" />
                </div>
              </Tabs.List>
            </Tabs.Root>
          )}
        </div>

        <div className="mt-[95px] mx-3">
          {showSdkDebug ? (
            <SdkTab />
          ) : currentTab === "attributes" ? (
            <AttributesTab />
          ) : currentTab === "features" ? (
            <FeaturesTab />
          ) : currentTab === "experiments" ? (
            <ExperimentsTab />
          ) : currentTab === "logs" ? (
            <LogsTab />
          ) : null}
        </div>
      </div>
    </Theme>
  );
};
