import { Button, DropdownMenu, Flex, Tooltip } from "@radix-ui/themes";
import {
  PiArrowSquareInBold,
  PiBellFill,
  PiCircleFill,
  PiCircleHalfBold,
  PiGearSixFill,
  PiList,
  PiMoonBold,
  PiShareBold,
  PiSunBold,
} from "react-icons/pi";
import React from "react";
import { Theme } from "@/app";

export function AppMenu({
  apiKeyReady,
  apiKey,
  theme,
  setTheme,
  setSettingsOpen,
  setShareOpen,
  setImportExportOpen,
}: {
  apiKeyReady: boolean;
  apiKey: string;
  theme: "system" | "light" | "dark";
  setTheme: (t: Theme) => void;
  setSettingsOpen: (b: boolean) => void;
  setShareOpen: (b: boolean) => void;
  setImportExportOpen: (b: boolean) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {apiKeyReady && !apiKey ? (
          <div>
            <Tooltip content="Enter an Access Token for improved functionality">
              <Button
                variant="ghost"
                radius="small"
                size="2"
                style={{ marginRight: 0 }}
              >
                <div className="relative mr-1">
                  <PiCircleFill
                    size={11}
                    className="absolute text-red-600 bg-surface rounded-full border border-surface"
                    style={{ right: -4, top: -4 }}
                  />
                  <PiList size={18} />
                </div>
                Menu
              </Button>
            </Tooltip>
          </div>
        ) : (
          <Button
            variant="ghost"
            radius="small"
            size="2"
            style={{ marginRight: 0 }}
          >
            <PiList size={18} className="mr-1" />
            Menu
          </Button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            {theme === "system" ? (
              <PiCircleHalfBold />
            ) : theme === "dark" ? (
              <PiMoonBold />
            ) : (
              <PiSunBold />
            )}
            Theme
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onSelect={() => setTheme("system")}>
              <PiCircleHalfBold />
              System default
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setTheme("light")}>
              <PiSunBold />
              Light
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setTheme("dark")}>
              <PiMoonBold />
              Dark
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item onSelect={() => setShareOpen(true)}>
          <PiShareBold />
          Share...
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => setImportExportOpen(true)}>
          <PiArrowSquareInBold />
          Import / Export
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          className="flex justify-between items-center"
          onSelect={() => setSettingsOpen(true)}
        >
          <Flex gap="2" align="center">
            <PiGearSixFill />
            Settings
          </Flex>
          {apiKeyReady && !apiKey ? (
            <Tooltip content="Enter an Access Token for improved functionality">
              <div className="p-1 text-red-600">
                <PiBellFill />
              </div>
            </Tooltip>
          ) : null}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
