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
import useSdkData from "@/app/hooks/useSdkData";
import {
  PiX,
  PiGearSix,
  PiUserFill,
  PiFlagFill,
  PiFlaskFill,
  PiListChecksBold,
} from "react-icons/pi";

export const MW = 900; // max-width
export const NAV_H = 80;

export const App = () => {
  const [showSdkDebug, setShowSdkDebug] = useTabState("showSdkDebug", false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined,
  );
  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [features] = useTabState("features", {});
  const [experiments] = useTabState("experiments", []);
  const {canConnect, hasPayload} = useSdkData();
  const sdkStatusColor = canConnect ? "green" : hasPayload ? "orange" : "red"
  const refresh = () => {
    chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
      let activeTab = tabs[0];
      if (activeTab.id) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: "GB_REQUEST_REFRESH",
        });
      }
    });
  };

  useEffect(() => {
    window.setTimeout(() => {
      if (sdkFound === undefined) setSdkFound(false);
    }, 2000);
  }, []);

  return (
    <Theme
      accentColor="violet"
      grayColor="slate"
      hasBackground={false}
      style={{ minHeight: "unset" }}
    >
      <div id="main" className="text-indigo-12 overflow-hidden">
        <div
          className={`shadow-sm px-3 pt-2 w-full relative bg-zinc-50 z-front`}
          style={{ height: NAV_H }}
        >
          <Flex
            justify="between"
            className="mx-auto"
            style={{ maxWidth: MW }}
          >
            <h1 className="text-lg">
              <img
                src={logo}
                alt="GrowthBook"
                className="w-[140px] inline-block mb-1 mr-2"
              />
              <span className="font-bold text-slate-11">DevTools</span>
            </h1>
            <Flex>
              <Button
                mr="2"
                variant={showSdkDebug ? "solid" : "outline"}
                // TODO: where else do we want a way to return to the main tabs
                onClick={() => setShowSdkDebug(!showSdkDebug)}
              >
                <span style={{
                  borderRadius:10,
                  height:10,
                  width:10,
                  backgroundColor: sdkStatusColor
                }}></span>SDK
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
              className="-mx-4 my-[-2px]"
            >
              <Tabs.List>
                <div className="flex items-end mx-auto w-[930px]">
                  <div className="mx-2" />
                  <Tabs.Trigger value="features">
                    <PiFlagFill className="mr-1" />
                    Features
                  </Tabs.Trigger>
                  <Tabs.Trigger value="experiments">
                    <PiFlaskFill className="mr-1" />
                    Experiments
                  </Tabs.Trigger>
                  <Tabs.Trigger value="attributes">
                    <PiUserFill className="mr-1" />
                    Attributes
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

        <div
          className={"overflow-y-auto"}
          style={{ height: `calc(100vh - ${NAV_H}px)` }}
        >
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
