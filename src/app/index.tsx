import "@/app/css/index.css";
import {
  Dialog,
  IconButton,
  Select,
  Tabs,
  Theme,
  Tooltip,
} from "@radix-ui/themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import logo from "./logo.svg";
import logoWhite from "./logo-white.svg";
import useTabState from "@/app/hooks/useTabState";
import SdkTab, { getSdkStatus } from "./components/SdkTab";
import AttributesTab from "./components/AttributesTab";
import ExperimentsTab from "./components/ExperimentsTab";
import FeaturesTab from "./components/FeaturesTab";
import LogsTab from "./components/LogsTab";
import SettingsForm, { API_KEY } from "@/app/components/Settings";
import useSdkData from "@/app/hooks/useSdkData";
import {
  PiCircleFill,
  PiWarningFill,
  PiWarningOctagonFill,
  PiX,
} from "react-icons/pi";
import ArchetypesList from "@/app/components/ArchetypesList";
import useGlobalState from "@/app/hooks/useGlobalState";
import ConditionalWrapper from "@/app/components/ConditionalWrapper";
import { useResponsiveContext } from "./hooks/useResponsive";
import { Archetype } from "@/app/gbTypes";
import { Attributes } from "@growthbook/growthbook";
import { AppMenu } from "@/app/components/AppMenu";
import Share from "@/app/components/Share";
import ImportExport from "@/app/components/ImportExport";

export const MW = 1200; // max-width
export const RESPONSIVE_W = 570; // small width mode
export const TINY_W = 420;
export const NAV_H = 75;

export type Theme = "system" | "light" | "dark";
export function isDark(theme: Theme): boolean {
  return theme === "system"
    ? (window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false)
    : theme === "dark";
}

