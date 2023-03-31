import React, { FC, useEffect, useState } from "react";

const GlobalCSSEditor: FC<{
  css?: string;
  onSubmit: (css: string) => void;
}> = ({ css: _css = "", onSubmit }) => {
  const [css, setCss] = useState(_css);

  useEffect(() => onSubmit(css), [css]);

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
