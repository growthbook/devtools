import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";

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
    className={clsx("gb-fixed", "gb-z-front", "gb-bg-white/75")}
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
}) => (
  <div
    className={clsx("gb-fixed", "gb-z-front", "gb-border-indigo-600", {
      "gb-border-t": position === "top" || position === "bottom",
      "gb-border-l": position === "right" || position === "left",
    })}
    style={edgeStyles(domRect)[position]}
  ></div>
);

const FloatingFrame: FC<{
  parentElement: Element | null;
  clearSelectedElement?: () => void;
}> = ({ parentElement, clearSelectedElement }) => {
  let _rafId: number;
  let _lastTime: number = 0;

  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const rect = parentElement?.getBoundingClientRect();
      setDomRect(rect ?? null);
    };

    // for dom animations that run continuously
    // this reframes our frame at 60fps
    const animate = (time: DOMHighResTimeStamp) => {
      if (time - _lastTime > 1000 / 60) {
        onScroll();
        _lastTime = time;
      }
      _rafId = requestAnimationFrame(animate);
    };

    if (!parentElement && domRect) {
      setDomRect(null);
    }

    if (parentElement) {
      // initialize
      onScroll();
      window.addEventListener("scroll", onScroll);
      _rafId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(_rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [parentElement]);

  if (!domRect) return null;

  return (
    <>
      <FloatingFrameEdge domRect={domRect} position="top" />
      <FloatingFrameEdge domRect={domRect} position="right" />
      <FloatingFrameEdge domRect={domRect} position="bottom" />
      <FloatingFrameEdge domRect={domRect} position="left" />

      {clearSelectedElement ? (
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
