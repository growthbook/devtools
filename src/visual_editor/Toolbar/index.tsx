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
}: {
  mode: ToolbarMode;
  enable: () => void;
  isActive: boolean;
}) => {
  const Icon = modeToIcon[mode];
  return (
    <button
      className={clsx("flex-1 p-4 h-full hover:bg-slate-100/75", {
        "bg-slate-200": isActive,
      })}
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
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
  });

  return (
    <div
      className="bg-slate-300 rounded rounded-l-lg shadow-xl z-max"
      style={{
        ...parentStyles,
      }}
    >
      <div className="flex flex-row">
        <GripHandle
          className="w-4 bg-slate-300 rounded-l-lg"
          x={x}
          y={y}
          setX={setX}
          setY={setY}
        />

        <ToolbarButton
          isActive={mode === "normal"}
          mode="normal"
          enable={() => setMode("normal")}
        />
        <ToolbarButton
          isActive={mode === "selection"}
          mode="selection"
          enable={() => setMode("selection")}
        />
        <ToolbarButton
          isActive={mode === "css"}
          mode="css"
          enable={() => setMode("css")}
        />
        <ToolbarButton
          isActive={mode === "mutation"}
          mode="mutation"
          enable={() => setMode("mutation")}
        />
        <ToolbarButton
          isActive={mode === "screenshot"}
          mode="screenshot"
          enable={() => setMode("screenshot")}
        />
      </div>
    </div>
  );
};

export default Toolbar;
