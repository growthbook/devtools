import React, { FC } from "react";

const GlobalCSSEditor: FC<{
  css?: string;
  setCss: (css: string) => void;
}> = ({ css = "", setCss }) => {
  return (
    <div className="px-4 pb-4">
      <textarea
        className="w-full h-64 rounded p-2"
        placeholder="Enter CSS here"
        value={css}
        onChange={(e) => setCss(e.currentTarget.value)}
      />
    </div>
  );
};

export default GlobalCSSEditor;
