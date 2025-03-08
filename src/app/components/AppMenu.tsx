import {DropdownMenu, Flex, IconButton, Tooltip} from "@radix-ui/themes";
import {
  PiBellFill,
  PiCircleFill,
  PiCircleHalfBold,
  PiDotsThreeVerticalBold, PiDownloadSimpleBold, PiGearSixFill, PiLinkBold,
  PiMoonBold,
  PiSunBold
} from "react-icons/pi";
import React from "react";
import {Theme} from "@/app";

export function AppMenu({
  apiKeyReady,
  apiKey,
  theme,
  setTheme,
  setSettingsOpen,
  setShareOpen,
  setImportOpen,
}: {
  apiKeyReady: boolean,
  apiKey: string,
  theme: "system" | "light" | "dark",
  setTheme: (t: Theme) => void;
  setSettingsOpen: (b: boolean) => void;
  setShareOpen: (b: boolean) => void;
  setImportOpen: (b: boolean) => void;
}) {
  return <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {apiKeyReady && !apiKey ? (
        <div>
          <Tooltip content="Enter an Access Token for improved functionality">
            <IconButton className="relative" variant="outline" radius="small" size="1">
              <PiCircleFill
                size={11}
                className="absolute text-red-600 bg-surface rounded-full border border-surface"
                style={{right: -4, top: -4}}
              />
              <PiDotsThreeVerticalBold />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <IconButton variant="outline" radius="small" size="1">
          <PiDotsThreeVerticalBold/>
        </IconButton>
      )}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content variant="soft">
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>
          {theme === "system" ? (
            <PiCircleHalfBold/>
          ) : theme === "dark" ? (
            <PiMoonBold/>
          ) : (
            <PiSunBold/>
          )}
          Theme
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          <DropdownMenu.Item onSelect={() => setTheme("system")}>
            <PiCircleHalfBold/>
            System default
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setTheme("light")}>
            <PiSunBold/>
            Light
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setTheme("dark")}>
            <PiMoonBold/>
            Dark
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
      <DropdownMenu.Item onSelect={() => setShareOpen(true)}>
        <PiLinkBold />
        Share...
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => setImportOpen(true)}>
        <PiDownloadSimpleBold />
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
              <PiBellFill/>
            </div>
          </Tooltip>
        ) : null}
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>;
}
