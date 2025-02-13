import "@/app/css/index.css";
import {
  Theme,
  Flex,
  Button,
  IconButton,
  Dialog,
  Tabs,
} from "@radix-ui/themes";
import React, { Attributes, useEffect, useState } from "react";
import logo from "./logo.svg";
import useTabState from "@/app/hooks/useTabState";
import SdkTab from "./components/SdkTab";
import AttributesTab from "./components/AttributesTab";
import ExperimentsTab from "./components/ExperimentsTab";
import FeaturesTab from "./components/FeaturesTab";
import LogsTab from "./components/LogsTab";
import SettingsForm from "@/app/components/Settings";
import useSdkData from "@/app/hooks/useSdkData";
import {PiX, PiCircleFill, PiGearSix, PiExclamationMarkBold} from "react-icons/pi";
import clsx from "clsx";

export const MW = 1200; // max-width
export const NAV_H = 80;

export const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined
  );
  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {}
  );
  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const [forcedAttributes, _setForcedAttributes] = useTabState<Attributes>(
    "forcedAttributes",
    {}
  );
  const { canConnect, hasPayload } = useSdkData();
  let sdkStatus = canConnect ? "green" : hasPayload ? "yellow" : "red";
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
          className={`shadow-sm px-3 pt-2 w-full relative bg-white z-front`}
          style={{ height: NAV_H }}
        >
          <Flex justify="between" className="mx-auto" style={{ maxWidth: MW }}>
            <h1 className="text-lg">
              <img
                src={logo}
                alt="GrowthBook"
                className="w-[140px] inline-block mb-1 mr-2"
              />
              <span className="font-bold text-slate-11">DevTools</span>
            </h1>
            <Flex>
              <Dialog.Root
                open={settingsOpen}
                onOpenChange={(o) => setSettingsOpen(o)}
              >
                <Dialog.Trigger>
                  <Button
                    variant="ghost"
                    size="2"
                    style={{ margin: "0 -6px 0 0" }}
                  >
                    <div className="px-1">
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
          <Tabs.Root
            value={currentTab}
            onValueChange={setCurrentTab}
            className="-mx-4 my-[-2px]"
          >
            <Tabs.List>
              <div
                className="flex items-end mx-auto w-full"
                style={{ maxWidth: MW }}
              >
                <div className="mx-2" />
                <Tabs.Trigger value="features">
                  <span>Features</span>
                  {Object.keys(forcedFeatures).length ? (
                    <div
                      className="inline-flex items-center justify-center text-xs font-semibold text-amber-700 bg-amber-200 rounded-full ml-1"
                      style={{ minWidth: 20, height: 20 }}
                    >
                      {Object.keys(forcedFeatures).length}
                    </div>
                  ) : null}
                </Tabs.Trigger>
                <Tabs.Trigger value="experiments">
                  <span>Experiments</span>
                  {Object.keys(forcedVariations).length ? (
                    <div
                      className="inline-flex items-center justify-center text-xs font-semibold text-amber-700 bg-amber-200 rounded-full ml-1"
                      style={{ minWidth: 20, height: 20 }}
                    >
                      {Object.keys(forcedVariations).length}
                    </div>
                  ) : null}
                </Tabs.Trigger>
                <Tabs.Trigger value="attributes">
                  <span> Attributes</span>
                  {forcedAttributes? (
                    <div
                      className="inline-flex items-center justify-center text-xs font-semibold text-amber-700 bg-amber-200 rounded-full ml-1"
                      style={{ minWidth: 20, height: 20 }}
                    >
                      <PiExclamationMarkBold />
                    </div>
                  ) : null}
                </Tabs.Trigger>
                <Tabs.Trigger value="logs">Event Logs</Tabs.Trigger>
                <Tabs.Trigger value="sdkDebug">
                  <div
                    className={clsx("inline-block mr-1", {
                      "text-emerald-500": sdkStatus === "green",
                      "text-amber-500": sdkStatus === "yellow",
                      "text-red-500": sdkStatus === "red",
                    })}
                  >
                    <PiCircleFill size={12} />
                  </div>
                  SDK
                </Tabs.Trigger>
                <div className="mx-2" />
              </div>
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div
          className={"overflow-y-auto"}
          style={{ height: `calc(100vh - ${NAV_H}px)` }}
        >
          {currentTab === "attributes" ? (
            <AttributesTab />
          ) : currentTab === "features" ? (
            <FeaturesTab />
          ) : currentTab === "experiments" ? (
            <ExperimentsTab />
          ) : currentTab === "logs" ? (
            <LogsTab />
          ) : currentTab === "sdkDebug" ? (
            <SdkTab />
          ) : null}
        </div>
      </div>
    </Theme>
  );
};
