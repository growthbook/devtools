import React, { forwardRef } from "react";
import { RxMove } from "react-icons/rx";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";

const MoveElementHandle = forwardRef<
  HTMLDivElement,
  { parentElement: HTMLElement, onPointerDown: () => void }
>(function ({ parentElement, onPointerDown}, ref) {
  
  const domRect = useFloatingAnchor(parentElement);
  if (!domRect) return null;
  if (!parentElement) return null;
  return (
    <div
      ref={ref}
      className="gb-fixed gb-px-2 gb-py-1 gb-text-white gb-bg-indigo-800 gb-text-xs gb-z-front gb-cursor-move gb-font-semibold"
      style={{
        top: domRect.bottom + 8,
        left: domRect.left + domRect.width - 40,
      }}
      onPointerDown={onPointerDown}
    >
      <RxMove className="gb-w-6 gb-h-6" />
    </div>
  );
});

export default MoveElementHandle;
