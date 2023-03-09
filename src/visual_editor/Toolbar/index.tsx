import React, { FC, SetStateAction, useEffect, useState } from "react";
import {
  RxCursorArrow,
  RxSection,
  RxGlobe,
  RxKeyboard,
  RxCamera,
} from "react-icons/rx";
import clsx from "clsx";
import GripHandle from "../GripHandle";
import useFixedPositioning from "../lib/hooks/useFixedPositioning";

export type ToolbarMode =
  | "normal"
  | "selection"
  | "css"
  | "mutation"
  | "screenshot";

const modeToIcon = {
  normal: RxCursorArrow,
  selection: RxSection,
  css: RxGlobe,
  mutation: RxKeyboard,
  screenshot: RxCamera,
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
}> = ({ mode, setMode }) => {
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
          enable={() => setMode("selection")}
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
