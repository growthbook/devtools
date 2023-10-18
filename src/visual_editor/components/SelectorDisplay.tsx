import React, { FC, useMemo } from "react";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";
import getSelector from "../lib/getSelector";

const SelectorDisplay: FC<{
  parentElement: Element | null;
}> = ({ parentElement }) => {
  const domRect = useFloatingAnchor(parentElement);

  const selector = useMemo(() => {
    if (!parentElement) return null;
    return getSelector(parentElement);
  }, [parentElement]);

  if (!domRect) return null;
  if (!parentElement) return null;

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
