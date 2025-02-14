import "@/app/css/index.css";
import {
  Theme,
  Flex,
  IconButton,
  Dialog,
  Tabs,
  Tooltip,
} from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import useTabState from "@/app/hooks/useTabState";
import SdkTab from "./components/SdkTab";
import AttributesTab from "./components/AttributesTab";
import ExperimentsTab from "./components/ExperimentsTab";
import FeaturesTab from "./components/FeaturesTab";
import LogsTab from "./components/LogsTab";
import SettingsForm, {API_KEY} from "@/app/components/Settings";
import useSdkData from "@/app/hooks/useSdkData";
import {
  PiX,
  PiCircleFill,
  PiInfoBold,
  PiGearFill, PiWarningCircleBold,
} from "react-icons/pi";
import clsx from "clsx";
import ArchetypesList from "@/app/components/ArchetypesList";
import useGlobalState from "@/app/hooks/useGlobalState";

export const MW = 1200; // max-width
export const NAV_H = 75;

export const App = () => {
  const [apiKey, setApiKey, apiKeyReady] = useGlobalState(API_KEY, "", true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined,
  );
  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );
  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const [forcedAttributes, _setForcedAttributes] = useTabState<boolean>(
    "forcedAttributes",
    false,
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
          className={`shadow-sm px-3 pt-1 w-full relative bg-white z-front`}
          style={{ height: NAV_H }}
        >
          <Flex justify="between" className="mx-auto" style={{ maxWidth: MW, height: 30 }}>
            <h1 className="text-md select-none">
              <img
                src={logo}
                alt="GrowthBook"
                className="w-[120px] inline-block mb-1 mr-2"
              />
              <span className="font-bold text-slate-11">DevTools</span>
            </h1>
            <Flex align="center" gap="4">
              <ArchetypesList />
            </Flex>
          </Flex>
          <Tabs.Root
            value={currentTab}
            onValueChange={setCurrentTab}
            className="-mx-4 mt-[1px]"
          >
            <Tabs.List>
              <div
                className="flex items-center mx-auto w-full"
                style={{ maxWidth: MW }}
              >
                <div className="mx-2" />
                <Tabs.Trigger value="features">
                  Features
                  {Object.keys(forcedFeatures).length ? (
                    <div className="absolute" style={{ top: -8, right: -16 }}>
                      <Tooltip content={`${Object.keys(forcedFeatures).length} override${Object.keys(forcedFeatures).length !== 1 ? "s" : ""}`}>
                        <button className="p-1">
                          <PiInfoBold className="text-amber-600 bg-white rounded-full" />
                        </button>
                      </Tooltip>
                    </div>
                  ) : null}
                </Tabs.Trigger>
                <Tabs.Trigger value="experiments">
                  Experiments
                  {Object.keys(forcedVariations).length ? (
                    <div className="absolute" style={{ top: -8, right: -16 }}>
                    <Tooltip content={`${Object.keys(forcedVariations).length} override${Object.keys(forcedVariations).length !== 1 ? "s" : ""}`}>
                      <button className="p-1">
                        <PiInfoBold className="text-amber-600 bg-white rounded-full" />
                      </button>
                    </Tooltip>
                    </div>
                  ) : null}
                </Tabs.Trigger>
                <Tabs.Trigger value="attributes">
                  Attributes
                  {forcedAttributes? (
                    <div className="absolute" style={{ top: -8, right: -16 }}>
                      <Tooltip content="Has attribute overrides">
                        <button className="p-1">
                          <PiInfoBold className="text-amber-600 bg-white rounded-full" />
                        </button>
                      </Tooltip>
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
                <div className="flex-1" />
                <Dialog.Root
                  open={settingsOpen}
                  onOpenChange={(o) => setSettingsOpen(o)}
                >
                  <Dialog.Trigger>
                    <IconButton
                      className="relative"
                      variant="ghost"
                      color="gray"
                      size="2"
                      style={{ margin: 0 }}
                    >
                      {apiKeyReady && !apiKey ? (
                        <div className="absolute" style={{ top: -4, left: -8 }}>
                          <Tooltip content="Enter an Access Token for improved functionality">
                            <button>
                              <PiWarningCircleBold className="text-pink-700 bg-white rounded-full" />
                            </button>
                          </Tooltip>
                        </div>
                      ): null}
                      <PiGearFill size={18} />
                    </IconButton>
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
                <div className="mx-2" />
              </div>
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div
          id="pageBody"
          className="overflow-y-auto"
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
