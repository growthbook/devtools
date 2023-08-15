import React, { FC, useEffect, useState } from "react";

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
      <div
        gb-highlight-frame="true"
        className="gb-fixed gb-border-t-2 gb-z-max gb-border-indigo-600 gb-border-dashed"
        style={{
          top: domRect.top,
          left: domRect.left,
          height: "4px",
          width: domRect.width,
        }}
      ></div>
      <div
        gb-highlight-frame="true"
        className="gb-fixed gb-border-r-2 gb-z-max gb-border-indigo-600 gb-border-dashed"
        style={{
          top: domRect.top,
          left: domRect.left + domRect.width,
          height: domRect.height,
          width: "4px",
        }}
      ></div>
      <div
        gb-highlight-frame="true"
        className="gb-fixed gb-border-b-2 gb-z-max gb-border-indigo-600 gb-border-dashed"
        style={{
          top: domRect.top + domRect.height,
          left: domRect.left,
          height: "4px",
          width: domRect.width,
        }}
      ></div>
      <div
        gb-highlight-frame="true"
        className="gb-fixed gb-border-l-2 gb-z-max gb-border-indigo-600 gb-border-dashed"
        style={{
          top: domRect.top,
          left: domRect.left,
          height: domRect.height,
          width: "4px",
        }}
      ></div>
    </>
  );
};

export default FloatingFrame;
