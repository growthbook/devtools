import React, { FC, useCallback, useEffect, useState } from "react";

// used to determine x y delta of mouse movement
let originX: number | undefined;
let originY: number | undefined;

const GripHandle: FC<{
  x: number;
  y: number;
  setX: (x: number) => void;
  setY: (y: number) => void;
}> = ({ x, y, setX, setY }) => {
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
      setX(x + dx);
      setY(y + dy);
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
      className="cursor-move w-4 bg-grip-handle"
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
