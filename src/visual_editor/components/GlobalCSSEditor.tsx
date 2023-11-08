import React, { FC, useEffect, useState } from "react";

const GlobalCSSEditor: FC<{
  css?: string;
  onSubmit: (css: string) => void;
}> = ({ css: incomingCss = "", onSubmit }) => {
  const [css, setCss] = useState(incomingCss);

  useEffect(() => {
    onSubmit(css);
  }, [css]);

  useEffect(() => {
    setCss(incomingCss);
  }, [incomingCss]);

  return (
    <div className="gb-px-4 gb-pb-4">
      <textarea
        className="gb-w-full gb-h-64 gb-rounded gb-p-2"
        placeholder="Enter CSS here"
        value={css}
        onChange={(e) => setCss(e.currentTarget.value)}
      />
    </div>
  );
};

export default GlobalCSSEditor;
