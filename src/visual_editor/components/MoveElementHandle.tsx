import React, { forwardRef } from "react";
import { RxMove } from "react-icons/rx";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";

const MoveElementHandle = forwardRef<
  HTMLDivElement,
  { parentElement: HTMLElement; onPointerDown: () => void }
>(function ({ parentElement, onPointerDown }, ref) {
  const domRect = useFloatingAnchor(parentElement);
  if (!domRect) return null;
  if (!parentElement) return null;
  return (
    <div
      ref={ref}
      className="fixed px-2 py-1 text-white bg-indigo-800 text-xs z-front cursor-move font-semibold"
      style={{
        top: domRect.bottom + 8,
        left: domRect.left + domRect.width - 40,
      }}
      onPointerDown={onPointerDown}
    >
      <RxMove className="w-6 h-6" />
    </div>
  );
});

export default MoveElementHandle;
