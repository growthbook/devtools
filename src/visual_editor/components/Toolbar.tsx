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
import { BiBug } from "react-icons/bi";

export type VisualEditorMode =
  | "interactive"
  | "edit"
  | "js"
  | "css"
  | "screenshot"
  | "changes"
  | "debug";

const modeToIcon: Record<VisualEditorMode, IconType | FC<{}>> = {
  interactive: RxCursorArrow,
  edit: RxPencil1,
  js: IoLogoJavascript,
  css: BsFiletypeCss,
  screenshot: RxCamera,
  changes: RxListBullet,
  debug: BiBug,
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
  mode: VisualEditorMode;
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
        "flex-1 p-4 h-full flex justify-center text-white",
        {
          "hover:bg-slate-600/75": !disabled,
          "bg-slate-700": !disabled && isActive,
          "cursor-not-allowed": disabled,
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
  mode: VisualEditorMode | null;
  setMode: (mode: VisualEditorMode) => void;
  clearSelectedElement: () => void;
}> = ({ disabled, mode, setMode, clearSelectedElement }) => {
  return (
    <div className="z-max shadow-xl">
      <div className="flex flex-row">
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "interactive"}
          mode="interactive"
          activate={() => setMode("interactive")}
          title="Interactive mode"
        />
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "edit"}
          mode="edit"
          activate={() => {
            setMode("edit");
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
        <ToolbarButton
          disabled={disabled}
          isActive={mode === "debug"}
          mode="debug"
          activate={() => setMode("debug")}
          title="Debug mode"
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
