import React, { FC, useState } from "react";
import {
  RxCursorArrow,
  RxSection,
  RxGlobe,
  RxKeyboard,
  RxCamera,
} from "react-icons/rx";
import clsx from "clsx";

type ToolbarMode = "normal" | "selection" | "css" | "mutation" | "screenshot";

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
      className={clsx("flex-1 p-4 h-full", { "bg-slate-200": isActive })}
      onClick={enable}
    >
      <Icon />
    </button>
  );
};

const Toolbar: FC<{}> = () => {
  const [mode, setMode] = useState<ToolbarMode>("normal");
  return (
    <div className="fixed top-6 left-6 bg-slate-300 rounded shadow-xl">
      <div className="flex flex-row">
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
