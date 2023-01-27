import React, { FC, SetStateAction, useEffect, useState } from "react";
import {
  RxCursorArrow,
  RxSection,
  RxGlobe,
  RxKeyboard,
  RxCamera,
} from "react-icons/rx";
import clsx from "clsx";
import GripHandle from "./GripHandle";

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
  // x, y position of floating toolbar
  const [x, setX] = useState(24); // pixels
  const [y, setY] = useState(24); // pixels

  return (
    <div
      className="fixed bg-slate-300 rounded rounded-l-lg shadow-xl z-max"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div className="flex flex-row">
        <GripHandle x={x} y={y} setX={setX} setY={setY} />

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
