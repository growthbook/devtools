import React, { CSSProperties, FC } from "react";

const VisualEditorPane: FC<{
  children: React.ReactNode;
  style: CSSProperties;
}> = ({ children, style }) => (
  <div
    className="rounded-xl shadow-xl z-max w-80 cursor-default exp-creator bg-slate-800"
    style={style}
  >
    <div
      className="overflow-y-auto"
      style={{
        maxHeight: "90vh",
      }}
    >
      {children}
    </div>
  </div>
);

export default VisualEditorPane;
