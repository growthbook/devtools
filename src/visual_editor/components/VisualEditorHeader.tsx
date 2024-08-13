import React, { FC, ReactNode, useEffect, useState } from "react";
import { clsx } from "clsx";
import GBLogo from "../../../public/logo192.png";

// used to determine x y delta of mouse movement
let originX: number | undefined;
let originY: number | undefined;

const VisualEditorHeader: FC<{
  x: number;
  y: number;
  setX: (x: number) => void;
  setY: (y: number) => void;
  className?: string;
  reverseX?: boolean;
  reverseY?: boolean;
  children?: ReactNode;
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

  useEffect(() => {
    const onDrag = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const dx = clientX - originX!;
      const dy = clientY - originY!;
      setX(reverseX ? x - dx : x + dx);
      setY(reverseY ? y - dy : y + dy);
    };
    if (isDragging) document.body.addEventListener("mousemove", onDrag);
    return () => document.body.removeEventListener("mousemove", onDrag);
  }, [isDragging]);

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
      className={clsx("cursor-move", className)}
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
    >
      <div className="flex px-4 h-12 items-center justify-center rounded-t-xl logo-bg">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white">GrowthBook Visual Editor</div>
      </div>
    </div>
  );
};

export default VisualEditorHeader;