export const App = () => {
  const [currentTab, setCurrentTab] = useTabState("currentTab", "features");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);

  const { isResponsive, isTiny } = useResponsiveContext();
  const [theme, setTheme, themeReady] = useGlobalState<Theme>(
    "theme",
    "system",
    true,
  );
  const dark = useMemo(() => {
    return isDark(theme);
  }, [theme, themeReady]);

  const [apiKey, setApiKey, apiKeyReady] = useGlobalState(API_KEY, "", true);

  const [sdkFound, setSdkFound] = useTabState<boolean | undefined>(
    "sdkFound",
    undefined,
  );
  const [forcedFeatures, setForcedFeatures] = useTabState<Record<string, any>>(
    "forcedFeatures",
    {},
  );
  const [forcedVariations, setForcedVariations] = useTabState<
    Record<string, any>
  >("forcedVariations", {});

  const [overriddenAttributes, setOverriddenAttributes] =
    useTabState<Attributes>("overriddenAttributes", {});

  const sdkData = useSdkData();
  let sdkStatus = getSdkStatus(sdkData);

  const sdkDataRef = useRef(sdkData);
  useEffect(() => {
    sdkDataRef.current = sdkData;
  }, [sdkData]);

  useEffect(() => {
    window.setTimeout(() => {
      if (!sdkDataRef.current.sdkFound) setCurrentTab("sdkDebug");
    }, 800);
  }, []);

  return (
    <Theme
      accentColor="violet"
      grayColor="slate"
      hasBackground={false}
      style={{ minHeight: "unset" }}
      appearance={dark ? "dark" : "light"}
      className={dark ? "dark" : "light"}
    >
      <div id="main" className="text-indigo-12 overflow-hidden">
        <div
          className="shadow-sm px-3 pt-1 w-full relative bg-surface z-front"
          style={{ height: NAV_H }}
        >
          <div
            className="flex justify-between w-full mx-auto"
            style={{ maxWidth: MW - 32, height: 30 }}
          >
            <img
              src={!dark ? logo : logoWhite}
              alt="GrowthBook"
              className="inline-block mb-1 flex-shrink-0 mt-0.5 -mr-2"
              style={{ width: 120 }}
            />
            <div className="mt-0.5">
              <ArchetypesList />
            </div>
          </div>
          {!isResponsive ? (
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
                    <NavLabel type="features" forcedFeatures={forcedFeatures} />
                  </Tabs.Trigger>
                  <Tabs.Trigger value="experiments">
                    <NavLabel
                      type="experiments"
                      forcedVariations={forcedVariations}
                    />
                  </Tabs.Trigger>
                  <Tabs.Trigger value="attributes">
                    <NavLabel
                      type="attributes"
                      overriddenAttributes={overriddenAttributes}
                    />
                  </Tabs.Trigger>
                  <Tabs.Trigger value="logs">
                    <NavLabel type="logs" />
                  </Tabs.Trigger>
                  <Tabs.Trigger value="sdkDebug">
                    <NavLabel type="sdkDebug" sdkStatus={sdkStatus} />
                  </Tabs.Trigger>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 flex-grow-0 flex-shrink-0">
                    <AppMenu
                      apiKeyReady={apiKeyReady}
                      apiKey={apiKey}
                      theme={theme}
                      setTheme={setTheme}
                      setSettingsOpen={setSettingsOpen}
                      setShareOpen={setShareOpen}
                      setImportExportOpen={setImportExportOpen}
                    />
                  </div>
                  <div className="mx-2" />
                </div>
              </Tabs.List>
            </Tabs.Root>
          ) : (
            <div className="flex items-center justify-between">
              <Select.Root value={currentTab} onValueChange={setCurrentTab}>
                <Select.Trigger
                  className="!shadow-none !outline-none hover:bg-gray-a3 rounded-none"
                  style={{ borderBottom: "2px solid var(--violet-a11)" }}
                >
                  <div style={{ width: 100 }}>
                    {currentTab === "features" ? (
                      <NavLabel
                        type="features"
                        forcedFeatures={forcedFeatures}
                        isDropdown
                      />
                    ) : currentTab === "experiments" ? (
                      <NavLabel
                        type="experiments"
                        forcedVariations={forcedVariations}
                        isDropdown
                      />
                    ) : currentTab === "attributes" ? (
                      <NavLabel
                        type="attributes"
                        overriddenAttributes={overriddenAttributes}
                        isDropdown
                      />
                    ) : currentTab === "logs" ? (
                      <NavLabel type="logs" isDropdown />
                    ) : currentTab === "sdkDebug" ? (
                      <NavLabel
                        type="sdkDebug"
                        sdkStatus={sdkStatus}
                        isDropdown
                      />
                    ) : null}
                  </div>
                </Select.Trigger>
                <Select.Content
                  variant="soft"
                  color="gray"
                  position="popper"
                  align="start"
                >
                  <Select.Item value="features">
                    <NavLabel
                      type="features"
                      forcedFeatures={forcedFeatures}
                      isDropdown
                    />
                  </Select.Item>
                  <Select.Item value="experiments">
                    <NavLabel
                      type="experiments"
                      forcedVariations={forcedVariations}
                      isDropdown
                    />
                  </Select.Item>
                  <Select.Item value="attributes">
                    <NavLabel
                      type="attributes"
                      overriddenAttributes={overriddenAttributes}
                      isDropdown
                    />
                  </Select.Item>
                  <Select.Item value="logs">
                    <NavLabel type="logs" isDropdown />
                  </Select.Item>
                  <Select.Item value="sdkDebug">
                    <NavLabel
                      type="sdkDebug"
                      sdkStatus={sdkStatus}
                      isDropdown
                    />
                  </Select.Item>
                </Select.Content>
              </Select.Root>
              <div className="flex items-center gap-2 flex-grow-0 flex-shrink-0">
                <AppMenu
                  apiKeyReady={apiKeyReady}
                  apiKey={apiKey}
                  theme={theme}
                  setTheme={setTheme}
                  setSettingsOpen={setSettingsOpen}
                  setShareOpen={setShareOpen}
                  setImportExportOpen={setImportExportOpen}
                />
              </div>
            </div>
          )}
        </div>

        <div
          id="pageBody"
          className="overflow-y-auto bg-surface"
          style={{ height: `calc(100vh - ${NAV_H}px)` }}
        >
          {currentTab === "features" ? (
            <FeaturesTab />
          ) : currentTab === "experiments" ? (
            <ExperimentsTab />
          ) : currentTab === "attributes" ? (
            <AttributesTab />
          ) : currentTab === "logs" ? (
            <LogsTab />
          ) : currentTab === "sdkDebug" ? (
            <SdkTab />
          ) : null}
        </div>

        <Dialog.Root
          open={settingsOpen}
          onOpenChange={(o) => setSettingsOpen(o)}
        >
          <Dialog.Content className="ModalBody">
            <Dialog.Title>Settings</Dialog.Title>
            <SettingsForm close={() => setSettingsOpen(false)} />
            <Dialog.Close style={{ position: "absolute", top: 5, right: 5 }}>
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

        <Dialog.Root open={shareOpen} onOpenChange={(o) => setShareOpen(o)}>
          <Dialog.Content className="ModalBody">
            <Dialog.Title>Share DevTools State</Dialog.Title>
            <Share close={() => setShareOpen(false)} />
            <Dialog.Close style={{ position: "absolute", top: 5, right: 5 }}>
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

        <Dialog.Root open={importExportOpen} onOpenChange={(o) => setImportExportOpen(o)}>
          <Dialog.Content className="ModalBody">
            <Dialog.Title>Import / Export DevTools State</Dialog.Title>
            <ImportExport close={() => setImportExportOpen(false)} />
            <Dialog.Close style={{ position: "absolute", top: 5, right: 5 }}>
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
      </div>
    </Theme>
  );
};

