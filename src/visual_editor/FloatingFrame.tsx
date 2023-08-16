import clsx from "clsx";
import React, { FC, useEffect, useState } from "react";

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
      gb-highlight-frame="true"
      className={clsx("gb-fixed", "gb-z-max", "gb-border-indigo-600", {
        "gb-border-t": position === "top" || position === "bottom",
        "gb-border-l": position === "right" || position === "left",
      })}
      style={edgeStyles(domRect)[position]}
    ></div>
  );
};

const FloatingFrame: FC<{ parentElement: Element | null }> = ({
  parentElement,
}) => {
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
    </>
  );
};

export default FloatingFrame;
