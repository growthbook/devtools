import React from "react";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";

export default function FloatingUndoButton({
  parentElement,
  undo,
}: {
  parentElement: HTMLElement;
  undo: () => void;
}) {
  const domRect = useFloatingAnchor(parentElement);
  if (!domRect) return null;
  if (!parentElement) return null;
  return (
    <div
      className="gb-fixed gb-px-2 gb-py-1 gb-text-indigo-800 gb-bg-white gb-text-xs gb-z-front gb-cursor-pointer gb-font-semibold"
      style={{
        top: domRect.bottom + 8,
        left: domRect.left + domRect.width - 44.47,
      }}
      onClick={undo}
    >
      undo
    </div>
  );
}
