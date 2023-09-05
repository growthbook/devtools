import React, { FC } from "react";
import {
  RxCursorArrow,
  RxCamera,
  RxListBullet,
  RxPencil1,
} from "react-icons/rx";
import clsx from "clsx";
import { IconType } from "react-icons";
import { BsFiletypeCss } from "react-icons/bs";
import { IoLogoJavascript } from "react-icons/io";

export type ToolbarMode =
  | "interactive"
  | "selection"
  | "js"
  | "css"
  | "screenshot"
  | "changes";

const modeToIcon: Record<ToolbarMode, IconType | FC<{}>> = {
  interactive: RxCursorArrow,
  selection: RxPencil1,
  js: IoLogoJavascript,
  css: BsFiletypeCss,
  screenshot: RxCamera,
  changes: RxListBullet,
};

const ToolbarButton = ({
  disabled,
  mode,
  activate,
  deactivate = () => {},
  isActive,
  title,
}: {
  disabled: boolean;
  mode: ToolbarMode;
  activate: () => void;
  deactivate?: () => void;
  isActive: boolean;
  title: string;
}) => {
  const Icon = modeToIcon[mode];
  return (
    <button
      title={title}
      className={clsx(
        "gb-flex-1 gb-p-4 gb-h-full gb-flex gb-justify-center gb-text-white",
        {
          "hover:gb-bg-slate-600/75": !disabled,
          "gb-bg-slate-700": !disabled && isActive,
          "gb-cursor-not-allowed": disabled,
        }
      )}
      onClick={disabled ? () => {} : isActive ? deactivate : activate}
    >
      <Icon />
    </button>
  );
};

const Toolbar: FC<{
  disabled: boolean;
  mode: ToolbarMode | null;
  setMode: (mode: ToolbarMode) => void;
  clearSelectedElement: () => void;
}> = ({ disabled, mode, setMode, clearSelectedElement }) => {
  return (
    <div className="gb-z-max gb-shadow-xl">
      <div className="gb-flex gb-flex-row">
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "interactive"}
          mode="interactive"
          activate={() => setMode("interactive")}
          title="Interactive mode"
        />
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "selection"}
          mode="selection"
          activate={() => {
            setMode("selection");
          }}
          deactivate={() => {
            clearSelectedElement();
          }}
          title="Selection mode"
        />
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "js"}
          mode="js"
          activate={() => setMode("js")}
          title="Custom JS mode"
        />
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "css"}
          mode="css"
          activate={() => setMode("css")}
          title="Global CSS mode"
        />
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "changes"}
          mode="changes"
          activate={() => setMode("changes")}
          title="All Changes"
        />
        {/*
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "screenshot"}
          mode="screenshot"
          activate={() => setMode("screenshot")}
          />*/}
      </div>
    </div>
  );
};

export default Toolbar;
