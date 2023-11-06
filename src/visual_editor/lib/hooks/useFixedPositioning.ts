import { useState } from "react";

const useFixedPositioning = ({
  bottomAligned = false,
  rightAligned = false,
  x: _x,
  y: _y,
}: {
  bottomAligned?: boolean;
  rightAligned?: boolean;
  x: number;
  y: number;
}): {
  x: number;
  y: number;
  setX: (x: number) => void;
  setY: (y: number) => void;
  parentStyles: React.CSSProperties;
} => {
  const [x, setX] = useState(_x);
  const [y, setY] = useState(_y);
  return {
    x,
    y,
    setX,
    setY,
    parentStyles: {
      position: "fixed",
      [!bottomAligned ? "top" : "bottom"]: `${y}px`,
      [!rightAligned ? "left" : "right"]: `${x}px`,
    },
  };
};

export default useFixedPositioning;