function NavLabel({
  type,
  isDropdown = false,
  forcedFeatures,
  forcedVariations,
  overriddenAttributes,
  sdkStatus,
}: {
  type: "features" | "experiments" | "attributes" | "logs" | "sdkDebug";
  isDropdown?: boolean;
  forcedFeatures?: Record<string, any>;
  forcedVariations?: Record<string, any>;
  overriddenAttributes?: Record<string, any>;
  sdkStatus?: string;
}) {
  const [selectedArchetype, setSelectedArchetype] =
    useTabState<Archetype | null>("selectedArchetype", null);

  if (type === "features") {
    const count = Object.keys(forcedFeatures || {}).length;
    return (
      <ConditionalWrapper
        condition={isDropdown}
        wrapper={<div className="flex items-center" />}
      >
        <span className={!isDropdown ? (count ? "pr-3" : "px-1.5") : "pr-1"}>
          Features
        </span>
        {count ? (
          <div className={!isDropdown ? "absolute right-0" : undefined}>
            <Tooltip content={`${count} override${count !== 1 ? "s" : ""}`}>
              <div className="p-1">
                <PiCircleFill size={9} className="text-amber-500" />
              </div>
            </Tooltip>
          </div>
        ) : null}
      </ConditionalWrapper>
    );
  }

  if (type === "experiments") {
    const count = Object.keys(forcedVariations || {}).length;
    return (
      <ConditionalWrapper
        condition={isDropdown}
        wrapper={<div className="flex items-center" />}
      >
        <span className={!isDropdown ? (count ? "pr-3" : "px-1.5") : "pr-1"}>
          Experiments
        </span>
        {count ? (
          <div className={!isDropdown ? "absolute right-0" : undefined}>
            <Tooltip content={`${count} override${count !== 1 ? "s" : ""}`}>
              <div className="p-1">
                <PiCircleFill size={9} className="text-amber-500" />
              </div>
            </Tooltip>
          </div>
        ) : null}
      </ConditionalWrapper>
    );
  }

  if (type === "attributes") {
    const count = Object.keys(overriddenAttributes || {}).length;
    return (
      <ConditionalWrapper
        condition={isDropdown}
        wrapper={<div className="flex items-center" />}
      >
        <span
          className={
            !isDropdown
              ? count > 0 && !selectedArchetype
                ? "pr-3"
                : "px-1.5"
              : "pr-1"
          }
        >
          Attributes
        </span>
        {count > 0 && !selectedArchetype ? (
          <div className={!isDropdown ? "absolute right-0" : undefined}>
            <Tooltip content="Has attribute overrides">
              <div className="p-1">
                <PiCircleFill size={9} className="text-amber-500" />
              </div>
            </Tooltip>
          </div>
        ) : null}
      </ConditionalWrapper>
    );
  }

  if (type === "logs") {
    return (
      <ConditionalWrapper
        condition={isDropdown}
        wrapper={<div className="flex items-center" />}
      >
        Event Logs
      </ConditionalWrapper>
    );
  }

  if (type === "sdkDebug") {
    return (
      <ConditionalWrapper
        condition={isDropdown}
        wrapper={<div className="flex items-center" />}
      >
        <span className={!isDropdown ? "pr-3" : "pr-1.5"}>SDK</span>
        <div className={!isDropdown ? "absolute right-0" : undefined}>
          {sdkStatus === "green" && (
            <PiCircleFill size={9} className="text-emerald-500 mr-1" />
          )}
          {sdkStatus === "yellow" && (
            <PiWarningFill className="text-amber-500" />
          )}
          {sdkStatus === "red" && (
            <PiWarningOctagonFill className="text-red-700" />
          )}
        </div>
      </ConditionalWrapper>
    );
  }

  return null;
}
