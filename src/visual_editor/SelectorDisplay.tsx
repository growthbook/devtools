import React, { FC } from "react";
import useFloatingAnchor from "./lib/hooks/useFloatingAnchor";

const SelectorDisplay: FC<{ selector: string | null }> = ({ selector }) => {
  const parentElement = selector ? document.querySelector(selector) : null;
  const domRect = useFloatingAnchor(parentElement);

  if (!domRect) return null;

  return (
    <div
      className="gb-fixed gb-p-2 gb-bg-indigo-800 gb-text-white gb-text-xs gb-z-front"
      style={{ top: domRect.bottom + 8, left: domRect.left }}
    >
      {selector}
    </div>
  );
};

export default SelectorDisplay;
