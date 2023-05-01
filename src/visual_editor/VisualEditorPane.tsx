import React, { CSSProperties, FC } from "react";

const VisualEditorPane: FC<{
  children: React.ReactNode;
  style: CSSProperties;
}> = ({ children, style }) => (
  <div
    className="gb-rounded-xl gb-shadow-xl gb-z-max gb-w-80 gb-cursor-default gb-exp-creator gb-bg-slate-800"
    style={style}
  >
    <div
      className="gb-overflow-y-auto"
      style={{
        maxHeight: "90vh",
      }}
    >
      {children}
    </div>
  </div>
);

export default VisualEditorPane;
