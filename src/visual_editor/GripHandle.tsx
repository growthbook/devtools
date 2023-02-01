import React, { FC, useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";

// used to determine x y delta of mouse movement
let originX: number | undefined;
let originY: number | undefined;

const GripHandle: FC<{
  x: number;
  y: number;
  setX: (x: number) => void;
  setY: (y: number) => void;
  className?: string;
  reverseX?: boolean;
  reverseY?: boolean;
}> = ({
  x,
  y,
  setX,
  setY,
  className = "",
  reverseX = false,
  reverseY = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // the following 1) useEffect and 2) useCallback need to be in this order
  // otherwise the mousemove event listener will not be removed
  useEffect(() => {
    if (isDragging) {
      document.body.addEventListener("mousemove", onDrag);
    } else {
      document.body.removeEventListener("mousemove", onDrag);
    }
    return () => document.body.removeEventListener("mousemove", onDrag);
  }, [isDragging]);

  const onDrag = useCallback(
    (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const dx = clientX - originX!;
      const dy = clientY - originY!;
      setX(reverseX ? x - dx : x + dx);
      setY(reverseY ? y - dy : y + dy);
    },
    [isDragging]
  );

  // for when the mouse leaves the page while dragging
  useEffect(() => {
    const mouseLeaveHandler = () => {
      setIsDragging(false);
    };
    document.body.addEventListener("mouseleave", mouseLeaveHandler);
    return () =>
      document.body.removeEventListener("mouseleave", mouseLeaveHandler);
  }, []);

  return (
    <div
      className={clsx("cursor-move bg-grip-handle", className)}
      onMouseDown={(e) => {
        e.preventDefault();
        originX = e.clientX;
        originY = e.clientY;
        setIsDragging(true);
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        originX = undefined;
        originY = undefined;
        setIsDragging(false);
      }}
    ></div>
  );
};

export default GripHandle;
