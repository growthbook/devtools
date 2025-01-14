import clsx from "clsx";
import React, { FC } from "react";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";

const overlayStyles = (domRect: DOMRect) => ({
  top: {
    top: 0,
    left: 0,
    height: domRect.top,
    width: "100vw",
  },
  right: {
    top: domRect.top,
    left: domRect.left + domRect.width,
    height: domRect.height,
    width: window.innerWidth - domRect.left - domRect.width,
  },
  bottom: {
    top: domRect.top + domRect.height,
    left: 0,
    height: window.innerHeight - domRect.top - domRect.height,
    width: "100vw",
  },
  left: {
    top: domRect.top,
    left: 0,
    height: domRect.height,
    width: domRect.left,
  },
});

const FloatingFrameOverlay = ({
  domRect,
  position,
  clear,
}: {
  domRect: DOMRect;
  position: "top" | "right" | "bottom" | "left";
  clear: () => void;
}) => (
  <div
    className={clsx("fixed", "z-front", "bg-black/25")}
    style={overlayStyles(domRect)[position]}
    onClick={clear}
  ></div>
);

const edgeStyles = (domRect: DOMRect) => ({
  top: {
    top: domRect.top,
    left: domRect.left,
    height: "4px",
    width: domRect.width,
  },
  right: {
    top: domRect.top,
    left: domRect.left + domRect.width,
    height: domRect.height,
    width: "4px",
  },
  bottom: {
    top: domRect.top + domRect.height,
    left: domRect.left,
    height: "4px",
    width: domRect.width + 1,
  },
  left: {
    top: domRect.top,
    left: domRect.left,
    height: domRect.height,
    width: "4px",
  },
});

const FloatingFrameEdge = ({
  domRect,
  position,
}: {
  domRect: DOMRect;
  position: "top" | "right" | "bottom" | "left";
}) => {
  return (
    <div
      className={clsx("fixed", "z-front", "border-indigo-600", {
        "border-t": position === "top" || position === "bottom",
        "border-l": position === "right" || position === "left",
      })}
      style={edgeStyles(domRect)[position]}
    ></div>
  );
};

const FloatingFrame: FC<{
  hideOverlay?: boolean;
  parentElement: Element | null;
  clearSelectedElement?: () => void;
}> = ({ parentElement, clearSelectedElement, hideOverlay }) => {
  const domRect = useFloatingAnchor(parentElement);

  if (!domRect) return null;
  return (
    <>
      <FloatingFrameEdge domRect={domRect} position="top" />
      <FloatingFrameEdge domRect={domRect} position="right" />
      <FloatingFrameEdge domRect={domRect} position="bottom" />
      <FloatingFrameEdge domRect={domRect} position="left" />

      {clearSelectedElement && !hideOverlay ? (
        <>
          <FloatingFrameOverlay
            clear={clearSelectedElement}
            domRect={domRect}
            position="top"
          />
          <FloatingFrameOverlay
            clear={clearSelectedElement}
            domRect={domRect}
            position="right"
          />
          <FloatingFrameOverlay
            clear={clearSelectedElement}
            domRect={domRect}
            position="bottom"
          />
          <FloatingFrameOverlay
            clear={clearSelectedElement}
            domRect={domRect}
            position="left"
          />
        </>
      ) : null}
    </>
  );
};

export default FloatingFrame;
