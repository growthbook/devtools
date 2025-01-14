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
      className="fixed px-2 py-1 text-white bg-indigo-800 text-xs z-front cursor-pointer font-semibold"
      style={{
        top: domRect.top - (26 + 8),
        left: domRect.left + domRect.width - 44.47,
      }}
      onClick={undo}
    >
      undo
    </div>
  );
}
