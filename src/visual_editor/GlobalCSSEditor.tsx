import React, { FC, useState } from "react";
import GripHandle from "./GripHandle";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";

const GlobalCSSEditor: FC<{
  css?: string;
  setCss: (css: string) => void;
}> = ({ css = "", setCss }) => {
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    bottomAligned: true,
  });
  return (
    <div
      className="bg-slate-300 rounded-lg shadow-xl z-max w-96"
      style={parentStyles}
    >
      <div className="p-4">
        <div className="text-xl font-semibold mb-2">Global CSS</div>
        <div>
          <textarea
            className="w-full h-64 rounded p-2"
            placeholder="Enter CSS here"
            value={css}
            onChange={(e) => setCss(e.currentTarget.value)}
          />
        </div>
      </div>
      <GripHandle
        reverseY
        className="bg-slate-300 h-5 w-full rounded-b-xl"
        x={x}
        y={y}
        setX={setX}
        setY={setY}
      />
    </div>
  );
};

export default GlobalCSSEditor;
