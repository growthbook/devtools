import React, { FC } from "react";

const GlobalCSSEditor: FC<{
  css?: string;
  setCss: (css: string) => void;
}> = ({ css = "", setCss }) => {
  return (
    <div className="bg-slate-300 rounded-lg shadow-xl z-max w-96">
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
    </div>
  );
};

export default GlobalCSSEditor;
