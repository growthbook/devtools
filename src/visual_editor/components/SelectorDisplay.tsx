import React, { FC, useMemo } from "react";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";
import getSelector from "../lib/getSelector";
import { SelectorError } from "../lib/hooks/useSelectorErrors";

const SelectorDisplay: FC<{
  parentElement: Element | null;
  onSelectorError?: (error: SelectorError) => void;
}> = ({ parentElement, onSelectorError }) => {
  const domRect = useFloatingAnchor(parentElement, { onSelectorError });

  const selector = useMemo(() => {
    if (!parentElement) return null;
    return getSelector(parentElement, { onError: onSelectorError });
  }, [parentElement, onSelectorError]);

  if (!domRect) return null;
  if (!parentElement) return null;

  return (
    <div
      className="fixed p-2 bg-indigo-800 text-white text-xs z-front"
      style={{ top: domRect.bottom + 8, left: domRect.left }}
    >
      {selector}
    </div>
  );
};

export default SelectorDisplay;
