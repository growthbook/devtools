import React, { FC } from "react";
import GripHandle from "./GripHandle";
import useFixedPositioning from "./lib/hooks/useFixedPositioning";

const VisualEditorPane: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { x, y, setX, setY, parentStyles } = useFixedPositioning({
    x: 24,
    y: 24,
    rightAligned: true,
  });
  return (
    <div
      className="rounded-xl shadow-xl z-max w-80 cursor-default exp-creator bg-slate-800"
      style={parentStyles}
    >
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: "90vh",
        }}
      >
        {children}
      </div>
      <GripHandle
        reverseX
        className="h-8"
        x={x}
        y={y}
        setX={setX}
        setY={setY}
      />
    </div>
  );
};

export default VisualEditorPane;
