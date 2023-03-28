import React, { FC } from "react";
import {
  RxCursorArrow,
  RxSection,
  RxGlobe,
  RxKeyboard,
  RxCamera,
  RxListBullet,
} from "react-icons/rx";
import clsx from "clsx";
import { IconType } from "react-icons";

export type ToolbarMode =
  | "normal"
  | "selection"
  | "css"
  | "mutation"
  | "screenshot"
  | "changes";

const modeToIcon: Record<ToolbarMode, IconType> = {
  normal: RxCursorArrow,
  selection: RxSection,
  css: RxGlobe,
  mutation: RxKeyboard,
  screenshot: RxCamera,
  changes: RxListBullet,
};

const ToolbarButton = ({
  mode,
  enable,
  isActive,
  title,
}: {
  mode: ToolbarMode;
  enable: () => void;
  isActive: boolean;
  title: string;
}) => {
  const Icon = modeToIcon[mode];
  return (
    <button
      title={title}
      className={clsx(
        "flex-1 p-4 h-full hover:bg-slate-600/75 flex justify-center text-white",
        {
          "bg-slate-700": isActive,
        }
      )}
      onClick={enable}
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
    <div className="z-max shadow-xl">
      <div className="flex flex-row">
        <ToolbarButton
          isActive={mode === "normal"}
          mode="normal"
          enable={() => setMode("normal")}
          title="Normal mode"
        />
        <ToolbarButton
          isActive={mode === "selection"}
          mode="selection"
          enable={() => {
            setMode("selection");
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
          isActive={mode === "mutation"}
          mode="mutation"
          enable={() => setMode("mutation")}
          title="DOM Mutation mode"
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
