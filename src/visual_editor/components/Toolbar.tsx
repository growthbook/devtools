import React, { FC } from "react";
import {
  RxCursorArrow,
  RxCamera,
  RxListBullet,
  RxPencil1,
} from "react-icons/rx";
import { MdMoveUp } from "react-icons/md";
import clsx from "clsx";
import { IconType } from "react-icons";
import { BsFiletypeCss } from "react-icons/bs";
import { IoLogoJavascript } from "react-icons/io";

export type VisualEditorMode =
  | "interactive"
  | "edit"
  | "js"
  | "css"
  | "screenshot"
  | "changes"
  | "rearrange"
  | "edit-innerHtml";

const modeToIcon: Partial<Record<VisualEditorMode, IconType | FC<{}>>> = {
  interactive: RxCursorArrow,
  edit: RxPencil1,
  js: IoLogoJavascript,
  css: BsFiletypeCss,
  screenshot: RxCamera,
  changes: RxListBullet,
  rearrange: MdMoveUp,
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
  if (!Icon) return null;
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
  mode: VisualEditorMode | null;
  setMode: (mode: VisualEditorMode) => void;
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
