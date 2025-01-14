import React, { FC, useEffect, useState } from "react";

const GlobalCSSEditor: FC<{
  css?: string;
  onSubmit: (css: string) => void;
}> = ({ css: incomingCss = "", onSubmit }) => {
  const [css, setCss] = useState(incomingCss);

  useEffect(() => {
    if (css !== incomingCss) onSubmit(css);
  }, [css]);

  useEffect(() => {
    if (incomingCss !== css) setCss(incomingCss);
  }, [incomingCss]);

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
