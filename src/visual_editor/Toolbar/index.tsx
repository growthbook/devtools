import React, { FC } from "react";
import {
  RxCursorArrow,
  RxKeyboard,
  RxCamera,
  RxListBullet,
  RxPencil1,
} from "react-icons/rx";
import clsx from "clsx";
import { IconType } from "react-icons";
import { BsFiletypeCss } from "react-icons/bs";

export type ToolbarMode =
  | "interactive"
  | "selection"
  | "css"
  | "screenshot"
  | "changes";

const modeToIcon: Record<ToolbarMode, IconType | FC<{}>> = {
  interactive: RxCursorArrow,
  selection: RxPencil1,
  css: BsFiletypeCss,
  screenshot: RxCamera,
  changes: RxListBullet,
};

const ToolbarButton = ({
  mode,
  enable,
  disable = () => {},
  isActive,
  title,
}: {
  mode: ToolbarMode;
  enable: () => void;
  disable?: () => void;
  isActive: boolean;
  title: string;
}) => {
  const Icon = modeToIcon[mode];
  return (
    <button
      title={title}
      className={clsx(
        "gb-flex-1 gb-p-4 gb-h-full hover:gb-bg-slate-600/75 flex gb-justify-center gb-text-white",
        {
          "gb-bg-slate-700": isActive,
        }
      )}
      onClick={isActive ? disable : enable}
    >
      <Icon />
    </button>
  );
};

const Toolbar: FC<{
  mode: ToolbarMode;
  setMode: (mode: ToolbarMode) => void;
  clearSelectedElement: () => void;
}> = ({ mode, setMode, clearSelectedElement }) => {
  return (
    <div className="gb-z-max gb-shadow-xl">
      <div className="gb-flex gb-flex-row">
        <ToolbarButton
          isActive={mode === "interactive"}
          mode="interactive"
          enable={() => setMode("interactive")}
          title="Interactive mode"
        />
        <ToolbarButton
          isActive={mode === "selection"}
          mode="selection"
          enable={() => {
            setMode("selection");
          }}
          disable={() => {
            clearSelectedElement();
          }}
          title="Selection mode"
        />
        <ToolbarButton
          isActive={mode === "css"}
          mode="css"
          enable={() => setMode("css")}
          title="Global CSS mode"
        />
        <ToolbarButton
          isActive={mode === "changes"}
          mode="changes"
          enable={() => setMode("changes")}
          title="All Changes"
        />
        {/*
        <ToolbarButton
          isActive={mode === "screenshot"}
          mode="screenshot"
          enable={() => setMode("screenshot")}
          />*/}
      </div>
    </div>
  );
};

export default Toolbar;
