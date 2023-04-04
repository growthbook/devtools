import React, { FC } from "react";
import {
  RxCursorArrow,
  RxGlobe,
  RxKeyboard,
  RxCamera,
  RxListBullet,
  RxPencil1,
} from "react-icons/rx";
import clsx from "clsx";
import { IconType } from "react-icons";

export type ToolbarMode =
  | "interactive"
  | "selection"
  | "css"
  | "mutation"
  | "screenshot"
  | "changes";

const modeToIcon: Record<ToolbarMode, IconType> = {
  interactive: RxCursorArrow,
  selection: RxPencil1,
  css: RxGlobe,
  mutation: RxKeyboard,
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
        "flex-1 p-4 h-full hover:bg-slate-600/75 flex justify-center text-white",
        {
          "bg-slate-700": isActive,
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
    <div className="z-max shadow-xl">
      <div className="flex flex-row">
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
