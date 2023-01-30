import React, { FC, useState } from "react";

const GlobalCSSEditor: FC<{
  appendDomMutation: (domMutation: any) => void;
}> = ({ appendDomMutation }) => {
  const [x, setX] = useState(24);
  const [y, setY] = useState(24);
  const [css, setCss] = useState("");

  const appendCSS = () => {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    appendDomMutation({
      type: "css",
    });
  };

  return (
    <div
      className="fixed bg-slate-300 rounded-lg shadow-xl z-max p-4 w-96"
      style={{ bottom: `${y}px`, left: `${x}px` }}
    >
      <div className="text-xl font-semibold mb-2">Global CSS</div>
      <div>
        <textarea
          className="w-full h-64 rounded p-2"
          placeholder="Enter CSS here"
          value={css}
          onChange={(e) => setCss(e.target.value)}
        />
      </div>
      <div>
        <button
          className="bg-slate-500 text-white rounded-lg px-2 py-1 mt-2"
          onClick={() => appendCSS()}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default GlobalCSSEditor;
